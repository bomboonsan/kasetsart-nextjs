'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery } from '@apollo/client/react';
import Block from '../layout/Block';
import FormTextarea from '@/components/myui/FormTextarea';
import FormInput from '@/components/myui/FormInput';
import FormDoubleInput from '@/components/myui/FormDoubleInput';
import FormRadio from '@/components/myui/FormRadio';
import FormDateSelect from '../myui/FormDateSelect';
import FileUploadField from './FileUploadField';
import { Button } from '../ui/button';
import ProjectPicker from './ProjectPicker';
import Partners from './Partners'; // reuse if path; fallback to parent path
import { PUBLICATION_FORM_INITIAL } from '@/data/publication';
import { CREATE_PUBLICATION, UPDATE_PUBLICATION, GET_PUBLICATION } from '@/graphql/formQueries';

/*
  NOTE: Pattern follows ConferenceForm / ProjectForm
  - Hydrate initial data
  - Track original attachments to avoid sending unchanged array on update
*/

export default function PublicationForm({ initialData, onSubmit, isEdit = false }) {
    const { data: session } = useSession();
    const [formData, setFormData] = useState(PUBLICATION_FORM_INITIAL);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const originalAttachmentIdsRef = useRef([]);

    const extractAttachmentIds = (arr) => Array.isArray(arr)
        ? arr.filter(a => a && (a.id || a.documentId)).map(a => String(a.documentId || a.id))
        : [];

    useEffect(() => {
        if (initialData) {
            const hydrated = {
                ...PUBLICATION_FORM_INITIAL,
                ...initialData,
                __projectObj: initialData.projects?.[0] ? {
                    ...initialData.projects[0],
                    partners: initialData.projects[0].partners || []
                } : null,
                partners: initialData.projects?.[0]?.partners || [],
            };
            setFormData(hydrated);
            originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments);
        }
    }, [initialData]);

    const [createPublication] = useMutation(CREATE_PUBLICATION, {
        context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } },
    });

    const [updatePublication] = useMutation(UPDATE_PUBLICATION, {
        context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } },
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!session?.jwt) {
            alert('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
            return;
        }
        if (!formData.titleTH.trim() && !formData.titleEN.trim()) {
            alert('กรุณากรอกชื่อผลงานอย่างน้อย 1 ภาษา');
            return;
        }
        setIsSubmitting(true);
        try {
            const attachmentIds = extractAttachmentIds(formData.attachments);
            const originalIdsSorted = [...originalAttachmentIdsRef.current].sort();
            const currentIdsSorted = [...attachmentIds].sort();
            const attachmentsChanged = JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted);

            const data = {
                titleTH: formData.titleTH?.trim() || null,
                titleEN: formData.titleEN?.trim() || null,
                isEnvironmentallySustainable: formData.isEnvironmentallySustainable ?? null,
                journalName: formData.journalName || null,
                doi: formData.doi || null,
                isbn: formData.isbn || null,
                volume: formData.volume || null,
                issue: formData.issue || null,
                durationStart: formData.durationStart || null,
                durationEnd: formData.durationEnd || null,
                pageStart: formData.pageStart || null,
                pageEnd: formData.pageEnd || null,
                level: formData.level || null,
                isJournalDatabase: formData.isJournalDatabase || null,
                isScopus: formData.isScopus || null,
                scopusType: formData.scopusType || null,
                scopusValue: formData.scopusValue || null,
                isACI: formData.isACI || null,
                isABDC: formData.isABDC || null,
                abdcType: formData.abdcType || null,
                isTCI1: formData.isTCI1 || null,
                isTCI2: formData.isTCI2 || null,
                isAJG: formData.isAJG || null,
                ajgType: formData.ajgType || null,
                isSSRN: formData.isSSRN || null,
                isWOS: formData.isWOS || null,
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
                alert('บันทึกผลงานตีพิมพ์สำเร็จแล้ว!');
                setFormData(PUBLICATION_FORM_INITIAL);
            }
        } catch (e) {
            console.error('Publication submit error:', e);
            alert('เกิดข้อผิดพลาด: ' + (e.message || 'ไม่ทราบสาเหตุ'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Block>
                <div className="inputGroup">
                    <FormTextarea id="titleTH" label="ชื่อผลงาน (ไทย)" value={formData.titleTH} onChange={e => handleInputChange('titleTH', e.target.value)} rows={5} />
                    <FormTextarea id="titleEN" label="ชื่อผลงาน (อังกฤษ)" value={formData.titleEN} onChange={e => handleInputChange('titleEN', e.target.value)} rows={5} />
                    <FormRadio id="isEnvironmentallySustainable" label="" value={formData.isEnvironmentallySustainable} onChange={e => handleInputChange('isEnvironmentallySustainable', e.target.value)} options={[{ value: '0', label: 'เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' }, { value: '1', label: 'ไม่เกี่ยวข้อง กับสิ่งแวดล้อมและความยั่งยืน' }]} />
                    <FormTextarea id="journalName" label="ชื่อวารสาร/แหล่งตีพิมพ์" value={formData.journalName} onChange={e => handleInputChange('journalName', e.target.value)} rows={3} />
                    <ProjectPicker label="โครงการวิจัยที่เกี่ยวข้อง" required={false} selectedProject={formData.__projectObj} onSelect={(project) => handleInputChange('__projectObj', project)} />
                    <FormInput id="doi" label="DOI (ถ้าไม่มีให้ใส่ “-”)" value={formData.doi} onChange={e => handleInputChange('doi', e.target.value)} />
                    <FormInput id="isbn" label="ISSN (ถ้ามี)" value={formData.isbn} onChange={e => handleInputChange('isbn', e.target.value)} />
                    <FormDoubleInput id="pages" label="" before="ปีที่ (Volume)" after="ฉบับที่ (Issue)" value1={formData.volume} onChange1={e => handleInputChange('volume', e.target.value)} value2={formData.issue} onChange2={e => handleInputChange('issue', e.target.value)} />
                    <FormDateSelect durationStart={formData.durationStart} durationEnd={formData.durationEnd} durationStartChange={(f, v) => handleInputChange(f, v)} durationEndChange={(f, v) => handleInputChange(f, v)} noDay={true}>
                        วัน/เดือน/ปี ที่ตีพิมพ์
                    </FormDateSelect>
                    <FormDoubleInput id="pages" label="จากหน้า" before="" after="ถึง" value1={formData.pageStart} onChange1={e => handleInputChange('pageStart', e.target.value)} value2={formData.pageEnd} onChange2={e => handleInputChange('pageEnd', e.target.value)} />
                    <FormRadio id="level" label="ระดับ" value={formData.level} onChange={e => handleInputChange('level', e.target.value)} options={[{ value: '0', label: 'ระดับชาติ' }, { value: '1', label: 'ระดับนานาชาติ' }]} />
                    <FormRadio id="isJournalDatabase" label="ฐานข้อมูล" value={formData.isJournalDatabase} onChange={e => handleInputChange('isJournalDatabase', e.target.value)} options={[{ value: '0', label: 'วารสารที่อยู่ในฐานข้อมูล' }, { value: '1', label: 'วารสารที่ไม่อยู่ในฐานข้อมูล' }]} />
                    {/* Checklist like flags (simplified as radios/checkbox pattern could be custom later) */}
                    <div className="space-y-1 flex items-center forminput">
                        <div className="w-1/3">
                        </div>
                        <div className="flex-1 space-x-3">
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-5 text-sm">
                                    {['Scopus', 'ACI', 'TCI1', 'ABDC', 'TCI2', 'AJG', 'Social Science Research Network', 'Web of Science'].map(key => (
                                        <label key={key} className="flex items-center gap-2">
                                            <input type="checkbox" checked={!!formData[key]} onChange={e => handleInputChange(key, e.target.checked ? 1 : 0)} />
                                            <span>{key.replace('is', '')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <FormTextarea id="fundName" label="ชื่อแหล่งทุน" value={formData.fundName} onChange={e => handleInputChange('fundName', e.target.value)} rows={3} />
                    <FormTextarea id="keywords" label="คำสำคัญ (คั่นระหว่างคำด้วยเครื่องหมาย “;” เช่น ข้าว; พืช; อาหาร)" value={formData.keywords} onChange={e => handleInputChange('keywords', e.target.value)} rows={3} />
                    <FormTextarea id="abstractTH" label="บทคัดย่อ (ไทย) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.abstractTH} onChange={e => handleInputChange('abstractTH', e.target.value)} rows={4} />
                    <FormTextarea id="abstractEN" label="บทคัดย่อ (อังกฤษ) (ไม่มีข้อมูลให้ใส่ “-”)" value={formData.abstractEN} onChange={e => handleInputChange('abstractEN', e.target.value)} rows={4} />
                    <FileUploadField label="ส่งไฟล์บทความทางวิชาการ (ขอให้ Scan หน้าปกวารสาร สารบัญ พร้อมบทความ เพื่อการตรวจสอบหลักฐาน)" value={Array.isArray(formData.attachments) ? formData.attachments : []} onFilesChange={files => handleInputChange('attachments', files)} />
                    {/* Partners (reuse component) */}
                    <Partners data={formData.partners} onChange={(partners) => handleInputChange('partners', partners)} />
                </div>
            </Block>
            <div className='p-6'>
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </div>
        </>
    );
}
