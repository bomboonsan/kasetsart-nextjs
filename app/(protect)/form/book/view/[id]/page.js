"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import { GET_BOOK } from '@/graphql/formQueries'
import { Button } from '@/components/ui/button'
import Block from '@/components/layout/Block'
import FieldView from '@/components/myui/FieldView'
import PartnersView from '@/components/form/PartnersView'

export default function BookView() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const { data, loading, error } = useQuery(GET_BOOK, {
        variables: { documentId },
        skip: !documentId,
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const book = data?.book

    const getTypeText = (v) => {
        if (v === 0 || v === '0') return 'หนังสือ';
        if (v === 1 || v === '1') return 'ตำรา';
        return '-';
    }

    return (
        <div>
            <Pageheader title="ข้อมูลหนังสือ" />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด: {error.message}</div>}
            {book && (
                <div className='space-y-4'>
                    <Block>
                        <div className='mb-4 flex justify-end'>
                            <Button variant="default" onClick={() => router.push(`/admin/form/book/edit/${book.documentId}`)}>แก้ไข</Button>
                        </div>
                        <div className="inputGroup">
                            <FieldView label="ชื่อผลงาน (ไทย)" value={book.titleTH || '-'} />
                            <FieldView label="ชื่อผลงาน (อังกฤษ)" value={book.titleEN || '-'} />
                            <FieldView label="ประเภท" value={getTypeText(book.bookType)} />
                            <FieldView label="รายละเอียด" value={book.detail || '-'} />
                            <FieldView label="วันที่ตีพิมพ์" value={book.publicationDate || '-'} />
                            <FieldView label="ผู้แต่ง" value={(book.writers || []).length > 0 ? (book.writers.map(w => w.name || w).join(', ')) : '-'} />
                        </div>
                    </Block>

                    <Block>
                        <h2 className="text-lg font-medium mb-3">ไฟล์แนบ</h2>
                        <div className="space-y-2">
                            {book.attachments && book.attachments.length > 0 ? (
                                book.attachments.map((file) => (
                                    <div key={file.documentId || file.id}>
                                        <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${file.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div>ไม่มีไฟล์แนบ</div>
                            )}
                        </div>  
                    </Block>

                    {book.partners && book.partners.length > 0 && (
                        <Block>
                            <h2 className="text-lg font-medium mb-3">ผู้ร่วมงาน</h2>
                            <PartnersView data={book.partners} />
                        </Block>
                    )}
                </div>
            )}
        </div>
    )
}
