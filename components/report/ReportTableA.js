import { CSVLink, CSVDownload } from "react-csv";
import { Button } from "@/components/ui/button";
import useSWR from 'swr'
import { reportAPI } from '@/lib/api/reports'
import ReportFilters from '@/components/report/ReportFilters'

export default function ReportTableA() {
  // ดึงข้อมูลจาก API
  const { data: reportResponse, error, isLoading } = useSWR(
    'report-intellectual-contributions',
    reportAPI.getIntellectualContributionsByDepartment
  )

  const reportData = reportResponse?.data || []
  const totalRow = reportResponse?.total || {}

  // จัดเตรียมข้อมูลสำหรับ CSV Export
  const csvData = [
    [
      "Discipline",
      "TotalMembers",
      "MembersWithoutICS",
      "MembersWithICS",
      "Portfolio_BDS",
      "Portfolio_AIS",
      "Portfolio_TLS",
      "Portfolio_Total",
      "Types_BDS",
      "Types_APR_ER_Proceeding",
      "Types_AllOther",
      "Types_Total",
      "%_Part",
      "%_All"
    ],
    ...reportData.map(row => [
      row.discipline,
      row.totalMembers,
      row.membersWithoutICs,
      row.membersWithICs,
      row.bds,
      row.ais,
      row.tls,
      row.total,
      row.bdsTypes,
      row.aprEr,
      row.allOther,
      row.totalTypes,
      row.part,
      row.all
    ]),
    // เพิ่ม Total row
    [
      totalRow.discipline || "Total",
      totalRow.totalMembers || 0,
      totalRow.membersWithoutICs || 0,
      totalRow.membersWithICs || 0,
      totalRow.bds || 0,
      totalRow.ais || 0,
      totalRow.tls || 0,
      totalRow.total || 0,
      totalRow.bdsTypes || 0,
      totalRow.aprEr || 0,
      totalRow.allOther || 0,
      totalRow.totalTypes || 0,
      totalRow.part || 0,
      totalRow.all || 0
    ]
  ]

  if (isLoading) {
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
        <p className="text-gray-600 text-sm mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <>
      <ReportFilters />
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th
                className="bg-blue-100 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                rowSpan="2"
              >
                Discipline
              </th>
              <th
                className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                rowSpan="2"
              >
                Total<br />Members
              </th>
              <th
                className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                rowSpan="2"
              >
                Members<br />Without<br />ICs
              </th>
              <th
                className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                rowSpan="2"
              >
                Members<br />With ICs
              </th>
              <th
                className="bg-pink-200 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                colSpan="4"
              >
                Portfolio Of ICs
              </th>
              <th
                className="bg-green-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                colSpan="4"
              >
                Types Of Intellectual Contribution
              </th>
              <th
                className="bg-yellow-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                colSpan="2"
              >
                % Faculty Producing ICs
              </th>
            </tr>
            <tr>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">BDS</th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AIS</th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">TLS</th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">TOTAL</th>

                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">PRJ</th>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                APR/ER<br /><span className="text-[10px]">PROCEEDING</span>
              </th>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">ALL OTHER</th>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">TOTAL</th>

              <th className="bg-yellow-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">PART</th>
              <th className="bg-yellow-100 px-2 py-2 text-center text-xs font-medium text-gray-700">ALL</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 border-r">
                  <div>
                    <div className="font-medium">{row.discipline}</div>
                    {row.subdiscipline && (
                      <div className="text-xs text-gray-500">
                        {row.subdiscipline}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">
                  {row.totalMembers}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">
                  {row.membersWithoutICs}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">
                  {row.membersWithICs}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.bds}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.ais}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.tls}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">
                  {row.total}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.bdsTypes}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.aprEr}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.allOther}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">
                  {row.totalTypes}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                  {row.part}
                </td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium">
                  {row.all}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">
                {totalRow.discipline}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.totalMembers}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.membersWithoutICs}
              </td>
              <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.membersWithICs}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.bds}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.ais}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.tls}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">
                {totalRow.total}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.bdsTypes}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.aprEr}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.allOther}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">
                {totalRow.totalTypes}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">
                {totalRow.part}
              </td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 font-bold">
                {totalRow.all}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
      <CSVLink filename={"Report1.xlsx"} data={csvData}><Button 
        variant="success"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
      >
        <span>Export</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-3 3-3-3M12 12v9M5 20h14" />
        </svg>
      </Button></CSVLink>
    </>
  );
}
