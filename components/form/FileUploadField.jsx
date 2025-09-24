'use client'

import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '@/lib/api-base'
import { useSession } from "next-auth/react";

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
    const [attachments, setAttachments] = useState(value || []) // เก็บผลการอัปโหลด (id, name, url) จาก Strapi
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    // ซิงค์ค่าจากภายนอก (กรณีแก้ไข/รีเฟรช state จาก parent)
    // ป้องกันการเรียก setAttachments ซ้ำๆ เมื่อ prop `value` มี reference ใหม่แต่ข้อมูลเดิม
    const lastAppliedRef = useRef(JSON.stringify(value || []))
    useEffect(() => {
        try {
            const incoming = JSON.stringify(value || [])
            if (incoming !== lastAppliedRef.current) {
                lastAppliedRef.current = incoming
                // ปรับให้รองรับทั้งข้อมูลจาก upload ใหม่และข้อมูลจาก GraphQL
                const normalizedAttachments = (value || []).map(file => {
                    // หากเป็นไฟล์จาก GraphQL (มี documentId) ให้ normalize URL
                    if (file.documentId || (file.url && !file.url.startsWith('http'))) {
                        const url = file.url?.startsWith('http') 
                            ? file.url 
                            : `${API_BASE}${file.url || ''}`
                        return {
                            id: file.id,
                            documentId: file.documentId,
                            name: file.name,
                            url,
                            size: file.size,
                            mime: file.mime
                        }
                    }
                    // หากเป็นไฟล์จาก upload ใหม่ ให้คืนค่าตามเดิม
                    return file
                })
                setAttachments(normalizedAttachments)
            }
        } catch (e) {
            // หาก stringify ล้มเหลว ให้ fallback เป็นการเซ็ตปกติ
            const normalizedAttachments = (value || []).map(file => {
                if (file.documentId || (file.url && !file.url.startsWith('http'))) {
                    const url = file.url?.startsWith('http') 
                        ? file.url 
                        : `${API_BASE}${file.url || ''}`
                    return {
                        id: file.id,
                        documentId: file.documentId,
                        name: file.name,
                        url,
                        size: file.size,
                        mime: file.mime
                    }
                }
                return file
            })
            setAttachments(normalizedAttachments)
        }
        // หมายเหตุ: ใช้เฉพาะ `value` เป็น dependency เพื่อลด risk ของ loop
    }, [value])

    const doUpload = async (fileList) => {
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
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const uploadedFiles = await response.json()
            const newAttachments = uploadedFiles.map(file => {
                const url = typeof file.url === 'string'
                    ? (file.url.startsWith('http') ? file.url : `${API_BASE}${file.url}`)
                    : ''
                return {
                    id: file.id,
                    name: file.name,
                    url,
                    size: file.size,
                    // documentId มักไม่มีใน REST upload response ของ Strapi
                    // เก็บไว้เผื่อ parent ต้องการ mapping ภายหลัง
                    documentId: file.documentId,
                }
            })

            // รวมไฟล์ใหม่กับไฟล์เดิม (incremental)
            const merged = [...attachments, ...newAttachments]
            setAttachments(merged)
            // แจ้ง parent ด้วยรายการรวม
            onFilesChange && onFilesChange(merged)
        } catch (err) {
            setError('อัปโหลดไฟล์ไม่สำเร็จ: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const removeAttachment = (idx) => {
        // ลบไฟล์เฉพาะในรายการที่อัปโหลดแล้ว (ไม่ยุ่งกับฝั่ง Strapi server เพื่อความง่าย)
        const next = attachments.filter((_, i) => i !== idx)
        setAttachments(next)
        onFilesChange && onFilesChange(next)
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            doUpload(e.dataTransfer.files)
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            doUpload(e.target.files)
        }
    }

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
                onClick={() => document.getElementById('file-upload-field-input').click()}
            >
                <input
                    id="file-upload-field-input"
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
            {attachments.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">ไฟล์ที่อัปโหลดแล้ว:</p>
                    <ul className="space-y-1">
                        {attachments.map((file, index) => {
                            // สร้าง href ที่ปลอดภัยสำหรับทั้งไฟล์จาก upload ใหม่และจาก GraphQL
                            const href = (() => {
                                if (!file?.url) return '#'
                                return file.url.startsWith('http') ? file.url : `${API_BASE}${file.url}`
                            })()
                            
                            return (
                                <li key={file.id || file.documentId || index} className="text-sm text-gray-600 flex items-center justify-between gap-4">
                                    <div className="flex-1 truncate">
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {file.name || 'ไฟล์ไม่มีชื่อ'}
                                        </a>
                                        {typeof file.size === 'number' && !Number.isNaN(file.size) && (
                                            <span className="text-xs text-gray-400 ml-2">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        )}
                                        {file.mime && (
                                            <span className="text-xs text-gray-400 ml-2">
                                                ({file.mime})
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
            )}
        </div>
    )
}
