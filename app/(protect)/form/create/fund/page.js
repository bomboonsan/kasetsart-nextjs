"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import { useMutation } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import FundForm from '@/components/form/FundForm'
import { CREATE_FUND, UPDATE_FUND_PARTNERS } from '@/graphql/formQueries'
import toast, { Toaster } from 'react-hot-toast'
import { normalizeDocumentId } from '@/utils/partners'

export default function FundCreatePage() {
	const { data: session } = useSession()
		const [createFund] = useMutation(CREATE_FUND, {
		context: {
			headers: {
				Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ''
			}
		}
	})
		const [updateFundPartners] = useMutation(UPDATE_FUND_PARTNERS, {
			context: {
				headers: {
					Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ''
				}
			}
		})

		const handleCreate = async (data) => {
			try {
				const { partners = [], ...baseData } = data
				// ไม่ส่ง partners ในการสร้างครั้งแรก (ลดขนาด payload)
				const res = await createFund({ variables: { data: baseData } })
				const newId = normalizeDocumentId(res?.data?.createFund?.documentId)
				if (newId && partners.length) {
					try {
						await updateFundPartners({ variables: { documentId: newId, data: { partners } } })
						toast.success('อัพเดท Partners สำเร็จ')
					} catch (pe) {
						console.error('Update partners failed:', pe)
						toast.error('สร้างสำเร็จแต่บันทึก Partners ไม่สำเร็จ')
					}
				}
				toast.success('สร้างข้อมูลทุนสำเร็จ')
				return newId
			} catch (e) {
				console.error(e)
				toast.error('บันทึกไม่สำเร็จ')
				throw e
			}
		}

	return (
		<div>
			<Pageheader title='สร้างคำขอรับทุน (ตำรา/หนังสือ)' />
			<Toaster />
			<FundForm onSubmit={handleCreate} />
		</div>
	)
}
