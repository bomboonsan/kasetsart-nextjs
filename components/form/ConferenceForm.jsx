'use client';

import React from 'react';
import { Country, State, City } from 'country-state-city';
import { useEffect, useMemo, useState } from 'react'
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
import { UPDATE_PROJECT_PARTNERS } from '@/graphql/formQueries';

export default function ConferenceForm({ }) {
    const { data: session } = useSession();
    const [formData, setFormData] = useState(CONFERENCE_FORM_INITIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [updateProjectPartners] = useMutation(UPDATE_PROJECT_PARTNERS, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        },
        onCompleted: (data) => {
            console.log('Project partners updated successfully:', data);
        },
        onError: (error) => {
            console.error('Error updating project partners:', error);
        }
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === 'partners') {
            console.log('Partners updated in ConferenceForm:', value);
        }
    };

    const handleSubmit = async () => {
        if (!session?.jwt) {
            alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }

        // Basic validation
        if (!formData.titleTH.trim() && !formData.titleEN.trim()) {
            alert('กรุณากรอกชื่อผลงานอย่างน้อย 1 ภาษา');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // สร้างข้อมูล conference (ในอนาคตถ้ามี API สำหรับ conference)
            const conferenceData = {
                titleTH: formData.titleTH.trim() || null,
                titleEN: formData.titleEN.trim() || null,
                isEnvironmentallySustainable: parseInt(formData.isEnvironmentallySustainable) || null,
                journalName: formData.journalName || null,
                doi: formData.doi || null,
                isbn: formData.isbn || null,
                durationStart: formData.durationStart || null,
                durationEnd: formData.durationEnd || null,
                cost: parseInt(formData.cost) || null,
                costType: formData.costType || null,
                presentationWork: formData.presentationWork || null,
                presentType: formData.presentType || null,
                articleType: formData.articleType || null,
                abstractTH: formData.abstractTH || null,
                abstractEN: formData.abstractEN || null,
                summary: formData.summary || null,
                level: formData.level || null,
                country: formData.country || null,
                state: formData.state || null,
                city: formData.city || null,
                fundName: formData.fundName || null,
                keywords: formData.keywords || null,
                // เก็บข้อมูล attachments ของ conference
                attachments: formData.attachments || []
            };

            console.log('Conference data:', conferenceData);

            // อัปเดต partners ใน project ถ้ามี
            if (formData.__projectObj?.documentId && formData.partners) {
                await updateProjectPartners({
                    variables: {
                        documentId: formData.__projectObj.documentId,
                        data: {
                            partners: formData.partners
                        }
                    }
                });
                console.log('Project partners updated successfully');
            }

            alert('บันทึกข้อมูลสำเร็จแล้ว!');
            // Reset form หรือ redirect ตามต้องการ
            // setFormData(CONFERENCE_FORM_INITIAL);
            
        } catch (error) {
            console.error('Submission error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.message || 'ไม่ทราบสาเหตุ'));
        } finally {
            setIsSubmitting(false);
        }
    };
    const countryOptions = useMemo(() => {
        try {
            const all = Country.getAllCountries() || [];
            return [
                ...all.map((c) => ({ value: c.isoCode, label: c.name })),
            ];
        } catch (e) {
            return [];
        }
    }, []);

    const stateOptions = useMemo(() => {
        if (!formData.country) return [];
        try {
            const states = State.getStatesOfCountry(String(formData.country)) || [];
            return [
                ...states.map((s) => ({ value: s.isoCode, label: s.name })),
            ];
        } catch (e) {
            return [];
        }
    }, [formData.country]);

    const cityOptions = useMemo(() => {
        if (!formData.country || !formData.state) return [];
        try {
            const cities = City.getCitiesOfState(
                String(formData.country),
                String(formData.state),
            ) || [];
            return [
                ...cities.map((c) => ({ value: c.name, label: c.name })),
            ];
        } catch (e) {
            return [];
        }
    }, [formData.country, formData.state]);

    useEffect(() => {
        if (!formData.__projectObj) return;
        setFormData((prev) => ({ ...prev, fundName: formData.__projectObj.fundName || "" }));
        setFormData((prev) => ({ ...prev, keywords: formData.__projectObj.keywords || "" }));
        setFormData((prev) => ({ ...prev, isEnvironmentallySustainable: formData.__projectObj.isEnvironmentallySustainable || "" }));
        setFormData((prev) => ({ ...prev, partners: formData.__projectObj.partners || [] }));
    }, [formData.__projectObj]);
    console.log('formData', formData);
    return (
        <>
            <Block> 
                <div className="inputGroup">
                    <FormTextarea id="titleTH" label="ชื่อผลงาน (ไทย)" value={formData.titleTH} onChange={(e) => handleInputChange('titleTH', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="titleEN" label="ชื่อผลงาน (อังกฤษ)" value={formData.titleEN} onChange={(e) => handleInputChange('titleEN', e.target.value)} placeholder="" rows={5} />
                    <FormRadio id="isEnvironmentallySustainable" label="" value={formData.isEnvironmentallySustainable} onChange={(e) => handleInputChange('isEnvironmentallySustainable', e.target.value)} options={[
                        { value: '0', label: 'เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                        { value: '1', label: 'ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
                    ]} />
                    <FormTextarea id="journalName" label="ชื่อการประชุมทางวิชาการ (ใช้ชื่อไทยถ้าไม่มีชื่อไทยให้ใช้ภาษาอื่น)" value={formData.journalName} onChange={(e) => handleInputChange('journalName', e.target.value)} placeholder="" rows={5} />
                    <ProjectPicker label="โครงการวิจัยที่เกี่ยวข้อง" required={false} selectedProject={formData.__projectObj} onSelect={(project) => handleInputChange('__projectObj', project)} />
                    <FormInput id="doi" label="DOI (ถ้าไม่มีให้ใส่ “-”) ความหมายของ DOI" value={formData.doi} placeholder="กรอก DOI" onChange={(e) => handleInputChange('doi', e.target.value)} />
                    <FormInput id="isbn" label="ISBN (ป้อนอักษร 10 ตัว หรือ 13 ตัว ไม่ต้องใส่ “-”)" value={formData.isbn} placeholder="กรอก ISBN" onChange={(e) => handleInputChange('isbn', e.target.value)} />
                    <FormDateSelect durationStart={formData.durationStart} durationEnd={formData.durationEnd} durationStartChange={(field, value) => handleInputChange(field, value)} durationEndChange={(field, value) => handleInputChange(field, value)} noDay >
                        วัน/เดือน/ปี ที่นำเสนอ
                        <span className="text-red-500 ml-1">*</span>
                    </FormDateSelect>
                    <FormInputSelect id="cost" label="ค่าใช้จ่าย (Int)" value={formData.costType} valueInput={formData.cost} onInputChange={(value) => handleInputChange('cost', value)} onChange={(value) => handleInputChange('costType', value)} placeholder="กรุณาเลือก" options={COST_TYPE_OPTIONS} after="จาก" />
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
                    <FormTextarea id="summary" label="บทคัดย่อ (อังกฤษ) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.summary} onChange={(e) => handleInputChange('summary', e.target.value)} placeholder="" rows={5} />
                    <FileUploadField
                        label="เอกสารแนบ"
                        value={formData.attachments}
                        onFilesChange={(files) => handleInputChange('attachments', files)}
                    />
                    <FormRadio id="level" label="ระดับการนำเสนอ" value={formData.level} onChange={(e) => handleInputChange('level', e.target.value)} options={[
                        { value: '0', label: 'ระดับชาติ' },
                        { value: '1', label: 'ระดับนานาชาติ' },
                    ]} />
                    <FormSelect id="country" label="ประเทศ" value={formData.country ?? ""} placeholder="เลือกประเทศ" onChange={(val) => handleInputChange('country', val)} options={countryOptions} />
                    <FormSelect id="state" label="มลรัฐ/จังหวัด" value={formData.state ?? ""} placeholder="เลือกมลรัฐ/จังหวัด" onChange={(val) => handleInputChange('state', val)} options={stateOptions} />
                    <FormSelect id="city" label="เมือง" value={formData.city ?? ""} placeholder="เลือกเมือง" onChange={(val) => handleInputChange('city', val)} options={cityOptions} />
                    <FormTextarea id="fundName" label="ชื่อแหล่งทุน" value={formData.fundName} onChange={(e) => handleInputChange('fundName', e.target.value)} placeholder="" rows={5} />
                    <FormTextarea id="keywords" label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)" value={formData.keywords} onChange={(e) => handleInputChange('keywords', e.target.value)} placeholder="" rows={5} />
                    <Partners data={formData.partners} onChange={(partners) => handleInputChange('partners', partners)} />
                </div>
            </Block>
            <div className='p-6'>
                <Button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </div>
        </>
    );
}