import { CSVLink, CSVDownload } from "react-csv";
import { Button } from "@/components/ui/button";
export default function ReportTableC() {
  const csvData = [
    // คอมเมนต์ (ไทย): ตารางถอดจากรูปภาพฝั่งขวา — บางช่องมีความละเอียดต่ำจึงประมาณค่า/อนุมานไว้
    // คอลัมน์สรุป: Discipline, TCI_Tier1, TCI_Tier2, Non_TCI, Total_National,
    // ACI, Q1, Q2, Q3, Q4, Delisted_Scopus, Total_Scopus, SCIE, SSCI, ESCI, ABCI,
    // Total_Web_of_Science, A_star, A, B, C, Total_AB, AJG1, AJG2, AJG3, AJG4, AJG5,
    // Total_AJG, Other_PJR, Total_International_MultiCount, Total_Publications_MultiCount
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
      "Total_Web_of_Science",
      "A*",
      "A",
      "B",
      "C",
      "Total_AB",
      "AJG1",
      "AJG2",
      "AJG3",
      "AJG4",
      "AJG5",
      "Total_AJG",
      "Other_PJR",
      "Total_International_MultiCount",
      "Total_Publications_MultiCount"
    ],
    // แถวข้อมูล (ค่าบางส่วนประมาณ/อนุมานจากภาพ)
    ["Accounting", 22.5, 6, 0, 28.5, 5, 1, 1, 1, 10.5, 0, 2.3, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23.3, 51.8],
    ["Finance", 13.5, 10.5, 0, 24, 2, 1, 0, 4, 3, 0, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 39],
    ["Management", 17, 55.3, 2, 74.3, 3.3, 4.3, 5.3, 12, 0.8, 0, 1.3, 22.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 50.6, 124.8],
    ["Marketing", 10.7, 24.5, 1, 36.2, 6.3, 0, 1.7, 3, 1.5, 0, 0.3, 12.5, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 37.8, 74],
    ["Technology and Operation Management", 38.3, 18.7, 0, 57, 21.3, 0, 1.7, 3, 1, 0, 0.3, 12.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 39.8, 96.8],
    ["Total", 102, 115, 3, 220, 38, 7, 10.7, 32.5, 6.8, 0, 10.2, 117, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 19, 17, 175, 395]
  ];
  const reportData = [
    {
      discipline: "Accounting",
      tciTier1: 22.5,
      tciTier2: 6.0,
      nonListedTci: 0.0,
      totalNational: 28.5,
      aci: 11.0,
      totalScopus: 15.3,
      totalWebOfScience: 5,
      totalAbdc: 4,
      totalAjg: 4.5,
      otherPjr: 3,
      totalInternational: 42.8,
      totalPublications: 71.3
    },
    {
      discipline: "Finance",
      tciTier1: 13.5,
      tciTier2: 10.5,
      nonListedTci: 0.0,
      totalNational: 24.0,
      aci: 2.0,
      totalScopus: 17.0,
      totalWebOfScience: 14,
      totalAbdc: 7,
      totalAjg: 7,
      otherPjr: 1,
      totalInternational: 48.0,
      totalPublications: 72.0
    },
    {
      discipline: "Management",
      tciTier1: 17.0,
      tciTier2: 55.3,
      nonListedTci: 2.0,
      totalNational: 74.3,
      aci: 3.3,
      totalScopus: 22.7,
      totalWebOfScience: 12,
      totalAbdc: 7,
      totalAjg: 5,
      otherPjr: 4,
      totalInternational: 54.0,
      totalPublications: 128.3
    },
    {
      discipline: "Marketing",
      tciTier1: 10.7,
      tciTier2: 24.5,
      nonListedTci: 1.0,
      totalNational: 36.2,
      aci: 6.3,
      totalScopus: 49.5,
      totalWebOfScience: 22,
      totalAbdc: 5,
      totalAjg: 6.5,
      otherPjr: 10,
      totalInternational: 99.3,
      totalPublications: 135.5
    },
    {
      discipline: "Technology and Operation Management",
      tciTier1: 38.3,
      tciTier2: 18.7,
      nonListedTci: 0.0,
      totalNational: 57.0,
      aci: 21.3,
      totalScopus: 12.5,
      totalWebOfScience: 8,
      totalAbdc: 3,
      totalAjg: 4,
      otherPjr: 1,
      totalInternational: 49.8,
      totalPublications: 106.8
    }
  ]

  const totalRow = {
    discipline: "Total",
    tciTier1: 102.0,
    tciTier2: 115.0,
    nonListedTci: 3.0,
    totalNational: 220.0,
    aci: 44.0,
    totalScopus: 117.0,
    totalWebOfScience: 61.0,
    totalAbdc: 26.0,
    totalAjg: 27.0,
    otherPjr: 19.0,
    totalInternational: 294.0,
    totalPublications: 514.0
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                  rowSpan="2"
                >
                  Discipline
                </th>
                <th
                  className="bg-green-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                  colSpan="4"
                >
                  National Publications
                </th>
                <th
                  className="bg-pink-200 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                  colSpan="7"
                >
                  International Publications
                </th>
                <th
                  className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  rowSpan="2"
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
                  Total Scopus
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />Web of Science
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />ABDC
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />AJG
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Other PJR
                </th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                  Total<br />International<br />Publications with multiple counts
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
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalScopus}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalWebOfScience}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalAbdc}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.totalAjg}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{row.otherPjr}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{row.totalInternational}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">{row.totalPublications}</td>
                </tr>
              ))}

              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">{totalRow.discipline}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.tciTier1}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.tciTier2}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.nonListedTci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalNational}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.aci}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalScopus}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalWebOfScience}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAbdc}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAjg}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.otherPjr}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalInternational}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 font-bold">{totalRow.totalPublications}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <CSVLink filename={"Report3.xlsx"} data={csvData}><Button
        variant="success"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
      >
        <span>Export</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-3 3-3-3M12 12v9M5 20h14" />
        </svg>
      </Button></CSVLink>
    </>
  )
}
