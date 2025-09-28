"use client"

import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import ConferenceForm from '@/components/form/ConferenceForm'
import { GET_CONFERENCE, UPDATE_CONFERENCE } from '@/graphql/formQueries'

export default function ConferenceEdit() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const { data, loading, error } = useQuery(GET_CONFERENCE, {
        variables: { documentId },
        skip: !documentId,
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const [updateConference] = useMutation(UPDATE_CONFERENCE, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const conference = data?.conference


    const handleUpdate = async (conferenceData) => {
        try {
            await updateConference({ variables: { documentId, data: conferenceData } })
            toast.success('บันทึกข้อมูลสำเร็จ!');
        } catch (error) {
            console.error('Update error:', error);
            
            // ตรวจสอบว่าเป็น error เกี่ยวกับ attachments หรือไม่
            const errorMessage = error?.message || error?.graphQLErrors?.[0]?.message || 'ไม่ทราบสาเหตุ';
            
            if (errorMessage.includes('plugin::upload.file') && errorMessage.includes('do not exist')) {
                toast.error('เกิดข้อผิดพลาดเกี่ยวกับไฟล์แนบ: บางไฟล์อาจถูกลบไปแล้ว กรุณาลองใหม่อีกครั้ง');
            } else {
                toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + errorMessage);
            }
        }
    }

    return (
        <div>
            <Pageheader title="แก้ไขข้อมูลการประชุม" />
            <Toaster />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด: {error.message}</div>}
            {conference && (
                <ConferenceForm initialData={conference} onSubmit={handleUpdate} isEdit={true} />
            )}
        </div>
    )
}
