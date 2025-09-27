"use client"

import React from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import toast, { Toaster } from 'react-hot-toast'
import Pageheader from '@/components/layout/Pageheader'
import FundForm from '@/components/form/FundForm'
import { GET_FUND, UPDATE_FUND, UPDATE_FUND_PARTNERS } from '@/graphql/formQueries'

export default function FundEditPage() {
  const params = useParams()
  const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { data: session } = useSession()

  const { data, loading, error } = useQuery(GET_FUND, {
    variables: { documentId },
    skip: !documentId,
    context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } }
  })

  const [updateFund] = useMutation(UPDATE_FUND, {
    context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } }
  })
  const [updateFundPartners] = useMutation(UPDATE_FUND_PARTNERS, {
    context: { headers: { Authorization: session?.jwt ? `Bearer ${session?.jwt}` : '' } }
  })

  const handleUpdate = async (fundData) => {
    try {
      const { partners = [], ...baseData } = fundData
      await updateFund({ variables: { documentId, data: baseData } })
      // update partners แยก เพื่อลดโอกาส relation conflict ถ้า schema มีเงื่อนไขเฉพาะ
      try {
        await updateFundPartners({ variables: { documentId, data: { partners } } })
      } catch (pe) {
        toast.error('บันทึกหลักสำเร็จ แต่ partners ผิดพลาด')
        return
      }
      toast.success('บันทึกข้อมูลสำเร็จ!')
    } catch (e) {
      console.error('Update fund error:', e)
      toast.error('บันทึกไม่สำเร็จ')
    }
  }

  const fund = data?.fund

  return (
    <div>
      <Pageheader title='แก้ไขคำขอรับทุน (ตำรา/หนังสือ)' />
      <Toaster />
      {loading && <div className='p-6'>Loading...</div>}
      {error && <div className='p-6 text-red-600'>โหลดข้อมูลผิดพลาด: {error.message}</div>}
      {fund && <FundForm initialData={fund} onSubmit={handleUpdate} isEdit />}
    </div>
  )
}
