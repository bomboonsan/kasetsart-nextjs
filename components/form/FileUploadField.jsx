'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { API_BASE } from '@/lib/api-base'
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

export default function FileUploadField({
    label,
    onFilesChange,
    accept,
    multiple = true, // อนุญาตหลายไฟล์ แต่ผู้ใช้จะเลือกทีละไฟล์ก็ได้
    className = '',
    value = [] // เพิ่ม prop สำหรับรับรายการไฟล์ปัจจุบันจาก parent
}) {
    const { data: session, status } = useSession();
    const [dragActive, setDragActive] = useState(false)

    const [files, setFiles] = useState([]) // เก็บ File objects ที่เพิ่งเลือก (ยังไม่รวม metadata จาก Strapi)
    const [attachments, setAttachments] = useState(Array.isArray(value) ? value : []) // เก็บผลการอัปโหลด (id, name, url) จาก Strapi
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    // unique id per component instance so multiple FileUploadField won't clash
    const instanceIdRef = useRef(uuidv4())

    // ซิงค์ค่าจากภายนอก (กรณีแก้ไข/รีเฟรช state จาก parent)
    // ป้องกันการเรียก setAttachments ซ้ำๆ เมื่อ prop `value` มี reference ใหม่แต่ข้อมูลเดิม
    const lastAppliedRef = useRef(JSON.stringify(value || []))

    // Helper function to parse ID
    const parseId = useCallback((v) => {
        if (v === undefined || v === null) return null
        if (typeof v === 'bigint') return v.toString()
        const n = Number(v)
        return Number.isFinite(n) ? String(n) : null
    }, [])

    // Memoize the normalization of incoming value to prevent unnecessary recalculations
    const normalizedIncomingValue = useMemo(() => {
        try {
            if (!Array.isArray(value)) return []

            return value.map(file => {
                if (!file) return null

                const hasGraphQLId = file.documentId
                const needsUrlNormalization = file.url && typeof file.url === 'string' && !file.url.startsWith('http')
                const url = needsUrlNormalization ? `${API_BASE}${file.url}` : (file.url || '')

                const idStr = parseId(file.id ?? file.documentId ?? file.document_id)
                const docIdStr = parseId(file.documentId ?? file.document_id ?? file.id)

                return {
                    id: idStr,
                    documentId: docIdStr,
                    name: file.name || file.filename || 'unnamed-file',
                    url: url,
                    size: file.size,
                    mime: file.mime || file.mimetype,
                }
            }).filter(Boolean)
        } catch (error) {
            console.warn('Error normalizing incoming value:', error)
            return []
        }
    }, [value, parseId])

    useEffect(() => {
        try {
            const incoming = JSON.stringify(normalizedIncomingValue)
            if (incoming !== lastAppliedRef.current) {
                lastAppliedRef.current = incoming
                setAttachments(normalizedIncomingValue)
            }
        } catch (error) {
            console.warn('Error in value sync effect:', error)
            // Fallback to direct assignment without stringification
            setAttachments(normalizedIncomingValue)
        }
    }, [normalizedIncomingValue])

    const normalize = useCallback((file) => {
        if (!file) return null
        try {
            const needsUrlNormalization = file.url && typeof file.url === 'string' && !file.url.startsWith('http')
            const url = needsUrlNormalization ? `${API_BASE}${file.url}` : (file.url || file.preview || '')
            const name = file.name || file.filename || file.alternativeText || file.caption || 'unnamed-file'
            const idStr = parseId(file.id ?? file.documentId ?? file.document_id)
            const docIdStr = parseId(file.documentId ?? file.document_id ?? file.id)
            return {
                id: idStr,
                documentId: docIdStr,
                name,
                url,
                size: file.size,
                mime: file.mime || file.mimetype,
            }
        } catch (error) {
            console.warn('Error normalizing file:', error, file)
            return null
        }
    }, [parseId])

    const dedupe = useCallback((arr) => {
        try {
            const seen = new Map()
            for (const a of arr || []) {
                if (!a) continue
                const key = a?.documentId ?? a?.id ?? a?.url ?? a?.name ?? JSON.stringify(a)
                if (!key) continue
                if (!seen.has(key)) seen.set(key, a)
            }
            return Array.from(seen.values())
        } catch (error) {
            console.warn('Error deduplicating files:', error)
            return arr || []
        }
    }, [])

    const doUpload = useCallback(async (fileList) => {
        const filesArray = Array.from(fileList)
        if (filesArray.length === 0) return
        // เก็บไฟล์ที่ผู้ใช้เพิ่งเลือกเพื่อแสดง (ไม่จำเป็นต้องเก็บทั้งหมด)
        setFiles(filesArray)
        setError('')
        setUploading(true)
        try {
            const formData = new FormData()
            // รองรับการเลือกทีละไฟล์ หลายครั้ง (append ทีละรอบ)
            filesArray.forEach((file) => {
                formData.append('files', file)
            })

            const token = session?.jwt;
            // ใช้งานผ่าน Strapi REST API
            const response = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            })

            if (!response.ok) {
                const text = await response.text().catch(() => response.statusText)
                throw new Error(`Upload failed: ${response.status} ${text}`)
            }

            const uploadedFiles = await response.json()
            // Strapi REST returns an array of uploaded file objects
            const newAttachments = (Array.isArray(uploadedFiles) ? uploadedFiles : []).map(normalize).filter(Boolean)

            // รวมไฟล์ใหม่กับไฟล์เดิม (incremental) และ dedupe
            setAttachments(prevAttachments => {
                const merged = dedupe([...prevAttachments, ...newAttachments])
                // แจ้ง parent ด้วยรายการรวม (normalized)
                try {
                    onFilesChange?.(merged)
                } catch (e) {
                    console.warn('onFilesChange threw', e)
                }
                return merged
            })

            // success toast
            if (newAttachments.length > 0) {
                toast.success(`อัปโหลด ${newAttachments.length} ไฟล์สำเร็จ`)
            }
        } catch (err) {
            const errorMessage = err?.message || 'Unknown error occurred'
            setError('อัปโหลดไฟล์ไม่สำเร็จ: ' + errorMessage)
            toast.error('อัปโหลดไฟล์ไม่สำเร็จ: ' + errorMessage)
        } finally {
            setUploading(false)
        }
    }, [session?.jwt, normalize, dedupe, onFilesChange])

    const removeAttachment = useCallback((idx) => {
        // ลบไฟล์เฉพาะในรายการที่อัปโหลดแล้ว (ไม่ยุ่งกับฝั่ง Strapi server เพื่อความง่าย)
        setAttachments(prevAttachments => {
            const next = prevAttachments.filter((_, i) => i !== idx)
            const normalized = dedupe(next.map(normalize).filter(Boolean))

            try {
                onFilesChange?.(normalized)
            } catch (e) {
                console.warn('onFilesChange threw in removeAttachment', e)
            }

            return normalized
        })
    }, [dedupe, normalize, onFilesChange])

    const handleDrag = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer?.files?.[0]) {
            doUpload(e.dataTransfer.files)
        }
    }, [doUpload])

    const handleChange = useCallback((e) => {
        e.preventDefault()
        if (e.target?.files?.[0]) {
            doUpload(e.target.files)
        }
    }, [doUpload])

    const handleClick = useCallback(() => {
        try {
            const el = document.getElementById(`file-upload-field-input-${instanceIdRef.current}`)
            if (el && typeof el.click === 'function') {
                el.click()
            }
        } catch (error) {
            console.warn('Error clicking file input:', error)
        }
    }, [])

    return (
        <div className="space-y-2 pb-4">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors duration-200 cursor-pointer
          ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
          ${className}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    id={`file-upload-field-input-${instanceIdRef.current}`}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="space-y-2">
                    <svg
                        className="w-8 h-8 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 48 48"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="text-sm text-gray-600">
                        <p>{uploading ? 'กำลังอัปโหลด...' : 'Upload a file or drag and drop'}</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, Images up to 10MB</p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {/* แสดงรายการไฟล์ที่อัปโหลดแล้วแบบสะสม */}
            {useMemo(() => {
                if (attachments.length === 0) return null

                return (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">ไฟล์ที่อัปโหลดแล้ว:</p>
                        <ul className="space-y-1">
                            {attachments.map((file, index) => {
                                // สร้าง href ที่ปลอดภัยสำหรับทั้งไฟล์จาก upload ใหม่และจาก GraphQL
                                const href = (() => {
                                    try {
                                        if (!file?.url) return '#'
                                        return file.url.startsWith('http') ? file.url : `${API_BASE}${file.url}`
                                    } catch (error) {
                                        console.warn('Error constructing file href:', error, file)
                                        return '#'
                                    }
                                })()

                                const fileName = file?.name || 'ไฟล์ไม่มีชื่อ'
                                const fileId = file?.documentId ?? file?.id
                                const fileSize = typeof file?.size === 'number' && !Number.isNaN(file.size)
                                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                    : null
                                const fileMime = file?.mime || null

                                return (
                                    <li key={fileId ?? file?.url ?? index} className="text-sm text-gray-600 flex items-center justify-between gap-4">
                                        <div className="flex-1 truncate">
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {fileName}
                                            </a>
                                            {fileId && (
                                                <span className="text-xs text-gray-300 ml-2"># {fileId}</span>
                                            )}
                                            {fileSize && (
                                                <span className="text-xs text-gray-400 ml-2">
                                                    {fileSize}
                                                </span>
                                            )}
                                            {fileMime && (
                                                <span className="text-xs text-gray-400 ml-2">
                                                    ({fileMime})
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-600 text-xs hover:underline"
                                        >
                                            ลบ
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                    </div>
                )
            }, [attachments, error, removeAttachment])}
        </div>
    )
}
