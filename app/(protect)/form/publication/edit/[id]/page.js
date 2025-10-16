"use client"

import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import PublicationForm from '@/components/form/PublicationForm'
import { GET_PUBLICATION, UPDATE_PUBLICATION } from '@/graphql/formQueries'

export default function PublicationEdit() {
    const params = useParams()
    const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id
    const { data: session } = useSession()

    const { data, loading, error } = useQuery(GET_PUBLICATION, {
        variables: { documentId },
        skip: !documentId,
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const [updatePublication] = useMutation(UPDATE_PUBLICATION, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const publication = data?.publication

    const handleUpdate = async (publicationData) => {
        try {
            await updatePublication({ variables: { documentId, data: publicationData } })
            toast.success('บันทึกข้อมูลสำเร็จ!');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        }
    }

    console.log('publication', publication)

    return (
        <div>
            <Pageheader title="แก้ไขผลงานตีพิมพ์" />
            <Toaster />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด: {error.message}</div>}
            {publication && (
                <PublicationForm initialData={publication} onSubmit={handleUpdate} isEdit={true} />
            )}
        </div>
    )
}
