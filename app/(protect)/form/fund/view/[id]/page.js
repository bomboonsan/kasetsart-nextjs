"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import Block from '@/components/layout/Block'
import FieldView from '@/components/myui/FieldView'
import PartnersView from '@/components/form/PartnersView'
import { Button } from '@/components/ui/button'
import { GET_FUND } from '@/graphql/formQueries'

export default function FundViewPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { data: session } = useSession()

  const { data, loading, error } = useQuery(GET_FUND, {
    variables: { documentId },
    skip: !documentId,
    context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } }
  })

  const fund = data?.fund

  if (!fund && !loading) {
    return <div className="p-6">ไม่พบข้อมูลคำขอรับทุน</div>
  }

  return (
    <div>
      <Pageheader title='รายละเอียดคำขอรับทุน (ตำรา/หนังสือ)' />
      {loading && <div className='p-6'>Loading...</div>}
      {error && <div className='p-6 text-red-600'>โหลดข้อมูลผิดพลาด: {error.message}</div>}
      {fund && (
        <div className='space-y-4'>
          <Block>
            <div className='mb-4 flex justify-end'>
              <Button variant="default" onClick={() => router.push(`/form/fund/edit/${fund.documentId}`)}>แก้ไข</Button>
            </div>
            <div className="inputGroup">
              <FieldView label="ชื่อทุนตำราหรือหนังสือ" value={fund.fundName} />
              <FieldView label="ลักษณะของผลงานวิชาการที่จะขอรับทุน" value={fund.fundTypeText} />
              <FieldView label="คำอธิบายเนื้อหาของตำราหรือหนังสือ" value={fund.contentDesc} />
              <FieldView label="เอกสารทางวิชาการ ตำรา หรือหนังสือ ที่ผ่านมา" value={fund.pastPublications} />
              <FieldView label="วัตถุประสงค์ของตำราหรือหนังสือ" value={fund.purpose} />
              <FieldView label="กลุ่มเป้าหมายของตำราหรือหนังสือ" value={fund.targetGroup} />
              <FieldView label="การแบ่งบทและรายละเอียดในแต่ละบทของตำรา/หนังสือ" value={fund.chapterDetails} />
              <FieldView label="จำนวนหน้าประมาณ" value={fund.pages} />
              <FieldView label="ระยะเวลาที่จะใช้ในการเขียนประมาณ" value={fund.duration} />
              <FieldView label="รายชื่อหนังสือและเอกสารอ้างอิง (บรรณานุกรม)" value={fund.references} />
              <FieldView label=" " value={fund.references2} />
              <FieldView label=" " value={fund.references3} />
              <FieldView label=" " value={fund.references4} />
            </div>
          </Block>

          <Block>
            <h2 className="text-lg font-medium mb-3">ไฟล์แนบ</h2>
            <div className="space-y-2">
              {fund.attachments && fund.attachments.length > 0 ? (
                fund.attachments.map((file) => (
                  <div key={file.documentId}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
            <h2 className="text-lg font-medium mb-3">ผู้เขียน</h2>
            <div className="space-y-2">
              {fund.writers && fund.writers.length > 0 ? (
                fund.writers.map((writer, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{writer.fullName}</div>
                    <div className="text-sm text-gray-600">{writer.department} - {writer.faculty}</div>
                    {writer.phone && <div className="text-sm text-gray-600">โทร: {writer.phone}</div>}
                    {writer.email && <div className="text-sm text-gray-600">อีเมล: {writer.email}</div>}
                  </div>
                ))
              ) : (
                <div>ไม่มีข้อมูลผู้เขียน</div>
              )}
            </div>
          </Block>

          <Block>
            <h2 className="text-lg font-medium mb-3">ผู้ร่วมงาน</h2>
            <PartnersView data={fund.partners} />
          </Block>
        </div>
      )}
    </div>
  )
}
