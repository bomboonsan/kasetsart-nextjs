'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client/react';
import Block from '../layout/Block';
import FormTextarea from '@/components/myui/FormTextarea';
import FormInput from '@/components/myui/FormInput';
import FormDoubleInput from '@/components/myui/FormDoubleInput';
import FormRadio from '@/components/myui/FormRadio';
import FormSelect from '@/components/myui/FormSelect';
import FormDateSelect from '../myui/FormDateSelect';
import FileUploadField from './FileUploadField';
import { Button } from '../ui/button';
import ProjectPicker from './ProjectPicker';
import Partners from './Partners'; // reuse if path; fallback to parent path
import { PUBLICATION_FORM_INITIAL, listsStandardScopus, listsStandardScopusSubset, listsStandardABDC, listsStandardAJG, listsStandardWebOfScience } from '@/data/publication';
import { CREATE_PUBLICATION, UPDATE_PUBLICATION, GET_PUBLICATION, UPDATE_PROJECT_PARTNERS } from '@/graphql/formQueries';
import { extractInternalUserIds } from '@/utils/partners';
import toast from 'react-hot-toast';

const PublicationForm = React.memo(function PublicationForm({ initialData, onSubmit, isEdit = false }) {
    const router = useRouter(); const { data: session } = useSession();
    const [isHydrated, setIsHydrated] = useState(false);
    const [formData, setFormData] = useState(PUBLICATION_FORM_INITIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const originalAttachmentIdsRef = useRef([]);

    // Handle hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Memoize helper functions
    const extractAttachmentIds = useCallback((arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .filter(a => a && (a.documentId || a.id))
            .map(a => Number(a.documentId ?? a.id))
            .filter(n => Number.isFinite(n) && n > 0);
    }, []);

    const booleanToString = useCallback((v) => {
        if (v === true || v === 'true' || v === 1 || v === '1') return "1";
        if (v === false || v === 'false' || v === 0 || v === '0') return "0";
        return null;
    }, []);

    const coerceBoolean = useCallback((v) => {
        if (v === true || v === 'true' || v === 1 || v === '1') return true;
        if (v === false || v === 'false' || v === 0 || v === '0') return false;
        return null;
    }, []);

    const toSelectOptions = useCallback((arr) => (arr || []).map(o => ({ value: String(o.value), label: o.label })), []);

    useEffect(() => {
        if (initialData && isHydrated) {
            // Helper function to normalize date for noDay mode
            const normalizeDateForNoDay = (dateStr) => {
                if (!dateStr) return '';
                // If date is YYYY-MM-DD, convert to YYYY-MM-01 for consistent display
                const match = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
                if (match) {
                    return `${match[1]}-${match[2]}-01`;
                }
                return dateStr;
            };

            const hydrated = {
                ...PUBLICATION_FORM_INITIAL,
                ...initialData,
                __projectObj: initialData.projects?.[0] ? {
                    ...initialData.projects[0],
                    partners: initialData.projects[0].partners || []
                } : null,
                partners: initialData.projects?.[0]?.partners || [],
                // Normalize dates to YYYY-MM-01 format for noDay mode
                durationStart: normalizeDateForNoDay(initialData.durationStart),
                durationEnd: normalizeDateForNoDay(initialData.durationEnd),
            };
            setFormData(hydrated);
            originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments);
        }
    }, [initialData, extractAttachmentIds, isHydrated]);

    const [createPublication] = useMutation(CREATE_PUBLICATION, {
        context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } },
    });

    const [updatePublication] = useMutation(UPDATE_PUBLICATION, {
        context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } },
    });

    const [updateProjectPartners] = useMutation(UPDATE_PROJECT_PARTNERS, {
        context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } },
        onCompleted: (data) => {
        },
        onError: (error) => {
            console.error('Error updating project partners:', error);
        }
    });

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!session?.jwt) {
            toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }
        if (!formData.titleTH.trim() && !formData.titleEN.trim()) {
            toast.error('กรุณากรอกชื่อผลงานอย่างน้อย 1 ภาษา');
            return;
        }
        setIsSubmitting(true);
        try {
            const attachmentIds = extractAttachmentIds(formData.attachments);
            const originalIdsSorted = [...originalAttachmentIdsRef.current].sort();
            const currentIdsSorted = [...attachmentIds].sort();
            const attachmentsChanged = JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted);

            // Helper function to ensure date format is YYYY-MM-01 for noDay mode
            const ensureDateFormat = (dateStr) => {
                if (!dateStr) return null;
                // Ensure the date is in YYYY-MM-01 format (day is always 01)
                const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (match) {
                    return `${match[1]}-${match[2]}-01`;
                }
                return dateStr;
            };

            const data = {
                titleTH: formData.titleTH?.trim() || null,
                titleEN: formData.titleEN?.trim() || null,
                isEnvironmentallySustainable: booleanToString(formData.isEnvironmentallySustainable),
                journalName: formData.journalName || null,
                doi: formData.doi || null,
                isbn: formData.isbn || null,
                volume: formData.volume || null,
                issue: formData.issue || null,
                durationStart: ensureDateFormat(formData.durationStart),
                durationEnd: ensureDateFormat(formData.durationEnd),
                pageStart: formData.pageStart || null,
                pageEnd: formData.pageEnd || null,
                level: formData.level || null,
                isJournalDatabase: booleanToString(formData.isJournalDatabase),
                isScopus: coerceBoolean(formData.isScopus),
                scopusType: formData.scopusType || null,
                scopusValue: formData.scopusValue || null,
                isACI: coerceBoolean(formData.isACI),
                isABDC: coerceBoolean(formData.isABDC),
                abdcType: formData.abdcType || null,
                isTCI1: coerceBoolean(formData.isTCI1),
                isTCI2: coerceBoolean(formData.isTCI2),
                isAJG: coerceBoolean(formData.isAJG),
                ajgType: formData.ajgType || null,
                isSSRN: coerceBoolean(formData.isSSRN),
                isWOS: coerceBoolean(formData.isWOS),
                wosType: formData.wosType || null,
                fundName: formData.fundName || null,
                keywords: formData.keywords || null,
                abstractTH: formData.abstractTH || null,
                abstractEN: formData.abstractEN || null,
                projects: formData.__projectObj?.documentId ? [formData.__projectObj.documentId] : [],
                attachments: attachmentIds.length ? attachmentIds : [],
            };
            Object.keys(data).forEach(k => { if (data[k] === null || data[k] === '') delete data[k]; });
            if (isEdit && !attachmentsChanged) delete data.attachments;


            if (isEdit && onSubmit) {
                await onSubmit(data);
            } else if (isEdit) {
                await updatePublication({ variables: { documentId: initialData.documentId, data } });
            } else if (onSubmit) {
                await onSubmit(data);
            } else {
                await createPublication({ variables: { data } });
                toast.success('บันทึกผลงานตีพิมพ์สำเร็จแล้ว!');
                setFormData(PUBLICATION_FORM_INITIAL);
            }

            // Update project partners if project is selected and partners provided
            try {
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
            } catch (err) {
                // Log but don't block main flow
                console.error('Failed to update project partners from PublicationForm:', err);
            }
        } catch (e) {
            console.error('Publication submit error:', e);
            toast.error('เกิดข้อผิดพลาด: ' + (e.message || 'ไม่ทราบสาเหตุ'));
        } finally {
            setIsSubmitting(false);
        }
    }, [session?.jwt, formData, isEdit, onSubmit, initialData?.documentId, extractAttachmentIds, booleanToString, coerceBoolean, updatePublication, createPublication, updateProjectPartners]);

    // Helpers - Memoized select options
    const scopusQuartileOptions = useMemo(() => toSelectOptions(listsStandardScopus), [toSelectOptions]);
    const scopusSubjectOptions = useMemo(() => toSelectOptions(listsStandardScopusSubset), [toSelectOptions]);
    const abdcOptions = useMemo(() => toSelectOptions(listsStandardABDC), [toSelectOptions]);
    const ajgOptions = useMemo(() => toSelectOptions(listsStandardAJG), [toSelectOptions]);
    const wosOptions = useMemo(() => toSelectOptions(listsStandardWebOfScience), [toSelectOptions]);

    // Memoized radio button options
    const environmentalSustainabilityOptions = useMemo(() => [
        { value: '0', label: 'เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' },
        { value: '1', label: 'ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' }
    ], []);

    const levelOptions = useMemo(() => [
        { value: '0', label: 'ระดับชาติ' },
        { value: '1', label: 'ระดับนานาชาติ' }
    ], []);

    const journalDatabaseOptions = useMemo(() => [
        { value: '0', label: 'วารสารที่อยู่ในฐานข้อมูล' },
        { value: '1', label: 'วารสารที่ไม่อยู่ในฐานข้อมูล' }
    ], []);

    const handleStandardToggle = useCallback((field, checked) => {
        handleInputChange(field, checked ? 1 : 0);
        // reset dependent selects when toggled off
        if (!checked) {
            if (field === 'isScopus') {
                handleInputChange('scopusType', '');
                handleInputChange('scopusValue', '');
            }
            if (field === 'isABDC') handleInputChange('abdcType', '');
            if (field === 'isAJG') handleInputChange('ajgType', '');
            if (field === 'isWOS') handleInputChange('wosType', '');
        }
    }, [handleInputChange]);

    // Memoized callback functions for commonly used form field changes
    const handleProjectSelect = useCallback((project) => {
        setFormData(prev => ({
            ...prev,
            __projectObj: project ?? null,
            fundName: project?.fundName || '',
            partners: Array.isArray(project?.partners) ? project.partners : [],
        }));
    }, [setFormData]);

    const handlePartnersChange = useCallback((partners) => {
        handleInputChange('partners', partners);
    }, [handleInputChange]);

    const handleFilesChange = useCallback((files) => {
        handleInputChange('attachments', files);
    }, [handleInputChange]);

    // Memoized select field onChange handlers
    const handleScopusValueChange = useCallback((val) => {
        handleInputChange('scopusValue', val);
    }, [handleInputChange]);

    const handleScopusTypeChange = useCallback((val) => {
        handleInputChange('scopusType', val);
    }, [handleInputChange]);

    const handleAbdcTypeChange = useCallback((val) => {
        handleInputChange('abdcType', val);
    }, [handleInputChange]);

    const handleAjgTypeChange = useCallback((val) => {
        handleInputChange('ajgType', val);
    }, [handleInputChange]);

    const handleWosTypeChange = useCallback((val) => {
        handleInputChange('wosType', val);
    }, [handleInputChange]);

    // Memoized computed values
    const attachmentsArray = useMemo(() => {
        return Array.isArray(formData.attachments) ? formData.attachments : [];
    }, [formData.attachments]);


    if (isEdit && !initialData) return <div className="p-6">Loading...</div>;

    // Prevent hydration mismatch by not rendering complex form until hydrated
    if (!isHydrated) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <>
            <Block>
                <div className="inputGroup">
                    <FormTextarea id="titleTH" label="ชื่อผลงาน (ไทย)" value={formData.titleTH} onChange={e => handleInputChange('titleTH', e.target.value)} rows={5} />
                    <FormTextarea id="titleEN" label="ชื่อผลงาน (อังกฤษ)" value={formData.titleEN} onChange={e => handleInputChange('titleEN', e.target.value)} rows={5} />
                    <FormRadio id="isEnvironmentallySustainable" label="" value={formData.isEnvironmentallySustainable} onChange={e => handleInputChange('isEnvironmentallySustainable', e.target.value)} options={environmentalSustainabilityOptions} />
                    <FormTextarea id="journalName" label="ชื่อวารสาร/แหล่งตีพิมพ์" value={formData.journalName} onChange={e => handleInputChange('journalName', e.target.value)} rows={3} />
                    <ProjectPicker label="โครงการวิจัยที่เกี่ยวข้อง" required={false} selectedProject={formData.__projectObj} onSelect={handleProjectSelect} />
                    <FormInput id="doi" label="DOI (ถ้าไม่มีให้ใส่ “-”)" value={formData.doi} onChange={e => handleInputChange('doi', e.target.value)} />
                    <FormInput id="isbn" label="ISSN (ถ้ามี)" value={formData.isbn} onChange={e => handleInputChange('isbn', e.target.value)} />
                    <FormDoubleInput id="pages" label="" before="ปีที่ (Volume)" after="ฉบับที่ (Issue)" value1={formData.volume} onChange1={e => handleInputChange('volume', e.target.value)} value2={formData.issue} onChange2={e => handleInputChange('issue', e.target.value)} />
                    <FormDateSelect durationStart={formData.durationStart} durationEnd={formData.durationEnd} durationStartChange={(f, v) => handleInputChange(f, v)} durationEndChange={(f, v) => handleInputChange(f, v)} noDay={true}>
                        วัน/เดือน/ปี ที่ตีพิมพ์
                    </FormDateSelect>
                    <FormDoubleInput id="pages" label="จากหน้า" before="" after="ถึง" value1={formData.pageStart} onChange1={e => handleInputChange('pageStart', e.target.value)} value2={formData.pageEnd} onChange2={e => handleInputChange('pageEnd', e.target.value)} />
                    <FormRadio id="level" label="ระดับตีพิมพ์" value={formData.level} onChange={e => handleInputChange('level', e.target.value)} options={levelOptions} />
                    <FormRadio id="isJournalDatabase" label="ฐานข้อมูล" disabled={formData.level == ''} value={formData.level == '' ? '' : formData.isJournalDatabase} onChange={e => handleInputChange('isJournalDatabase', e.target.value)} options={journalDatabaseOptions} />
                    {/* Standards Section */}
                    <div className="space-y-1 flex flex-wrap items-center forminput">
                        <div className="w-1/3">ดัชนี / มาตรฐานวารสาร</div>
                        <div className="grid grid-cols-2 gap-3 text-sm w-2/3">
                            <label className={formData.level == "0" ? "hidden" : "flex flex-wrap items-center gap-2"}>
                                <input disabled={formData.isJournalDatabase == '1'} type="checkbox" checked={!!formData.isScopus && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isScopus', e.target.checked)} />
                                <span>Scopus</span>
                                <div className='w-full'>
                                    {formData.isScopus && formData.isJournalDatabase == '0' ? (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormSelect id="scopusValue" label="" value={formData.scopusValue || ''} placeholder="เลือก Quartile" onChange={handleScopusValueChange} options={scopusQuartileOptions} />
                                            <FormSelect id="scopusType" label="" value={formData.scopusType || ''} placeholder="เลือกสาขา" onChange={handleScopusTypeChange} options={scopusSubjectOptions} />
                                        </div>
                                    ) : null}
                                </div>
                            </label>
                            <label className="flex flex-wrap items-center gap-2">
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isACI && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isACI', e.target.checked)} />
                                <span>ACI</span>
                            </label>
                            <label className="flex flex-wrap items-center gap-2">
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isTCI1 && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isTCI1', e.target.checked)} />
                                <span>TCI1</span>
                            </label>
                            <label className={formData.level == "0" ? "hidden" : "flex flex-wrap items-center gap-2"}>
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isABDC && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isABDC', e.target.checked)} />
                                <span>ABDC</span>
                                <div className='w-full'>
                                    {formData.isABDC && formData.isJournalDatabase == '0' ? (
                                        <FormSelect id="abdcType" label="" value={formData.abdcType || ''} placeholder="เลือกระดับ" onChange={handleAbdcTypeChange} options={abdcOptions} />
                                    ) : null}
                                </div>
                            </label>
                            <label className="flex flex-wrap items-center gap-2">
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isTCI2 && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isTCI2', e.target.checked)} />
                                <span>TCI2</span>
                            </label>
                            <label className={formData.level == "0" ? "hidden" : "flex flex-wrap items-center gap-2"}>
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isAJG && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isAJG', e.target.checked)} />
                                <span>AJG</span>
                                <div className='w-full'>
                                    {formData.isAJG && formData.isJournalDatabase == '0' ? (
                                        <FormSelect id="ajgType" label="" value={formData.ajgType || ''} placeholder="เลือกระดับ" onChange={handleAjgTypeChange} options={ajgOptions} />
                                    ) : null}
                                </div>
                            </label>
                            <label className={formData.level == "0" ? "hidden" : "flex flex-wrap items-center gap-2"}>
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isSSRN && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isSSRN', e.target.checked)} />
                                <span>SSRN</span>
                            </label>
                            <label className={formData.level == "0" ? "hidden" : "flex flex-wrap items-center gap-2"}>
                                <input type="checkbox" disabled={formData.isJournalDatabase == '1'} checked={!!formData.isWOS && formData.isJournalDatabase == '0'} onChange={e => handleStandardToggle('isWOS', e.target.checked)} />
                                <span>Web of Science</span>
                                <div className='w-full'>
                                    {formData.isWOS && formData.isJournalDatabase == '0' ? (
                                        <FormSelect id="wosType" label="" value={formData.wosType || ''} placeholder="เลือกประเภท" onChange={handleWosTypeChange} options={wosOptions} />
                                    ) : null}
                                </div>
                            </label>
                        </div>

                    </div>

                    <FormTextarea id="fundName" label="ชื่อแหล่งทุน" value={formData.fundName} onChange={e => handleInputChange('fundName', e.target.value)} rows={3} />
                    <FormTextarea id="keywords" label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)" value={formData.keywords} onChange={e => handleInputChange('keywords', e.target.value)} rows={3} />
                    <FormTextarea id="abstractTH" label="บทคัดย่อ (ไทย) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.abstractTH} onChange={e => handleInputChange('abstractTH', e.target.value)} rows={4} />
                    <FormTextarea id="abstractEN" label="บทคัดย่อ (อังกฤษ) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.abstractEN} onChange={e => handleInputChange('abstractEN', e.target.value)} rows={4} />
                    <FileUploadField label="ส่งไฟล์บทความทางวิชาการ (ขอให้ Scan หน้าปกวารสาร สารบัญ พร้อมบทความ เพื่อการตรวจสอบหลักฐาน)" value={attachmentsArray} onFilesChange={handleFilesChange} />
                    {/* Partners (reuse component) */}
                </div>
            </Block>
            <Block className="mt-4">
                <Partners data={formData.partners} onChange={handlePartnersChange} />
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
});

export default PublicationForm;
