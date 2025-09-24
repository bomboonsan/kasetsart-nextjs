// This is Book Work Form - relates to Project Funding
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
// ใช้ path alias (@/) สำหรับ API ทั้งหมด
import { worksAPI, projectAPI, profileAPI, fundingAPI } from '@/lib/api'
import { api } from '@/lib/api-base'
import { getDocumentId, createHandleChange, stripUndefined } from '@/utils'
import { FormSection, FormFieldBlock, FormField } from '@/components/ui'
import ProjectFundingPicker from '@/components/ProjectFundingPicker'
import FormInput from "@/components/FormInput";
import FormRadio from "@/components/FormRadio";
import { FormCheckbox } from '@/components/ui'
import { FormTextarea } from '@/components/ui'
import { FormDateSelect } from '@/components/ui'
import FormSelect from "@/components/FormSelect";
import dynamic from 'next/dynamic'

const FileUploadField = dynamic(() => import('@/components/FileUploadField'), { ssr: false });
import ResearchTeamTable from '@/components/ResearchTeamTable'

import { Button } from '@/components/ui'

// คอมเมนต์ (ไทย): แก้ไขให้ SweetAlert2 โหลดแบบ dynamic เฉพาะฝั่ง client เท่านั้น
const SweetAlert2 = dynamic(() => import('react-sweetalert2'), { ssr: false });


export default function CreateBookForm({ mode = 'create', workId, initialData }) {
    const router = useRouter()
    const [swalProps, setSwalProps] = useState({})

    // Align state to work-book schema
    const [formData, setFormData] = useState({
        project_funding: null, // relation to project-funding (documentId)
        bookType: 0, // ประเภทผลงาน (0=หนังสือ,1=ตำรา)
        titleTH: null, // ชื่อผลงาน (ไทย)
        titleEN: null, // ชื่อผลงาน (อังกฤษ)
        detail: null, // รายละเอียดเบื้องต้นของหนังสือ หรือ ตำรา
        level: null, // ระดับ 0=ระดับชาติ, 1=ระดับนานาชาติ
        publicationDate: null, // วันที่เกิดผลงาน (Date)
        attachments: [],
        writers: [], // Writers array for dynamic management
        __projectFundingObj: undefined, // สำหรับเก็บ object โครงการขอทุนที่เลือก
    })
    const [isLoading, setIsLoading] = useState(false)

    // Fetch existing work-book when editing
    const { data: existingWorkBook } = useSWR(
        mode === 'edit' && workId ? ['work-book', workId] : null,
        () => api.get(`/work-books/${workId}?populate=*`)
    )

    // Prefill when editing
    useEffect(() => {
        if (existingWorkBook?.data) {
            const data = existingWorkBook.data
            setFormData(prev => ({
                ...prev,
                project_funding: getDocumentId(data.project_funding) || null,
                bookType: data.bookType || 0,
                titleTH: data.titleTH || '',
                titleEN: data.titleEN || '',
                detail: data.detail || '',
                level: data.level || 0,
                publicationDate: data.publicationDate ? String(data.publicationDate).slice(0, 10) : '',
                attachments: data.attachments || [],
                writers: data.writers || [],
                __projectFundingObj: data.project_funding || undefined,
            }))
        } else if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                publicationDate: initialData.publicationDate ? String(initialData.publicationDate).slice(0, 10) : '',
                project_funding: getDocumentId(initialData?.project_funding) || null,
                __projectFundingObj: initialData?.project_funding || undefined,
            }))
        }
    }, [existingWorkBook, initialData])

    // Ensure full Funding object and initialize partnersLocal from funding_partners once
    useEffect(() => {
        async function ensureFundingLoaded() {
            try {
                const maybe = formData.__projectFundingObj || formData.project_funding
                if (!maybe) return
                if (typeof maybe !== 'object') {
                    const id = getDocumentId({ documentId: maybe }) || maybe
                    const res = await fundingAPI.getFunding(id)
                    const fund = res?.data || res
                    setFormData(prev => {
                        const next = { ...prev, __projectFundingObj: fund }
                        if (!Array.isArray(prev.partnersLocal) || prev.partnersLocal.length === 0) {
                            // Extract team from funding_partners into local shape
                            let partners = []
                            if (fund?.funding_partners?.data) partners = fund.funding_partners.data
                            else if (Array.isArray(fund?.funding_partners)) partners = fund.funding_partners
                            const norm = (partners || []).map(item => {
                                const p = item?.attributes || item || {}
                                const partnerTypeLabels = { 1: 'หัวหน้าโครงการ', 2: 'ที่ปรึกษาโครงการ', 3: 'ผู้ประสานงาน', 4: 'นักวิจัยร่วม', 99: 'อื่นๆ' }
                                return {
                                    id: item?.id || p.id,
                                    fullname: p.fullname || p.name || '',
                                    orgName: p.orgName || p.org || '',
                                    partnerType: partnerTypeLabels[p.participant_type] || p.partnerType || '',
                                    isInternal: !!p.users_permissions_user || !!p.userID || false,
                                    userID: p.users_permissions_user?.data?.id || p.users_permissions_user || p.userID || undefined,
                                    partnerComment: (p.isFirstAuthor ? 'First Author' : '') + (p.isCoreespondingAuthor ? ' Corresponding Author' : ''),
                                    partnerProportion: p.participation_percentage !== undefined ? String(p.participation_percentage) : undefined,
                                    partnerProportion_percentage_custom: p.partnerProportion_percentage_custom !== undefined && p.partnerProportion_percentage_custom !== null ? String(p.partnerProportion_percentage_custom) : undefined,
                                    order: p.order !== undefined ? parseInt(p.order) : undefined,
                                }
                            })
                            next.partnersLocal = norm
                        }
                        return next
                    })
                    return
                }
                if (!Array.isArray(formData.partnersLocal) || formData.partnersLocal.length === 0) {
                    const fund = formData.__projectFundingObj
                    let partners = []
                    if (fund?.funding_partners?.data) partners = fund.funding_partners.data
                    else if (Array.isArray(fund?.funding_partners)) partners = fund.funding_partners
                    const norm = (partners || []).map(item => {
                        const p = item?.attributes || item || {}
                        const partnerTypeLabels = { 1: 'หัวหน้าโครงการ', 2: 'ที่ปรึกษาโครงการ', 3: 'ผู้ประสานงาน', 4: 'นักวิจัยร่วม', 99: 'อื่นๆ' }
                        return {
                            id: item?.id || p.id,
                            fullname: p.fullname || p.name || '',
                            orgName: p.orgName || p.org || '',
                            partnerType: partnerTypeLabels[p.participant_type] || p.partnerType || '',
                            isInternal: !!p.users_permissions_user || !!p.userID || false,
                            userID: p.users_permissions_user?.data?.id || p.users_permissions_user || p.userID || undefined,
                            partnerComment: (p.isFirstAuthor ? 'First Author' : '') + (p.isCoreespondingAuthor ? ' Corresponding Author' : ''),
                            partnerProportion: p.participation_percentage !== undefined ? String(p.participation_percentage) : undefined,
                            partnerProportion_percentage_custom: p.partnerProportion_percentage_custom !== undefined && p.partnerProportion_percentage_custom !== null ? String(p.partnerProportion_percentage_custom) : undefined,
                            order: p.order !== undefined ? parseInt(p.order) : undefined,
                        }
                    })
                    if (norm.length > 0) setFormData(prev => ({ ...prev, partnersLocal: norm }))
                }
            } catch { /* ignore */ }
        }
        ensureFundingLoaded()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.__projectFundingObj, formData.project_funding, formData.__projectFundingObj?.id, formData.__projectFundingObj?.documentId])

    // Writers management helpers (like in CreateFundingForm)
    const addWriter = () => {
        setFormData(prev => ({
            ...prev,
            writers: [...prev.writers, { name: '', email: '', affiliation: '' }]
        }))
    }

    const updateWriter = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            writers: prev.writers.map((writer, i) =>
                i === index ? { ...writer, [field]: value } : writer
            )
        }))
    }

    const removeWriter = (index) => {
        setFormData(prev => ({
            ...prev,
            writers: prev.writers.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Upsert funding_partners to Funding from partnersLocal before saving work-book
            try {
                const fundingId = formData.__projectFundingObj?.documentId || formData.__projectFundingObj?.id || formData.project_funding
                if (fundingId && Array.isArray(formData.partnersLocal)) {
                    const makeKey = (p) => {
                        let uid = p?.userID
                        if (uid && typeof uid === 'object') uid = uid.id || uid.data?.id
                        uid = uid !== undefined && uid !== null ? String(uid) : undefined
                        const name = String(p?.fullname || '').trim().toLowerCase()
                        const orgName = String(p?.orgName || '').trim().toLowerCase()
                        return uid ? `u:${uid}` : `n:${name}|${orgName}`
                    }
                    const partnerTypeMap = { 'หัวหน้าโครงการ': 1, 'ที่ปรึกษาโครงการ': 2, 'ผู้ประสานงาน': 3, 'นักวิจัยร่วม': 4, 'อื่นๆ': 99 }
                    let existingItems = []
                    try {
                        const resp = await api.get(`/funding-partners?populate=users_permissions_user&filters[project_fundings][documentId][$eq]=${fundingId}`)
                        existingItems = resp?.data || resp || []
                    } catch { existingItems = [] }
                    const serverEntries = (existingItems || []).map(item => {
                        const attr = item?.attributes || item || {}
                        const userId = attr.users_permissions_user?.data?.id || attr.users_permissions_user || attr.userID
                        return {
                            documentId: item?.documentId || item?.id,
                            fullname: attr.fullname || attr.name || '',
                            orgName: attr.orgName || attr.org || '',
                            partnerType: (() => { const t = attr.participant_type; if (t === 1) return 'หัวหน้าโครงการ'; if (t === 2) return 'ที่ปรึกษาโครงการ'; if (t === 3) return 'ผู้ประสานงาน'; if (t === 4) return 'นักวิจัยร่วม'; if (t === 99) return 'อื่นๆ'; return '' })(),
                            userID: userId,
                            partnerComment: `${attr.isFirstAuthor ? 'First Author' : ''}${attr.isCoreespondingAuthor ? (attr.isFirstAuthor ? ', ' : '') + 'Corresponding Author' : ''}`.trim(),
                            partnerProportion: attr.participation_percentage !== undefined ? String(attr.participation_percentage) : undefined,
                        }
                    })
                    const serverMap = new Map(serverEntries.map(e => [makeKey(e), e]))
                    const seen = new Set()
                    for (const [idx, p] of (formData.partnersLocal || []).entries()) {
                        const key = makeKey(p)
                        seen.add(key)
                        const payload = stripUndefined({
                            fullname: p.fullname || undefined,
                            orgName: p.orgName || undefined,
                            participation_percentage: p.partnerProportion ? parseFloat(p.partnerProportion) : undefined,
                            participant_type: partnerTypeMap[p.partnerType] || undefined,
                            isFirstAuthor: String(p.partnerComment || '').includes('First Author') || false,
                            isCoreespondingAuthor: String(p.partnerComment || '').includes('Corresponding Author') || false,
                            users_permissions_user: p.userID || undefined,
                            partnerProportion_percentage_custom: (p.partnerProportion_percentage_custom !== undefined && p.partnerProportion_percentage_custom !== '') ? Number(p.partnerProportion_percentage_custom) : undefined,
                            order: p.order !== undefined ? parseInt(p.order) : idx,
                            project_fundings: [fundingId],
                        })
                        const existing = serverMap.get(key)
                        if (existing?.documentId) {
                            try { await api.put(`/funding-partners/${existing.documentId}`, { data: payload }) } catch { }
                        } else {
                            try { await api.post('/funding-partners', { data: payload }) } catch { }
                        }
                    }
                    for (const [key, entry] of serverMap.entries()) {
                        if (!seen.has(key) && entry?.documentId) {
                            try { await api.delete(`/funding-partners/${entry.documentId}`) } catch { }
                        }
                    }
                }
            } catch { /* do not block work save */ }
            // Construct payload based on work-book schema
            const payload = {
                project_funding: formData.project_funding,
                bookType: formData.bookType,
                titleTH: formData.titleTH,
                titleEN: formData.titleEN,
                detail: formData.detail,
                level: formData.level,
                publicationDate: formData.publicationDate,
                attachments: formData.attachments?.map(att => att.id || att.documentId).filter(Boolean) || [],
                writers: formData.writers // Store writers as JSON
            }

            let result
            if (mode === 'edit' && workId) {
                result = await api.put(`/work-books/${workId}`, { data: payload })
                setSwalProps({ show: true, icon: 'success', title: 'อัปเดตหนังสือ/ตำราสำเร็จ', timer: 1600, showConfirmButton: false })
            } else {
                result = await api.post('/work-books', { data: payload })
                setSwalProps({ show: true, icon: 'success', title: 'บันทึกหนังสือ/ตำราสำเร็จ', timer: 1600, showConfirmButton: false })
            }

            mutate('work-books') // SWR key to revalidate

            setTimeout(() => router.push('/form/overview'), 1200)

        } catch (error) {
            const msg = error?.response?.data?.error?.message || error?.message || 'เกิดข้อผิดพลาด'
            setSwalProps({
                show: true,
                icon: 'error',
                title: 'บันทึกไม่สำเร็จ',
                text: msg
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = createHandleChange(setFormData)

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <SweetAlert2 {...swalProps} didClose={() => setSwalProps({})} />
            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                <FormSection>
                    <FormFieldBlock>
                        <ProjectFundingPicker
                            label="โครงการขอทุน"
                            selectedProject={formData.__projectFundingObj}
                            onSelect={(p) => setFormData(prev => ({
                                ...prev,
                                project_funding: getDocumentId(p),
                                __projectFundingObj: p,
                                __projectObj: p,
                            }))}

                        />
                    </FormFieldBlock>

                    <FormFieldBlock>
                        <FormRadio
                            inline={true}

                            label="ประเภทผลงาน"
                            options={[
                                { label: "หนังสือ", value: 0 },
                                { label: "ตำรา", value: 1 },
                            ]}
                            value={formData.bookType}
                            onChange={(value) => handleInputChange("bookType", parseInt(value))}
                        />
                    </FormFieldBlock>

                    <FormFieldBlock>
                        <FormTextarea
                            label="ชื่อผลงาน (ไทย)"

                            value={formData.titleTH}
                            onChange={(value) => handleInputChange("titleTH", value)}
                            placeholder="กรอกชื่อผลงานภาษาไทย"
                        />

                        <FormTextarea
                            label="ชื่อผลงาน (อังกฤษ)"
                            value={formData.titleEN}
                            onChange={(value) => handleInputChange("titleEN", value)}
                            placeholder="กรอกชื่อผลงานภาษาอังกฤษ"
                        />
                    </FormFieldBlock>

                    <FormFieldBlock>
                        <FormTextarea
                            label="รายละเอียดเบื้องต้นของหนังสือ หรือ ตำรา"

                            value={formData.detail}
                            onChange={(value) => handleInputChange("detail", value)}
                            placeholder="กรอกรายละเอียดของหนังสือหรือตำรา"
                        />
                    </FormFieldBlock>

                    <FormFieldBlock>
                        <FormRadio
                            inline={true}

                            label="ระดับของผลงาน"
                            options={[
                                { label: "ระดับชาติ", value: 0 },
                                { label: "ระดับนานาชาติ", value: 1 },
                            ]}
                            value={formData.level}
                            onChange={(value) => handleInputChange("level", parseInt(value))}
                        />

                        <FormInput
                            label="วันที่เกิดผลงาน"
                            type="date"

                            value={formData.publicationDate}
                            onChange={(value) => handleInputChange("publicationDate", value)}
                        />
                    </FormFieldBlock>

                    <FormFieldBlock>
                        <FileUploadField
                            label="อัปโหลดไฟล์"
                            // ปรับให้รองรับการอัปโหลดไฟล์หลายครั้งแบบสะสม
                            value={formData.attachments}
                            onFilesChange={(attachments) => handleInputChange("attachments", attachments)}
                            accept=".pdf,.doc,.docx"
                            multiple
                        />
                    </FormFieldBlock>
                </FormSection>

                {formData.__projectFundingObj ? (
                    <div className='p-4 rounded-md border shadow border-gray-200/70'>
                        <FormSection title="* ผู้ร่วมวิจัย">
                            <ResearchTeamTable formData={formData} setFormData={setFormData} />
                        </FormSection>
                    </div>
                ) : null}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        ยกเลิก
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'กำลังบันทึก...' : mode === 'edit' ? 'อัปเดต' : 'บันทึก'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
