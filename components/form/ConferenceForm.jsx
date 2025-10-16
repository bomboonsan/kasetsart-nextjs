'use client';

import React from 'react';
import { Country, State, City } from 'country-state-city';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client/react";
import Block from '../layout/Block';
import FormInput from '@/components/myui/FormInput';
import FormInputSelect from '@/components/myui/FormInputSelect';
import FormRadio from '@/components/myui/FormRadio';
import FormTextarea from '@/components/myui/FormTextarea';
import FormDateSelect from '../myui/FormDateSelect';
import FormSelect from '../myui/FormSelect';
import Partners from "../form/Partners"
import FileUploadField from './FileUploadField';
import { Button } from '../ui/button';
import ProjectPicker from './ProjectPicker';
import { CONFERENCE_FORM_INITIAL, COST_TYPE_OPTIONS } from '@/data/confernce';
import { UPDATE_PROJECT_PARTNERS, CREATE_CONFERENCE } from '@/graphql/formQueries';
import { extractInternalUserIds } from '@/utils/partners';
import toast from 'react-hot-toast';

export default function ConferenceForm({ initialData, onSubmit, isEdit = false }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [formData, setFormData] = useState(CONFERENCE_FORM_INITIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingObj, setLoadingObj] = useState({});
    // เก็บค่า attachments เดิมตอน hydrate เพื่อเช็คการเปลี่ยนแปลงเวลา update
    const originalAttachmentIdsRef = useRef([]);

    // Safe extraction with null checks - optimized with useCallback
    const extractAttachmentIds = useCallback((arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .filter(a => a && (a.documentId || a.id))
            .map(a => Number(a.documentId ?? a.id))
            .filter(n => Number.isFinite(n) && n > 0);
    }, []);

    // Hydrate form data when editing with proper error handling
    useEffect(() => {
        if (initialData) {
            try {
                // Map the conference data to form structure with safe access
                const hydrated = {
                    ...CONFERENCE_FORM_INITIAL,
                    ...initialData,
                    // Map project relation if exists with null safety
                    __projectObj: initialData.projects?.[0] ? {
                        ...initialData.projects[0],
                        partners: Array.isArray(initialData.projects[0].partners) ? initialData.projects[0].partners : []
                    } : null,
                    // Ensure partners come from the linked project if available
                    partners: Array.isArray(initialData.projects?.[0]?.partners) ? initialData.projects[0].partners : [],
                };
                setFormData(hydrated);
                // บันทึกรายการ attachments เดิม (ใช้ภายหลังเพื่อตรวจว่ามีการแก้ไขไหม)
                originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments);
            } catch (error) {
                console.error('Error hydrating form data:', error);
                // Fallback to initial data to prevent crashes
                setFormData(CONFERENCE_FORM_INITIAL);
            }
        }
    }, [initialData, extractAttachmentIds]);

    // Memoize mutation options to prevent re-creation
    const mutationOptions = useMemo(() => ({
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    }), [session?.jwt]);

    const [updateProjectPartners] = useMutation(UPDATE_PROJECT_PARTNERS, {
        ...mutationOptions,
        onCompleted: (data) => {
        },
        onError: (error) => {
            console.error('Error updating project partners:', error);
        }
    });

    const [createConference] = useMutation(CREATE_CONFERENCE, {
        ...mutationOptions,
        onCompleted: (data) => {
        },
        onError: (error) => {
            console.error('Error creating conference:', error);
        }
    });

    // Memoized input change handler to prevent child re-renders
    const handleInputChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === 'partners') {
        }
        if (field === 'level' && value === '0') {
            setFormData((prev) => ({ ...prev, country: 'TH' }));
        }

        // Validate date range: ensure durationEnd is not before durationStart
        if (field === 'durationStart' && value) {
            setFormData((prev) => {
                const startDate = new Date(value);
                const endDate = prev.durationEnd ? new Date(prev.durationEnd) : null;

                // If end date exists and is before start date, set end date to match start date
                if (endDate && endDate < startDate) {
                    return { ...prev, durationStart: value, durationEnd: value };
                }
                return { ...prev, durationStart: value };
            });
        }

        if (field === 'durationEnd' && value) {
            setFormData((prev) => {
                const startDate = prev.durationStart ? new Date(prev.durationStart) : null;
                const endDate = new Date(value);

                // If end date is before start date, don't update (keep current end date)
                if (startDate && endDate < startDate) {
                    return prev;
                }
                return { ...prev, durationEnd: value };
            });
        }
    }, []);

    // Memoized submit handler with proper error handling
    const handleSubmit = useCallback(async () => {
        if (!session?.jwt) {
            toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }

        // Basic validation with null checks
        const titleTH = formData.titleTH?.trim?.() || '';
        const titleEN = formData.titleEN?.trim?.() || '';

        if (!titleTH && !titleEN) {
            toast.error('กรุณากรอกชื่อผลงานอย่างน้อย 1 ภาษา');
            return;
        }

        setIsSubmitting(true);

        try {
            // เตรียมข้อมูล attachments - ดึง ID ของไฟล์ที่อัปโหลดแล้ว with null safety
            const attachmentIds = Array.isArray(formData.attachments)
                ? formData.attachments
                    .filter(att => att && (att.id || att.documentId))
                    .map(att => Number(att.documentId || att.id))
                    .filter(id => Number.isFinite(id) && id > 0)
                : [];

            // ตรวจสอบรายการปัจจุบัน
            const currentIds = attachmentIds;
            const originalIdsSorted = [...(originalAttachmentIdsRef.current || [])].sort((a, b) => a - b);
            const currentIdsSorted = [...currentIds].sort((a, b) => a - b);
            const attachmentsChanged = JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted);

            // สร้างข้อมูล conference (อาจลบ field attachments ภายหลังหากไม่เปลี่ยนและเป็นการแก้ไข)
            const conferenceData = {
                titleTH: titleTH || null,
                titleEN: titleEN || null,
                isEnvironmentallySustainable: formData.isEnvironmentallySustainable || null,
                journalName: formData.journalName?.trim?.() || null,
                doi: formData.doi?.trim?.() || null,
                isbn: formData.isbn?.trim?.() || null,
                durationStart: formData.durationStart || null,
                durationEnd: formData.durationEnd || null,
                cost: formData.cost || null,
                costType: formData.costType || null,
                presentationWork: formData.presentationWork || null,
                presentType: formData.presentType || null,
                articleType: formData.articleType || null,
                abstractTH: formData.abstractTH?.trim?.() || null,
                abstractEN: formData.abstractEN?.trim?.() || null,
                summary: formData.summary?.trim?.() || null,
                level: formData.level || null,
                country: formData.country || null,
                state: formData.state || null,
                city: formData.city || null,
                fundName: formData.fundName?.trim?.() || null,
                keywords: formData.keywords?.trim?.() || null,
                // เก็บข้อมูล attachments ของ conference
                attachments: attachmentIds.length ? attachmentIds : [],
                // เชื่อมโยงกับ project ที่เลือก
                projects: formData.__projectObj?.documentId ? [formData.__projectObj.documentId] : []
            };

            // ลบค่า null ออกเพื่อไม่ให้เกิดปัญหา
            Object.keys(conferenceData).forEach(key => {
                if (conferenceData[key] === null || conferenceData[key] === "") {
                    delete conferenceData[key];
                }
            });

            // ถ้าเป็นการแก้ไข และ attachments ไม่ได้เปลี่ยน -> ลบ field ทิ้งเพื่อหลีกเลี่ยง error ของ Strapi
            if (isEdit && !attachmentsChanged) {
                delete conferenceData.attachments;
            } else if (isEdit && attachmentsChanged) {
                // เมื่อมีการเปลี่ยนแปลง attachments ในการแก้ไข ให้ส่งเฉพาะ ID ที่ valid
                // และตรวจสอบว่า attachments exist ใน Strapi หรือไม่
                console.log('Attachments changed. Sending IDs:', attachmentIds);

                // กรอง attachments ที่อาจมีปัญหา
                if (attachmentIds.length === 0) {
                    // ถ้าไม่มี attachments ใหม่ ให้ลบ field นี้ออก
                    delete conferenceData.attachments;
                }
            }


            // ถ้าเป็นการแก้ไข ให้เรียก onSubmit ที่ส่งมาจาก parent
            if (isEdit && onSubmit) {
                await onSubmit(conferenceData);
            } else {
                // สร้าง conference ใหม่
                const conferenceResult = await createConference({
                    variables: {
                        data: conferenceData
                    }
                });
                toast.success('บันทึกข้อมูลการประชุมสำเร็จแล้ว!');
                // Reset form only for create
                setFormData(CONFERENCE_FORM_INITIAL);
            }

            // อัปเดต partners ใน project ถ้ามีและถ้า partners มีการเปลี่ยนแปลง
            if (formData.__projectObj?.documentId && Array.isArray(formData.partners)) {
                const usersPermissionsUsers = Array.from(new Set(extractInternalUserIds(formData.partners)));

                await updateProjectPartners({
                    variables: {
                        documentId: formData.__projectObj.documentId,
                        data: {
                            partners: formData.partners,
                            users_permissions_users: usersPermissionsUsers
                        }
                    }
                });
            }

        } catch (error) {
            console.error('Submission error:', error);

            // ตรวจสอบว่าเป็น error เกี่ยวกับ attachments หรือไม่
            const errorMessage = error?.message || error?.graphQLErrors?.[0]?.message || 'ไม่ทราบสาเหตุ';

            if (errorMessage.includes('plugin::upload.file') && errorMessage.includes('do not exist')) {
                // ถ้าเป็น error เกี่ยวกับ attachment files ที่หายไป
                toast.error('เกิดข้อผิดพลาดเกี่ยวกับไฟล์แนบ: บางไฟล์อาจถูกลบไปแล้ว กรุณาอัปโหลดไฟล์ใหม่');

                // ลบ attachments ที่มีปัญหาออกจาก form data
                setFormData(prev => ({
                    ...prev,
                    attachments: []
                }));
            } else {
                toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [
        session?.jwt,
        formData,
        isEdit,
        onSubmit,
        createConference,
        updateProjectPartners
    ]);
    // Memoized country options with error handling
    const countryOptions = useMemo(() => {
        try {
            const all = Country.getAllCountries();
            if (!Array.isArray(all)) return [];
            return all.map((c) => ({
                value: c?.isoCode || '',
                label: c?.name || 'Unknown Country'
            }));
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    }, []);

    // Memoized state options with error handling
    const stateOptions = useMemo(() => {
        if (!formData.country) return [];
        try {
            const states = State.getStatesOfCountry(String(formData.country));
            if (!Array.isArray(states)) return [];
            return states.map((s) => ({
                value: s?.isoCode || '',
                label: s?.name || 'Unknown State'
            }));
        } catch (error) {
            console.error('Error fetching states for country:', formData.country, error);
            return [];
        }
    }, [formData.country]);

    // Memoized city options with error handling
    const cityOptions = useMemo(() => {
        if (!formData.country || !formData.state) return [];
        try {
            const cities = City.getCitiesOfState(
                String(formData.country),
                String(formData.state),
            );
            if (!Array.isArray(cities)) return [];
            return cities.map((c) => ({
                value: c?.name || '',
                label: c?.name || 'Unknown City'
            }));
        } catch (error) {
            console.error('Error fetching cities for country/state:', formData.country, formData.state, error);
            return [];
        }
    }, [formData.country, formData.state]);

    // Memoized project object to prevent unnecessary updates
    const projectObj = useMemo(() => formData.__projectObj, [formData.__projectObj]);

    // Safe useEffect with proper dependency and null checks
    useEffect(() => {
        if (!projectObj) return;

        try {
            // Only update if partners array exists and is different
            const newPartners = Array.isArray(projectObj.partners) ? projectObj.partners : [];
            const currentPartners = Array.isArray(formData.partners) ? formData.partners : [];

            // Compare arrays to prevent unnecessary updates
            if (JSON.stringify(newPartners) !== JSON.stringify(currentPartners)) {
                setFormData((prev) => ({
                    ...prev,
                    fundName: projectObj?.fundName || '',
                    partners: newPartners
                }));
            }
        } catch (error) {
            console.error('Error updating partners from project:', error);
        }
    }, [projectObj]);

    // Memoized safe value getters with null coalescing
    const safeFormValues = useMemo(() => ({
        titleTH: formData.titleTH ?? "",
        titleEN: formData.titleEN ?? "",
        isEnvironmentallySustainable: formData.isEnvironmentallySustainable ?? "",
        journalName: formData.journalName ?? "",
        doi: formData.doi ?? "",
        isbn: formData.isbn ?? "",
        durationStart: formData.durationStart ?? "",
        durationEnd: formData.durationEnd ?? "",
        cost: formData.cost ?? "",
        costType: formData.costType ?? "",
        presentationWork: formData.presentationWork ?? "",
        presentType: formData.presentType ?? "",
        articleType: formData.articleType ?? "",
        abstractTH: formData.abstractTH ?? "",
        abstractEN: formData.abstractEN ?? "",
        summary: formData.summary ?? "",
        level: formData.level ?? "",
        country: formData.country ?? "",
        state: formData.state ?? "",
        city: formData.city ?? "",
        fundName: formData.fundName ?? "",
        keywords: formData.keywords ?? "",
        attachments: Array.isArray(formData.attachments) ? formData.attachments : []
    }), [formData]);
    return (
        <>
            <Block>
                <div className="inputGroup">
                    <FormTextarea id="titleTH" label="ชื่อผลงาน (ไทย)" value={formData.titleTH ?? ""} onChange={(e) => handleInputChange('titleTH', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="titleEN" label="ชื่อผลงาน (อังกฤษ)" value={formData.titleEN ?? ""} onChange={(e) => handleInputChange('titleEN', e.target.value)} placeholder="" rows={5} />
                    <FormRadio id="isEnvironmentallySustainable" label="" value={formData.isEnvironmentallySustainable ?? ""} onChange={(e) => handleInputChange('isEnvironmentallySustainable', e.target.value)} options={[
                        { value: '0', label: 'เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                        { value: '1', label: 'ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                    ]} />
                    <FormTextarea id="journalName" label="ชื่อการประชุมทางวิชาการ (ใช้ชื่อไทยถ้าไม่มีชื่อไทยให้ใช้ภาษาอื่น)" value={formData.journalName ?? ""} onChange={(e) => handleInputChange('journalName', e.target.value)} placeholder="" rows={5} />
                    <ProjectPicker label="โครงการวิจัยที่เกี่ยวข้อง" required={false} selectedProject={formData.__projectObj} onSelect={(project) => handleInputChange('__projectObj', project)} />
                    <FormInput id="doi" label="DOI (ถ้าไม่มีให้ใส่ “-”) ความหมายของ DOI" value={formData.doi ?? ""} placeholder="กรอก DOI" onChange={(e) => handleInputChange('doi', e.target.value)} />
                    <FormInput id="isbn" label="ISBN (ป้อนอักษร 10 ตัว หรือ 13 ตัว ไม่ต้องใส่ “-”)" value={formData.isbn ?? ""} placeholder="กรอก ISBN" onChange={(e) => handleInputChange('isbn', e.target.value)} />
                    <FormDateSelect durationStart={formData.durationStart ?? ""} durationEnd={formData.durationEnd ?? ""} durationStartChange={(field, value) => handleInputChange(field, value)} durationEndChange={(field, value) => handleInputChange(field, value)} >
                        วัน/เดือน/ปี ที่นำเสนอ
                        <span className="text-red-500 ml-1">*</span>
                    </FormDateSelect>
                    <FormInputSelect id="cost" label="ค่าใช้จ่าย (Int)" value={formData.costType ?? ""} valueInput={formData.cost ?? ""} onInputChange={(value) => handleInputChange('cost', value)} onChange={(value) => handleInputChange('costType', value)} placeholder="กรุณาเลือก" options={COST_TYPE_OPTIONS} after="จาก" />
                    <FormRadio id="presentationWork" label="การนำเสนอผลงาน" value={formData.presentationWork} onChange={(e) => handleInputChange('presentationWork', e.target.value)} options={[
                        { value: '0', label: 'ได้รับเชิญ (Invited Paper.)' },
                        { value: '1', label: 'เสนอเอง' },
                    ]} />
                    <FormRadio id="presentType" label="ประเภทการนำเสนอ" value={formData.presentType} onChange={(e) => handleInputChange('presentType', e.target.value)} options={[
                        { value: '0', label: 'ภาคบรรยาย (Oral)' },
                        { value: '1', label: 'ภาคโปสเตอร์ (Poster)' },
                        { value: '2', label: 'เข้าร่วมประชุมวิชาการ' },
                    ]} />
                    <FormRadio id="articleType" label="ลักษณะของบทความ" value={formData.articleType} onChange={(e) => handleInputChange('articleType', e.target.value)} options={[
                        { value: '0', label: 'Abstract อย่างเดียว' },
                        { value: '1', label: 'เรื่องเต็ม' },
                    ]} />
                    <FormTextarea id="abstractTH" label="บทคัดย่อ (ไทย) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.abstractTH} onChange={(e) => handleInputChange('abstractTH', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="abstractEN" label="บทคัดย่อ (อังกฤษ) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.abstractEN} onChange={(e) => handleInputChange('abstractEN', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="summary" label="* กรณีเข้าร่วมประชุมวิชาการ สรุปเนื้อหาการประชุมแบบย่อ (ถ้าไม่มีข้อมูลให้ใส่ -)" value={formData.summary} onChange={(e) => handleInputChange('summary', e.target.value)} placeholder="" rows={5} />
                    <FileUploadField
                        label="เอกสารแนบ"
                        value={Array.isArray(formData.attachments) ? formData.attachments : []}
                        onFilesChange={(files) => handleInputChange('attachments', files)}
                    />
                    <FormRadio id="level" label="ระดับการนำเสนอ" value={formData.level} onChange={(e) => handleInputChange('level', e.target.value)} options={[
                        { value: '0', label: 'ระดับชาติ' },
                        { value: '1', label: 'ระดับนานาชาติ' },
                    ]} />
                    <FormSelect id="country" label="ประเทศ" disabled={formData.level == '0'} value={formData.country ?? ""} placeholder="เลือกประเทศ" onChange={(val) => handleInputChange('country', val)} options={countryOptions} />
                    <FormSelect id="state" label="มลรัฐ/จังหวัด" value={formData.state ?? ""} placeholder="เลือกมลรัฐ/จังหวัด" onChange={(val) => handleInputChange('state', val)} options={stateOptions} />
                    <FormSelect id="city" label="เมือง" value={formData.city ?? ""} placeholder="เลือกเมือง" onChange={(val) => handleInputChange('city', val)} options={cityOptions} />
                    <FormTextarea id="fundName" label="ชื่อแหล่งทุน" value={formData.fundName} onChange={(e) => handleInputChange('fundName', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="keywords" label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)" value={formData.keywords} onChange={(e) => handleInputChange('keywords', e.target.value)} placeholder="" rows={5} />
                </div>
            </Block>
            <Block className="mt-4">
                <Partners data={formData.partners} onChange={(partners) => handleInputChange('partners', partners)} />
            </Block>
            <div className='flex justify-end items-center gap-3 mt-4'>
                <Button onClick={() => router.back()} variant="outline">ยกเลิก</Button>
                <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </div>
        </>
    );
}