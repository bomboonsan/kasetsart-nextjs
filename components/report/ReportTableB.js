import { useEffect, useState } from 'react'
import { reportAPI } from '@/lib/api'
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import ReportFilters from '@/components/report/ReportFilters'

export default function ReportTableB() {
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ teaching: 0, research: 0, practice: 0, societal: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Impact names ตามที่กำหนด
  const IMPACT_NAMES = {
    teaching: 'Teaching & Learning Impact',
    research: 'Research & Scholarly Impact',
    practice: 'Practice & Community Impact',
    societal: 'Societal Impact'
  }

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        // ดึงข้อมูลจาก API ใหม่
        const reportRes = await reportAPI.getImpactsByDepartment()
        const reportData = reportRes?.data || []

        const resultRows = []
        const totalsAcc = { teaching: 0, research: 0, practice: 0, societal: 0 }

        for (const dept of reportData) {
          const discipline = dept.name || 'Unknown Department'
          
          // จัดการข้อมูล impacts
          const impactMap = (dept.impacts || []).reduce((acc, impact) => {
            acc[impact.name] = Number(impact.value || 0)
            return acc
          }, {})

          const teaching = Number(impactMap[IMPACT_NAMES.teaching] || 0)
          const research = Number(impactMap[IMPACT_NAMES.research] || 0)
          const practice = Number(impactMap[IMPACT_NAMES.practice] || 0)
          const societal = Number(impactMap[IMPACT_NAMES.societal] || 0)

          totalsAcc.teaching += teaching
          totalsAcc.research += research
          totalsAcc.practice += practice
          totalsAcc.societal += societal

          const total = teaching + research + practice + societal
          resultRows.push({ discipline, teaching, research, practice, societal, total })
        }

        const totalAll = totalsAcc.teaching + totalsAcc.research + totalsAcc.practice + totalsAcc.societal
        
        if (!mounted) return
        setRows(resultRows)
        setTotals({ ...totalsAcc, total: totalAll })
        
      } catch (e) {
        if (mounted) {
          setError(e?.message || String(e))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  // จัดเตรียมข้อมูลสำหรับ CSV Export
  const csvData = [
    [
      "Discipline",
      "Teaching & Learning Impact",
      "Research & Scholarly Impact", 
      "Practice & Community Impact",
      "Societal Impact",
      "Total"
    ],
    ...rows.map(row => [
      row.discipline,
      row.teaching,
      row.research,
      row.practice,
      row.societal,
      row.total
    ]),
    // เพิ่ม Total row
    [
      "Total",
      totals.teaching,
      totals.research,
      totals.practice,
      totals.societal,
      totals.total
    ]
  ]

  return (
    <>
      <ReportFilters />
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-blue-100">
          <h3 className="text-center text-lg font-bold text-gray-800">Impacts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r">
                  Discipline
                </th>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r">
                  Teaching & Learning Impact
                </th>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r">
                  Research & Scholarly Impact
                </th>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r">
                  Practice & Community Impact
                </th>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r">
                  Societal Impact
                </th>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">กำลังโหลด...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-red-600">{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">ยังไม่มีข้อมูล</td></tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-r font-medium">{row.discipline}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.teaching).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.research).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.practice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.societal).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">{Number(row.total).toFixed(2)}</td>
                  </tr>
                ))
              )}

              {!loading && !error && rows.length > 0 && (
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">Total</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.teaching).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.research).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.practice).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.societal).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-bold">{Number(totals.total).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {!loading && !error && rows.length > 0 && (
        <CSVLink filename={"ImpactsReport.csv"} data={csvData}>
          <Button 
            variant="success"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mt-4"
          >
            <span>Export CSV</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-3 3-3-3M12 12v9M5 20h14" />
            </svg>
          </Button>
        </CSVLink>
      )}
    </>
  )
}
