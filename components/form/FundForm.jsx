'use client'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'
import Block from '@/components/layout/Block'
import FormInput from '@/components/myui/FormInput'
import FormTextarea from '@/components/myui/FormTextarea'
import FormRadio from '@/components/myui/FormRadio'
import FileUploadField from '@/components/form/FileUploadField'
import Partners from '@/components/form/Partners'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FUND_FORM_INITIAL } from '@/data/fund'
import toast from 'react-hot-toast'

import { extractInternalUserIds, normalizeDocumentId } from '@/utils/partners'

// Memoized Writer Form Component to prevent unnecessary re-renders
const WriterForm = React.memo(({ index, writer, handlers }) => {
    const { updateWriterField, removeWriter } = handlers

    const handleFieldChange = useCallback((field, value) => {
        updateWriterField(index, field, value)
    }, [index, updateWriterField])

    const handleRemove = useCallback(() => {
        removeWriter(index)
    }, [index, removeWriter])

    return (
        <div className=''>
            <div className='space-y-2'>
                <FormInput
                    label='ชื่อ-นามสกุล'
                    value={writer?.fullName || ''}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                />
                <FormInput
                    label='ภาควิชา'
                    value={writer?.department || ''}
                    onChange={(e) => handleFieldChange('department', e.target.value)}
                />
                <FormInput
                    label='คณะ'
                    value={writer?.faculty || ''}
                    onChange={(e) => handleFieldChange('faculty', e.target.value)}
                />
                <FormInput
                    label='โทรศัพท์'
                    value={writer?.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                />
                <FormInput
                    label='อีเมล'
                    value={writer?.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                />
            </div>
            <div className='flex justify-end my-3'>
                <Button className="text-xs" type='button' variant='destructive' onClick={handleRemove}>
                    ลบ
                </Button>
            </div>
        </div>
    )
})

// The form supports create and edit. If initialData provided => edit mode.
export default function FundForm({ initialData, onSubmit, isEdit = false }) {
    const router = useRouter()
    const { data: session } = useSession()
    const [formData, setFormData] = useState(FUND_FORM_INITIAL)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const originalAttachmentIdsRef = useRef([])

    // Memoize expensive operations
    const extractAttachmentIds = useCallback((arr) => {
        if (!Array.isArray(arr)) return []
        const ids = []
        for (const attachment of arr) {
            // Skip if attachment is null/undefined or doesn't have valid structure
            if (!attachment || typeof attachment !== 'object') continue

            const rawId = attachment?.documentId ?? attachment?.id
            const normalized = normalizeDocumentId(rawId)

            // Accept both numeric IDs and string UUIDs (Strapi v5 uses UUID strings)
            if (normalized && normalized.length > 0) {
                const numericId = Number(normalized)
                const isNumeric = Number.isFinite(numericId) && numericId > 0
                const isUUID = typeof normalized === 'string' && normalized.length > 5

                if (isNumeric || isUUID) {
                    ids.push(normalized)
                }
            }
        }
        return Array.from(new Set(ids))
    }, [])

    const sanitize = useCallback((value) => {
        if (typeof value === 'bigint') return value.toString()
        if (Array.isArray(value)) return value.map(sanitize)
        if (value && typeof value === 'object') {
            const out = {}
            Object.keys(value).forEach(k => { out[k] = sanitize(value[k]) })
            return out
        }
        return value
    }, [])

    // Memoize form handlers to prevent unnecessary re-renders
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const addWriter = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            writers: [...(prev.writers || []), { fullName: '', department: '', faculty: '', phone: '', email: '' }]
        }))
    }, [])

    const removeWriter = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            writers: (prev.writers || []).filter((_, i) => i !== index)
        }))
    }, [])

    const updateWriterField = useCallback((index, field, value) => {
        setFormData(prev => ({
            ...prev,
            writers: (prev.writers || []).map((w, i) => i === index ? { ...w, [field]: value } : w)
        }))
    }, [])

    const handleSubmit = useCallback(async () => {
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
            const usersPermissionsUsers = Array.from(new Set(extractInternalUserIds(formData.partners)))

            const attachmentIds = extractAttachmentIds(formData.attachments)

            // When editing, merge original IDs with new IDs to ensure old files are preserved
            const finalAttachmentIds = initialData
                ? Array.from(new Set([...originalAttachmentIdsRef.current, ...attachmentIds]))
                : attachmentIds

            const currentIdsSorted = [...finalAttachmentIds].sort()
            const originalIdsSorted = [...originalAttachmentIdsRef.current].sort()
            const attachmentsChanged = JSON.stringify(originalIdsSorted) !== JSON.stringify(currentIdsSorted)

            const payload = {
                fundName: formData.fundName || null,
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
                references2: formData.references2 || null,
                references3: formData.references3 || null,
                references4: formData.references4 || null,
                period: formData.period || null,
                partners: formData.partners || [],
                attachments: finalAttachmentIds,
                users_permissions_users: usersPermissionsUsers
            }

            // Remove null/empty string to reduce noise
            Object.keys(payload).forEach(k => {
                if (payload[k] === null || payload[k] === '') delete payload[k]
            })

            if (initialData && !attachmentsChanged) {
                delete payload.attachments
            }

            const safe = sanitize(payload)
            if (!onSubmit) {
                console.error('FundForm: onSubmit handler is required for saving data.')
                toast.error('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
                return
            }

            const submissionResult = await onSubmit(safe)

            if (initialData) {
                originalAttachmentIdsRef.current = finalAttachmentIds
            }

            const resolvedId = normalizeDocumentId(
                submissionResult?.documentId ??
                submissionResult?.id ??
                submissionResult ??
                (initialData?.documentId ?? initialData?.id)
            )

            if (resolvedId) {
                // router.refresh();
                // router.push(`/form/fund/view/${resolvedId}`)
                setTimeout(() => {
                    window.location.href = `/form/fund/view/${resolvedId}`;
                }, 1000);
            } else {
                console.warn('FundForm: Missing documentId from submission result, skipping redirect.')
            }
        } catch (err) {
            console.error('Fund submit error:', err)
            if (!onSubmit) {
                toast.error('เกิดข้อผิดพลาด: ' + (err?.message || 'Unknown error'))
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [session?.jwt, formData, extractAttachmentIds, sanitize, initialData, onSubmit, router])

    // hydrate edit data
    useEffect(() => {
        if (initialData) {
            const hydrated = { ...FUND_FORM_INITIAL, ...initialData }
            setFormData(hydrated)
            originalAttachmentIdsRef.current = extractAttachmentIds(hydrated.attachments)
        }
    }, [initialData, extractAttachmentIds])

    // Memoize static options to prevent re-renders
    const fundTypeOptions = useMemo(() => [
        { value: '0', label: 'ตำรา ใช้สอนในรายวิชา' },
        { value: '1', label: 'หนังสือ (ชื่อไทย และชื่อภาษาอังกฤษ)' }
    ], [])

    // Memoize safe writers array
    const safeWriters = useMemo(() => {
        return Array.isArray(formData.writers) ? formData.writers : []
    }, [formData.writers])

    // Memoized writers handlers
    const writerHandlers = useMemo(() => ({
        updateWriterField,
        removeWriter
    }), [updateWriterField, removeWriter])

    return (
        <>
            <Block>
                <div className='inputGroup'>
                    {/* Writers Section */}
                    <div className='space-y-2 hidden'>
                        <div className='flex justify-between items-center'>
                            <h3 className='font-semibold'>ผู้เขียน</h3>
                            <Button type='button' variant='outline' onClick={addWriter}>เพิ่มผู้เขียน</Button>
                        </div>
                        {safeWriters.map((w, idx) => (
                            <WriterForm
                                key={idx}
                                index={idx}
                                writer={w}
                                handlers={writerHandlers}
                            />
                        ))}
                    </div>
                    {/* ยังไม่มีใน backend */}
                    <FormTextarea id='fundName' label='ชื่อทุนตำราหรือหนังสือ' value={formData.fundName || ''} onChange={(e) => handleInputChange('fundName', e.target.value)} rows={5} />
                    {/* ยังไม่มีใน backend */}
                    {/* <FormRadio id='fundType' label='ลักษณะของผลงานวิชาการที่จะขอรับทุน' value={String(formData.fundType ?? '')} onChange={(e) => handleInputChange('fundType', e.target.value)} options={fundTypeOptions} />
                    <FormInput id='fundTypeText' label='ข้อความประเภททุน (อัตโนมัติจาก radio หรือเพิ่มเอง)' value={formData.fundTypeText || ''} onChange={(e) => handleInputChange('fundTypeText', e.target.value)} /> */}
                    <div className="space-y-1 flex items-center forminput">
                        <div className="w-1/3">
                            <Label htmlFor="fundType">ลักษณะของผลงานวิชาการที่จะขอรับทุน</Label>
                        </div>
                        <div className="flex-1 space-x-3 flex flex-col gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                {fundTypeOptions.map((option) => {
                                    const selected = option.value === String(formData.fundType ?? '')
                                    return (
                                        <div key={option.value} className="flex items-center gap-2">
                                            <div className="flex items-center md:min-w-62">
                                                <Input
                                                    id={`${option.value}`}
                                                    name="fundType"
                                                    type="radio"
                                                    className={"w-4 h-4"}
                                                    value={option.value}
                                                    checked={selected}
                                                    onChange={(e) => handleInputChange('fundType', e.target.value)}
                                                />
                                                <Label htmlFor={`${option.value}`} className="ml-2 font-normal cursor-pointer select-none">
                                                    {option.label}
                                                </Label>
                                            </div>
                                            <div className='ml-4 flex-1'>
                                                <Input
                                                    type="text"
                                                    disabled={!selected}
                                                    value={selected ? (formData.fundTypeText || '') : ''}
                                                    placeholder={selected ? 'ระบุข้อความเพิ่มเติม' : ''}
                                                    onChange={(e) => {
                                                        if (selected) handleInputChange('fundTypeText', e.target.value)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <FormTextarea id='contentDesc' label='คำอธิบายเนื้อหาของตำราหรือหนังสือ' value={formData.contentDesc || ''} onChange={(e) => handleInputChange('contentDesc', e.target.value)} rows={5} />
                    <FormTextarea id='pastPublications' label='เอกสารทางวิชาการ ตำรา หรือ หนังสือ ที่ผู้ขอทุนเคยมีประสบการณ์แต่งมาแล้ว' value={formData.pastPublications || ''} onChange={(e) => handleInputChange('pastPublications', e.target.value)} rows={5} />
                    <FormTextarea id='purpose' label='วัตถุประสงค์ของตำราหรือหนังสือ' value={formData.purpose || ''} onChange={(e) => handleInputChange('purpose', e.target.value)} rows={5} />
                    <FormTextarea id='targetGroup' label='กลุ่มเป้าหมายของตำราหรือหนังสือ' value={formData.targetGroup || ''} onChange={(e) => handleInputChange('targetGroup', e.target.value)} rows={5} />
                    <FormTextarea id='chapterDetails' label='การแบ่งบทและรายละเอียดในแต่ละบทของตำรา/หนังสือ' value={formData.chapterDetails || ''} onChange={(e) => handleInputChange('chapterDetails', e.target.value)} rows={5} />
                    <FormInput id='pages' type='number' label='ตำรา หรือ หนังสือ มีจำนวนประมาณ' value={formData.pages || ''} onChange={(e) => handleInputChange('pages', e.target.value)} />
                    <FormInput id='period' label='ระยะเวลา (ปี หรือ เดือน) ที่จะใช้ในการเขียนประมาณ' value={formData.period || ''} onChange={(e) => handleInputChange('period', e.target.value)} />
                    <FormTextarea id='references' label='รายชื่อหนังสือและเอกสารอ้างอิง (บรรณานุกรม) เพิ่มเติมความเหมาะสมได้' value={formData.references || ''} onChange={(e) => handleInputChange('references', e.target.value)} rows={5} />
                    {/* ยังไม่มีใน backend */}
                    <FormTextarea id='' label=' ' value={formData.references2 || ''} onChange={(e) => handleInputChange('references2', e.target.value)} rows={5} />
                    <FormTextarea id='' label=' ' value={formData.references3 || ''} onChange={(e) => handleInputChange('references3', e.target.value)} rows={5} />
                    <FormTextarea id='' label=' ' value={formData.references4 || ''} onChange={(e) => handleInputChange('references4', e.target.value)} rows={5} />

                    {/* ยังไม่มีใน backend */}


                    <FileUploadField
                        label='เอกสารแนบ'
                        value={formData.attachments || []}
                        onFilesChange={(files) => handleInputChange('attachments', files)}
                    />
                </div>
            </Block>
            <Block className="mt-4">
                <Partners
                    data={formData.partners || []}
                    onChange={(partners) => handleInputChange('partners', partners)}
                />
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
    )
}
