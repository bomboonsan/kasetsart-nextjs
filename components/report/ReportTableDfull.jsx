import { useEffect, useState } from 'react'
import { CSVLink, CSVDownload } from "react-csv";
import { Button } from "@/components/ui/button";
import { reportAPI } from '@/lib/api/reports'
import ReportFilters from '@/components/report/ReportFilters'

import { useQuery } from '@apollo/client/react'
import { GET_REPORT_D } from '@/graphql/reportQueries'

export default function ReportTableC() {
  const [reportData, setReportData] = useState([])
  const [totalRow, setTotalRow] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [csvData, setCsvData] = useState([])

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError('')

        const reportRes = await reportAPI.getMultipleCountPublicationsByDepartment()

        if (!mounted) return

        if (reportRes?.data) {
          setReportData(reportRes.data)
          setTotalRow(reportRes.total || {})

          // เตรียมข้อมูลสำหรับ CSV export
          const csvHeaders = [
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
            "ESCI",
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
          ]

          const csvRows = reportRes.data.map(row => [
            row.discipline,
            row.tciTier1,
            row.tciTier2,
            row.nonListedTci,
            row.totalNational,
            row.aci,
            row.q1,
            row.q2,
            row.q3,
            row.q4,
            row.delistedFromScopus,
            row.totalScopus,
            row.sciE,
            row.ssci,
            row.esci,
            row.abci,
            row.eSci,
            row.totalWebOfScience,
            row.aStar,
            row.a,
            row.b,
            row.c,
            row.totalAbdc,
            row.aj1,
            row.aj2,
            row.aj3,
            row.aj4,
            row.aj4Star,
            row.totalAjg,
            row.otherPjr,
            row.totalInternational,
            row.totalPublications
          ])

          // เพิ่ม Total row
          if (reportRes.total) {
            csvRows.push([
              reportRes.total.discipline,
              reportRes.total.tciTier1,
              reportRes.total.tciTier2,
              reportRes.total.nonListedTci,
              reportRes.total.totalNational,
              reportRes.total.aci,
              reportRes.total.q1,
              reportRes.total.q2,
              reportRes.total.q3,
              reportRes.total.q4,
              reportRes.total.delistedFromScopus,
              reportRes.total.totalScopus,
              reportRes.total.sciE,
              reportRes.total.ssci,
              reportRes.total.esci,
              reportRes.total.abci,
              reportRes.total.eSci,
              reportRes.total.totalWebOfScience,
              reportRes.total.aStar,
              reportRes.total.a,
              reportRes.total.b,
              reportRes.total.c,
              reportRes.total.totalAbdc,
              reportRes.total.aj1,
              reportRes.total.aj2,
              reportRes.total.aj3,
              reportRes.total.aj4,
              reportRes.total.aj4Star,
              reportRes.total.totalAjg,
              reportRes.total.otherPjr,
              reportRes.total.totalInternational,
              reportRes.total.totalPublications
            ])
          }

          setCsvData([csvHeaders, ...csvRows])
        }

      } catch (err) {
        console.error('Error loading publications report:', err)
        if (mounted) {
          setError('Failed to load publications report data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading publications report...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700">{error}</div>
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
              <tr>
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
                  className="bg-orange-50 border-b px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  rowSpan="3"
                >
                  Total Publications<br />(National + International)<br />with single count
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
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r font-medium">
                    {row.discipline}
                  </td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.tciTier1}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.tciTier2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.nonListedTci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{row.totalNational}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q1}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q3}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.q4}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.delistedFromScopus}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalScopus}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.sciE}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.ssci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.esci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.abci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.eSci}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalWebOfScience}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aStar}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.a}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.b}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.c}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalAbdc}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aj1}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aj2}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aj3}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aj4}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.aj4Star}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalAjg}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.otherPjr}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{row.totalInternational}</td>
                  <td className="bg-orange-50 px-4 py-3 text-sm text-center text-gray-900 font-medium">{row.totalPublications}</td>
                </tr>
              ))}

              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">{totalRow.discipline}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.tciTier1}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.tciTier2}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.nonListedTci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalNational}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q1}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q2}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q3}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.q4}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.delistedFromScopus}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalScopus}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.sciE}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.ssci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.esci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.abci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.eSci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalWebOfScience}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aStar}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.a}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.b}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.c}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAbdc}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aj1}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aj2}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aj3}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aj4}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aj4Star}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAjg}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.otherPjr}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalInternational}</td>
                <td className="bg-orange-50 px-4 py-3 text-sm text-center text-gray-900 font-bold">{totalRow.totalPublications}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && reportData.length > 0 && (
        <CSVLink filename={"MultipleCountPublicationsReport.csv"} data={csvData}>
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
