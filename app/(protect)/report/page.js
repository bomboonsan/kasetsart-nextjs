"use client"
import { useState } from 'react'
import ReportHeader from '@/components/report/ReportHeader'
import ReportTableA from '@/components/report/ReportTableA'
import ReportTableB from '@/components/report/ReportTableB'
import ReportTableC from '@/components/report/ReportTableC'
import ReportTableCfull from '@/components/report/ReportTableCfull'
import ReportTableD from '@/components/report/ReportTableD'
import ReportTableDfull from '@/components/report/ReportTableDfull'
import ReportTableE from '@/components/report/ReportTableE'
import ReportTableF from '@/components/report/ReportTableF'

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState('table-a')

    return (
        <div className="space-y-6">
            <ReportHeader selectedReport={selectedReport} onChange={setSelectedReport} />
            {/* Render only the selected table */}
            {selectedReport === 'table-a' && <ReportTableA />}
            {selectedReport === 'table-b' && <ReportTableB />}
            {selectedReport === 'table-c' && <ReportTableCfull />}
            {selectedReport === 'table-d' && <ReportTableDfull />}
            {selectedReport === 'table-e' && <ReportTableE />}
            {selectedReport === 'table-f' && <ReportTableF />}
        </div>
    )
}
