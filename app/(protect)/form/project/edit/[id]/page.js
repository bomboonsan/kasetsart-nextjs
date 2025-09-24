"use client"

import React from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import ProjectForm from '@/components/form/ProjectForm'
import { GET_PROJECT } from '@/graphql/projectQueries'
import { UPDATE_PROJECT } from '@/graphql/formQueries'

export default function ProjectEdit() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const { data, loading, error } = useQuery(GET_PROJECT, {
        variables: { documentId },
        skip: !documentId,
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const [updateProject] = useMutation(UPDATE_PROJECT, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const project = data?.project

    console.log('Fetched project data:', project); // --- IGNORE ---

    const handleUpdate = async (projectData) => {
        await updateProject({ variables: { documentId, data: projectData } })
        toast.success('บันทึกข้อมูลสำเร็จ!');
    }

    return (
        <div>
            <Pageheader title="แก้ไขโครงการวิจัย" />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด</div>}
            {project && (
                <ProjectForm initialData={project} onSubmit={handleUpdate} />
            )}
        </div>
    )
}