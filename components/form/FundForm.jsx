'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Block from '@/components/layout/Block'
import FormInput from '@/components/myui/FormInput'
import FormTextarea from '@/components/myui/FormTextarea'
import FormRadio from '@/components/myui/FormRadio'
import FileUploadField from '@/components/form/FileUploadField'
import Partners from '@/components/form/Partners'
import { Button } from '@/components/ui/button'
import { FUND_FORM_INITIAL } from '@/data/fund'
import toast from 'react-hot-toast'

// The form supports create and edit. If initialData provided => edit mode.
export default function FundForm({ initialData, onSubmit, isEdit = false }) {
    const { data: session } = useSession()
    const [formData, setFormData] = useState(FUND_FORM_INITIAL)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const originalAttachmentIdsRef = useRef([])

    const extractAttachmentIds = (arr) => {
        if (!Array.isArray(arr)) return []
        return arr
            .filter(a => a && (a.documentId || a.id))
            .map(a => Number(a.documentId ?? a.id))
            .filter(n => Number.isFinite(n) && n > 0)
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addWriter = () => {
        setFormData(prev => ({
            ...prev,
            writers: [...prev.writers, { fullName: '', department: '', faculty: '', phone: '', email: '' }]
        }))
    }

    const removeWriter = (index) => {
        setFormData(prev => ({
            ...prev,
            writers: prev.writers.filter((_, i) => i !== index)
        }))
    }

    const updateWriterField = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            writers: prev.writers.map((w, i) => i === index ? { ...w, [field]: value } : w)
        }))
    }

    const sanitize = (value) => {
        if (typeof value === 'bigint') return value.toString()
        if (Array.isArray(value)) return value.map(sanitize)
        if (value && typeof value === 'object') {
            const out = {}
            Object.keys(value).forEach(k => { out[k] = sanitize(value[k]) })
            return out
        }
        return value
    }

    const handleSubmit = async () => {
        if (!session?.jwt) {
            toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล')
            return
        }

        // Basic required: fundType
        if (formData.fundType === '') {
            toast.error('กรุณาเลือกประเภททุน')
            return
        }

        setIsSubmitting(true)
        try {
            // derive users_permissions_users from partners internal
            const users_permissions_users = Array.isArray(formData.partners)
                ? formData.partners
                    .filter(p => p.isInternal && (p.userID || p.User?.documentId || p.User?.id))
                    .map(p => p.userID || p.User?.documentId || p.User?.id)
                    .filter(Boolean)
                : []

            const attachmentIds = extractAttachmentIds(formData.attachments)
            const currentIdsSorted = [...attachmentIds].sort()
            const originalIdsSorted = [...originalAttachmentIdsRef.current].sort()
            const attachmentsChanged = JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted)

            const payload = {
                writers: formData.writers?.length ? formData.writers : [],
                fundType: formData.fundType === '' ? null : parseInt(formData.fundType),
                fundTypeText: formData.fundTypeText || null,
                contentDesc: formData.contentDesc || null,
                pastPublications: formData.pastPublications || null,
                purpose: formData.purpose || null,
                targetGroup: formData.targetGroup || null,
                chapterDetails: formData.chapterDetails || null,
                pages: formData.pages ? parseInt(formData.pages) : null,
                duration: formData.duration || null,
                references: formData.references || null,
                partners: formData.partners || [],
                attachments: attachmentIds,
                users_permissions_users: users_permissions_users.length ? users_permissions_users : undefined
            }

            // Remove null/empty string to reduce noise
            Object.keys(payload).forEach(k => {
                if (payload[k] === null || payload[k] === '') delete payload[k]
            })

            if (initialData && !attachmentsChanged) {
                delete payload.attachments
            }

            const safe = sanitize(payload)
            if (onSubmit) await onSubmit(safe)
        } catch (err) {
            console.error('Fund submit error:', err)
            toast.error('เกิดข้อผิดพลาด: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // hydrate edit data
    useEffect(() => {
        if (initialData) {
            const hydrated = { ...FUND_FORM_INITIAL, ...initialData }
            setFormData(hydrated)
            originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments)
        }
    }, [initialData])

    return (
        <Block>
            <div className='inputGroup'>
                {/* Writers Section */}
                <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                        <h3 className='font-semibold'>ผู้เขียน</h3>
                        <Button type='button' variant='outline' onClick={addWriter}>เพิ่มผู้เขียน</Button>
                    </div>
                    {formData.writers.map((w, idx) => (
                        <div key={idx} className=''>
                            <div className='space-y-2'>
                                <FormInput label='ชื่อ-นามสกุล' value={w.fullName} onChange={(e) => updateWriterField(idx, 'fullName', e.target.value)} />
                                <FormInput label='ภาควิชา' value={w.department} onChange={(e) => updateWriterField(idx, 'department', e.target.value)} />
                                <FormInput label='คณะ' value={w.faculty} onChange={(e) => updateWriterField(idx, 'faculty', e.target.value)} />
                                <FormInput label='โทรศัพท์' value={w.phone} onChange={(e) => updateWriterField(idx, 'phone', e.target.value)} />
                                <FormInput label='อีเมล' value={w.email} onChange={(e) => updateWriterField(idx, 'email', e.target.value)} />
                            </div>
                            <div className='flex justify-end my-3'>
                                <Button className="text-xs" type='button' variant='destructive' onClick={() => removeWriter(idx)}>ลบ</Button>
                            </div>
                        </div>
                    ))}
                </div>
                <FormRadio id='fundType' label='ลักษณะของผลงานวิชาการที่จะขอรับทุน' value={String(formData.fundType ?? '')} onChange={(e) => handleInputChange('fundType', e.target.value)} options={[
                    { value: '0', label: 'ตำรา ใช้สอนในรายวิชา' },
                    { value: '1', label: 'หนังสือ (ชื่อไทย และชื่อภาษาอังกฤษ)' }
                ]} />
                <FormInput id='fundTypeText' label='ข้อความประเภททุน (อัตโนมัติจาก radio หรือเพิ่มเอง)' value={formData.fundTypeText} onChange={(e) => handleInputChange('fundTypeText', e.target.value)} />
                <FormTextarea id='contentDesc' label='คำอธิบายเนื้อหาของตำราหรือหนังสือ' value={formData.contentDesc} onChange={(e) => handleInputChange('contentDesc', e.target.value)} rows={5} />
                <FormTextarea id='pastPublications' label='เอกสารทางวิชาการ ตำรา หรือ หนังสือ ที่ผู้ขอทุนเคยมีประสบการณ์แต่งมาแล้ว (ถ้ามีโปรดระบุ)' value={formData.pastPublications} onChange={(e) => handleInputChange('pastPublications', e.target.value)} rows={5} />
                <FormTextarea id='purpose' label='วัตถุประสงค์ของตำราหรือหนังสือ' value={formData.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} rows={5} />
                <FormTextarea id='targetGroup' label='กลุ่มเป้าหมายของตำราหรือหนังสือ' value={formData.targetGroup} onChange={(e) => handleInputChange('targetGroup', e.target.value)} rows={5} />
                <FormTextarea id='chapterDetails' label='การแบ่งบทและรายละเอียดในแต่ละบทของตำรา/หนังสือ' value={formData.chapterDetails} onChange={(e) => handleInputChange('chapterDetails', e.target.value)} rows={5} />
                <FormInput id='pages' type='number' label='ตำรา หรือ หนังสือ มีจำนวนประมาณ' value={formData.pages} onChange={(e) => handleInputChange('pages', e.target.value)} />
                <FormInput id='duration' type='date' label='ระยะเวลา (ปี หรือ เดือน) ที่จะใช้ในการเขียนประมาณ' value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)} />
                <FormTextarea id='references' label='รายชื่อหนังสือและเอกสารอ้างอิง (บรรณานุกรม) เพิ่มเติมความเหมาะสมได้' value={formData.references} onChange={(e) => handleInputChange('references', e.target.value)} rows={5} />



                <FileUploadField
                    label='เอกสารแนบ'
                    value={formData.attachments || []}
                    onFilesChange={(files) => handleInputChange('attachments', files)}
                />
                <Partners data={formData.partners} onChange={(partners) => handleInputChange('partners', partners)} />
            </div>
            <div className='flex justify-end items-center gap-3 mt-4'>
                <Button variant='outline' type='button'>ยกเลิก</Button>
                <Button variant='default' type='button' disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
            </div>
        </Block>
    )
}
