import { useEffect, useState } from 'react'
import { CSVLink, CSVDownload } from "react-csv";
import { Button } from "@/components/ui/button";
import { reportAPI } from '@/lib/api/reports'
import ReportFilters from '@/components/report/ReportFilters'


import { useQuery } from '@apollo/client/react'
import { GET_REPORT_C } from '@/graphql/reportQueries'

export default function ReportTableC() {
  const [reportData, setReportData] = useState([])
  const [totalRow, setTotalRow] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        // ดึงข้อมูลจาก API
        const reportRes = await reportAPI.getPublicationsByDepartment()
        const data = reportRes?.data || []
        const total = reportRes?.total || {}

        if (!mounted) return
        setReportData(data)
        setTotalRow(total)

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
      "TCI_Tier1",
      "TCI_Tier2",
      "Non_TCI",
      "Total_National",
      "ACI",
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "Delisted_Scopus",
      "Total_Scopus",
      "SCIE",
      "SSCI",
      "ESCI",
      "ABCI",
      "ESCI2",
      "Total_Web_of_Science",
      "A*",
      "A",
      "B",
      "C",
      "Total_ABDC",
      "AJG1",
      "AJG2",
      "AJG3",
      "AJG4",
      "AJG4*",
      "Total_AJG",
      "Other_PJR",
      "Total_International_MultiCount",
      "Total_Publications_MultiCount"
    ],
    ...reportData.map(row => [
      row.discipline,
      row.tciTier1,
      row.tciTier2,
      row.nonTci,
      row.totalNational,
      row.aci,
      row.q1,
      row.q2,
      row.q3,
      row.q4,
      0, // Delisted from Scopus - ไม่มีในข้อมูล
      row.totalScopus,
      row.scie,
      row.ssci,
      row.esci,
      row.abci,
      row.esci2,
      row.totalWebOfScience,
      row.aStar,
      row.a,
      row.b,
      row.c,
      row.totalAbdc,
      row.ajg1,
      row.ajg2,
      row.ajg3,
      row.ajg4,
      row.ajg4Star,
      row.totalAjg,
      row.otherPjr,
      row.totalInternational,
      row.totalPublications
    ]),
    // เพิ่ม Total row
    [
      totalRow.discipline || "Total",
      totalRow.tciTier1 || 0,
      totalRow.tciTier2 || 0,
      totalRow.nonTci || 0,
      totalRow.totalNational || 0,
      totalRow.aci || 0,
      totalRow.q1 || 0,
      totalRow.q2 || 0,
      totalRow.q3 || 0,
      totalRow.q4 || 0,
      0, // Delisted from Scopus
      totalRow.totalScopus || 0,
      totalRow.scie || 0,
      totalRow.ssci || 0,
      totalRow.esci || 0,
      totalRow.abci || 0,
      totalRow.esci2 || 0,
      totalRow.totalWebOfScience || 0,
      totalRow.aStar || 0,
      totalRow.a || 0,
      totalRow.b || 0,
      totalRow.c || 0,
      totalRow.totalAbdc || 0,
      totalRow.ajg1 || 0,
      totalRow.ajg2 || 0,
      totalRow.ajg3 || 0,
      totalRow.ajg4 || 0,
      totalRow.ajg4Star || 0,
      totalRow.totalAjg || 0,
      totalRow.otherPjr || 0,
      totalRow.totalInternational || 0,
      totalRow.totalPublications || 0
    ]
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">กำลังโหลดรายงาน...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-red-600">เกิดข้อผิดพลาดในการโหลดรายงาน</p>
        <p className="text-gray-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <>
      <ReportFilters />
      <div className="bg-white rounded-lg border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[2000px]">
            <thead>
              <tr className="">
                <th
                  className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                  rowSpan="2"
                >
                  Discipline
                </th>
                <th
                  className="bg-green-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-b"
                  colSpan="4"
                >
                  National Publications
                </th>
                <th
                  className="bg-pink-200 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-b"
                  colSpan="26"
                >
                  International Publications
                </th>
                <th
                  className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  rowSpan="3"
                >
                  Total Publications<br />(National + International)<br />with multiple count
                </th>


              </tr>
              <tr>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  TCI<br />(Tier 1)
                </th>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  TCI<br />(Tier 2)
                </th>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Non-listed<br />on TCI
                </th>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />National<br />Publications
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  ACI
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Q1
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Q2
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Q3
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Q4
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Delisted from Scopus (as of July 2024)
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total Scopus
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  SCIE
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  SSCI
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  ESCI
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  ABCI
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  ESCI
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />Web of Science
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  A*
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  A
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  B
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  C
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />ABDC
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  AJG1
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  AJG2
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  AJG3
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  AJG4
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  AJG4*
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />AJG
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Other PJR
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />International<br />Publications
                </th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={32} className="px-4 py-6 text-center text-sm text-gray-500">กำลังโหลด...</td></tr>
              ) : error ? (
                <tr><td colSpan={32} className="px-4 py-6 text-center text-sm text-red-600">{error}</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan={32} className="px-4 py-6 text-center text-sm text-gray-500">ยังไม่มีข้อมูล</td></tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-r font-medium">
                      {row.discipline}
                    </td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.tciTier1}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.tciTier2}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.nonTci}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{row.totalNational}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aci}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q1}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q2}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q3}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q4}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">0</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalScopus}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.scie}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ssci}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.esci}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.abci}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.esci2}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalWebOfScience}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aStar}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.a}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.b}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.c}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalAbdc}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ajg1}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ajg2}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ajg3}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ajg4}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ajg4Star}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalAjg}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.otherPjr}</td>
                    <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{row.totalInternational}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">{row.totalPublications}</td>
                  </tr>
                ))
              )}

              {!loading && !error && reportData.length > 0 && (
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">{totalRow.discipline}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.tciTier1}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.tciTier2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.nonTci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalNational}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q1}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q3}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q4}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">0</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalScopus}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.scie}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ssci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.esci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.abci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.esci2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalWebOfScience}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aStar}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.a}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.b}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.c}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAbdc}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ajg1}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ajg2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ajg3}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ajg4}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ajg4Star}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAjg}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.otherPjr}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalInternational}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-bold">{totalRow.totalPublications}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && reportData.length > 0 && (
        <CSVLink filename={"PublicationsReport.csv"} data={csvData}>
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