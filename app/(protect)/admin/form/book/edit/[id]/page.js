"use client"

import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import BookForm from '@/components/form/BookForm'
import { GET_BOOK, UPDATE_BOOK } from '@/graphql/formQueries'

export default function BookEdit() {
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

    const [updateBook] = useMutation(UPDATE_BOOK, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    console.log('Book data:', data);
    const book = data?.book

    const handleUpdate = async (bookData) => {
        try {
            await updateBook({ variables: { documentId, data: bookData } })
            toast.success('บันทึกข้อมูลสำเร็จ!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        }
    }

    return (
        <div>
            <Pageheader title="แก้ไขข้อมูลหนังสือ" />
            <Toaster />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด: {error.message}</div>}
            {book && (
                <BookForm documentId={documentId} initialData={book} onSubmit={handleUpdate} isEdit={true} />
            )}
        </div>
    )
}
