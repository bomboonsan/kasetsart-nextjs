"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import { GET_PUBLICATION } from '@/graphql/formQueries'
import { Button } from '@/components/ui/button'
import Block from '@/components/layout/Block'
import FieldView from '@/components/myui/FieldView'
import PartnersView from '@/components/form/PartnersView'
import { formatDateToMMYYYY } from '@/utils/formatters'
import { PUBLICATION_FORM_INITIAL, listsStandardScopus, listsStandardScopusSubset, listsStandardABDC, listsStandardAJG, listsStandardWebOfScience } from '@/data/publication';

export default function PublicationView() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const { data, loading, error } = useQuery(GET_PUBLICATION, {
    variables: { documentId },
    skip: !documentId,
    context: {
      headers: {
        Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
      }
    }
  })

  const publication = data?.publication

  const toSelectOptions = useCallback((arr) => (arr || []).map(o => ({ value: String(o.value), label: o.label })), []);
  const scopusQuartileOptions = useMemo(() => toSelectOptions(listsStandardScopus), []);
  const scopusSubjectOptions = useMemo(() => toSelectOptions(listsStandardScopusSubset), []);
  const abdcOptions = useMemo(() => toSelectOptions(listsStandardABDC), []);
  const ajgOptions = useMemo(() => toSelectOptions(listsStandardAJG), []);
  const wosOptions = useMemo(() => toSelectOptions(listsStandardWebOfScience), []);


  return (
    <div>
      <Pageheader title="รายละเอียดผลงานตีพิมพ์" />
      {loading && <div className="p-6">Loading...</div>}
      {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด: {error.message}</div>}
      {publication && (
        <div className='space-y-4'>
          <Block>
            <div className='mb-4 flex justify-end'>
              <Button variant="default" onClick={() => router.push(`/form/publication/edit/${publication.documentId}`)}>แก้ไข</Button>
            </div>
            <div className="inputGroup">
              <FieldView label="ชื่อผลงาน (ไทย)" value={publication.titleTH || '-'} />
              <FieldView label="ชื่อผลงาน (อังกฤษ)" value={publication.titleEN || '-'} />
              <FieldView label="เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืนหรือไม่" value={publication.isEnvironmentallySustainable === '0' ? 'เกี่ยวข้อง' : publication.isEnvironmentallySustainable === '1' ? 'ไม่เกี่ยวข้อง' : '-'} />
              <FieldView label="ชื่อวารสาร / แหล่งตีพิมพ์" value={publication.journalName || '-'} />
              <FieldView label="โครงการวิจัยที่เกี่ยวข้อง" value={publication.projects?.[0]?.nameTH || '-'} />
              <FieldView label="DOI" value={publication.doi || '-'} />
              <FieldView label="ISSN" value={publication.isbn || '-'} /> {/* ใช้ isbn เก็บ ISSN ผิด */}
              <FieldView label="วัน/เดือน/ปี ที่ตีพิมพ์" value={formatDateToMMYYYY(publication.durationStart) + ' - ' + formatDateToMMYYYY(publication.durationEnd)} />
              <FieldView label="Volume" value={publication.volume || '-'} />
              <FieldView label="Issue" value={publication.issue || '-'} />
              <FieldView label="หน้าเริ่มต้น" value={publication.pageStart || '-'} />
              <FieldView label="หน้าสิ้นสุด" value={publication.pageEnd || '-'} />
              <FieldView label="ระดับ" value={publication.level === '0' ? 'ระดับชาติ' : publication.level === '1' ? 'ระดับนานาชาติ' : '-'} />
              <FieldView label="ฐานข้อมูลวารสาร" value={publication.isJournalDatabase == '0' ? 'อยู่ในฐานข้อมูล' : 'ไม่อยู่ในฐานข้อมูล'} />

              <div className={publication.isJournalDatabase == '0' ? "bg-gray-100/60 p-4 rounded-2xl mb-5 inputGroup shadow shadow-gray-400/50" : "hidden"}>
                <h2 className='text-lg font-bold'>
                  ดัชนี / มาตรฐานวารสาร
                </h2>

                {publication.isScopus && publication.isJournalDatabase == '0' && (
                  <FieldView label="Scopus" value={`${scopusQuartileOptions.find(option => option.value === publication.scopusValue)?.label || '-'} , ${scopusSubjectOptions.find(option => option.value === publication.scopusType)?.label || '-'}`} />
                )}
                {publication.isACI && publication.isJournalDatabase == '0' && (
                  <FieldView label="ACI" value="ใช่" />
                )}
                {publication.isTCI1 && publication.isJournalDatabase == '0' && (
                  <FieldView label="TCI1" value="ใช่" />
                )}
                {publication.isTCI2 && publication.isJournalDatabase == '0' && (
                  <FieldView label="TCI2" value="ใช่" />
                )}
                {publication.isABDC && publication.isJournalDatabase == '0' && (
                  <FieldView label="ABDC" value={`${abdcOptions.find(option => option.value === publication.abdcType)?.label || '-'}`} />
                )}
                {publication.isAJG && publication.isJournalDatabase == '0' && (
                  <FieldView label="AJG" value={`${ajgOptions.find(option => option.value === publication.ajgType)?.label || '-'}`} />
                )}
                {publication.isWOS && publication.isJournalDatabase == '0' && (
                  <FieldView label="WOS" value={`${wosOptions.find(option => option.value === publication.wosType)?.label || '-'}`} />
                )}
              </div>

              <FieldView label="ชื่อแหล่งทุน" value={publication.fundName || '-'} />
              <FieldView label="คำสำคัญ" value={publication.keywords || '-'} />
              <FieldView label="บทคัดย่อ (ไทย)" value={publication.abstractTH || '-'} />
              <FieldView label="บทคัดย่อ (อังกฤษ)" value={publication.abstractEN || '-'} />
            </div>
          </Block>
          <Block>
            <h2 className="text-lg font-medium mb-3">ไฟล์แนบ</h2>
            <div className="space-y-2">
              {publication.attachments && publication.attachments.length > 0 ? (
                publication.attachments.map((file) => (
                  <div key={file.documentId || file.id}>
                    <a href={`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338'}${file.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </a>
                  </div>
                ))
              ) : (
                <div>ไม่มีไฟล์แนบ</div>
              )}
            </div>
          </Block>
          {publication.projects && (
            <Block>
              <h2 className="text-lg font-medium mb-3">ผู้ร่วมวิจัย</h2>
              <PartnersView data={publication.projects[0].partners} />
            </Block>
          )}
        </div>
      )}
    </div>
  )
}
