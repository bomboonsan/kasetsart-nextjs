"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import { GET_FUND } from '@/graphql/formQueries'

export default function FundViewPage() {
  const params = useParams()
  const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { data: session } = useSession()

  const { data, loading, error } = useQuery(GET_FUND, {
    variables: { documentId },
    skip: !documentId,
    context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } }
  })

  const fund = data?.fund

  return (
    <div>
      <Pageheader title='รายละเอียดคำขอรับทุน (ตำรา/หนังสือ)' />
      {loading && <div className='p-6'>Loading...</div>}
      {error && <div className='p-6 text-red-600'>โหลดข้อมูลผิดพลาด: {error.message}</div>}
      {fund && (
        <div className='p-6 space-y-4'>
          <div><strong>ประเภททุน:</strong> {fund.fundType} ({fund.fundTypeText})</div>
          <div><strong>คำอธิบาย:</strong> {fund.contentDesc}</div>
          <div><strong>เอกสารที่ผ่านมา:</strong> {fund.pastPublications}</div>
          <div><strong>วัตถุประสงค์:</strong> {fund.purpose}</div>
          <div><strong>กลุ่มเป้าหมาย:</strong> {fund.targetGroup}</div>
          <div><strong>บทและรายละเอียด:</strong> {fund.chapterDetails}</div>
          <div><strong>จำนวนหน้า:</strong> {fund.pages}</div>
          <div><strong>ระยะเวลา:</strong> {fund.duration}</div>
          <div><strong>บรรณานุกรม:</strong> {fund.references}</div>
          <div>
            <strong>ผู้เขียน:</strong>
            <ul className='list-disc ml-6'>
              {fund.writers?.map((w, i) => <li key={i}>{w.fullName} - {w.department} - {w.faculty}</li>)}
            </ul>
          </div>
          <div>
            <strong>Partners:</strong>
            <ul className='list-disc ml-6'>
              {fund.partners?.map((p, i) => <li key={i}>{p.partnerFullName || p.partner?.fullName}</li>)}
            </ul>
          </div>
          <div>
            <strong>ไฟล์แนบ:</strong>
            <ul className='list-disc ml-6'>
              {fund.attachments?.map(f => <li key={f.documentId}><a className='text-blue-600 underline' href={f.url} target='_blank' rel='noopener noreferrer'>{f.name}</a></li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
