"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import ProjectForm from '@/components/form/ProjectForm'
import { GET_PROJECT } from '@/graphql/projectQueries'
import { researchKindOptions, fundTypeOptions, subFundType1, subFundType2, subFundType3, subFundType4, fundNameOptions } from '@/data/project';

import { Button } from '@/components/ui/button';
import Block from '@/components/layout/Block'
import FieldView from '@/components/myui/FieldView'
import PartnersView from '@/components/form/PartnersView'

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


    const project = data?.project

    return (
        <div>
            <Pageheader title="แก้ไขโครงการวิจัย" />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด</div>}
            {project && (
                <div className='space-y-4'>
                    <Block>
                        <div className='mb-4 flex justify-end'>
                            <Button variant="default" onClick={() => router.push(`/admin/form/project/edit/${project.documentId}`)}>แก้ไข</Button>
                        </div>
                        <div className="inputGroup">
                            <FieldView label="ปีงบประมาณ" value={project.fiscalYear} />
                            <FieldView label="ประเภทโครงการ" value={project.projectType == '0' ? 'โครงการวิจัย' : 'โครงการพัฒนาวิชาการประเภทงานวิจัย'} />
                            <FieldView label="ลักษณะโครงการวิจัย" value={project.projectMode == '0' ? 'โครงการวิจัยเดี่ยว' : 'แผนงานวิจัย หรือชุดโครงการวิจัย'} />
                            <FieldView label="จำนวนโครงการย่อย" value={project.subProjectCount} />
                            <FieldView label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (ไทย)" value={project.nameTH} />
                            <FieldView label="ชื่อแผนงานวิจัยหรือชุดโครงการวิจัย/โครงการวิจัย (อังกฤษ)" value={project.nameEN} />
                            <FieldView label="เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืนหรือไม่" value={project.isEnvironmentallySustainable === 0 ? 'ใช่' : 'ไม่ใช่'} />
                            <FieldView label="ระยะเวลาการทำวิจัย" value={`${project.durationStart} - ${project.durationEnd}`} />
                            <FieldView label="ประเภทงานวิจัย" value={researchKindOptions.find(option => option.value === project.researchKind)?.label} />
                            <FieldView label="ประเภทแหล่งทุน" value={fundTypeOptions.find(option => option.value === project.fundType)?.label} />
                            <FieldView label="ชื่อแหล่งทุน" value={project.fundName} />
                            <FieldView label="งบวิจัย" value={`฿${project.budget.toLocaleString()}`} />
                            <FieldView label="คำสำคัญ" value={project.keywords} />
                            <FieldView label="IC Types" value={project.ic_types?.map(ic => ic.name).join(', ')} />
                            <FieldView label="Impact" value={project.impacts?.map(ic => ic.name).join(', ')} />
                            <FieldView label="SDG" value={project.sdgs?.map(ic => ic.name).join(', ')} />
                            <FieldView label="ผู้ร่วมวิจัย" value={project.partners?.map(p => p.name).join(', ')} />
                        </div>
                    </Block>
                    <Block>
                        <h2 className="text-lg font-medium mb-3">ไฟล์แนบ</h2>
                        <div className="space-y-2">
                            {project.attachments && project.attachments.length > 0 ? (
                                project.attachments.map((file) => (
                                    <div key={file.documentId}>
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
                    <Block>
                        <h2 className="text-lg font-medium mb-3">ผู้ร่วมวิจัย</h2>
                        <PartnersView data={project.partners} />
                    </Block>
                </div>
            )}
        </div>
    )
}