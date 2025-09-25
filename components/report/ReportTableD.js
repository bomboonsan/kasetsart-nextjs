export default function ReportTableC() {
  const reportData = [
    {
      discipline: "Accounting",
  tciTier1: 13.5,
  tciTier2: 6.0,
  nonListedTci: 0.0,
  totalNational: 19.5,
  aci: 5.0,
  totalScopus: 15.3,
  totalWebOfScience: 0,
  totalAbdc: 0,
  totalAjg: 0,
  otherPjr: 3,
  totalInternational: 23.3,
  totalPublications: 42.8
    },
    {
      discipline: "Finance",
  tciTier1: 11.5,
  tciTier2: 10.5,
  nonListedTci: 0.0,
  totalNational: 22.0,
  aci: 2.0,
  totalScopus: 17.0,
  totalWebOfScience: 0,
  totalAbdc: 0,
  totalAjg: 0,
  otherPjr: 1,
  totalInternational: 20.0,
  totalPublications: 42.0
    },
    {
      discipline: "Management",
  tciTier1: 14.7,
  tciTier2: 54.3,
  nonListedTci: 2.0,
  totalNational: 71.0,
  aci: 3.3,
  totalScopus: 22.7,
  totalWebOfScience: 0,
  totalAbdc: 0,
  totalAjg: 0,
  otherPjr: 4,
  totalInternational: 30.0,
  totalPublications: 101.0
    },
    {
      discipline: "Marketing",
  tciTier1: 7.3,
  tciTier2: 21.5,
  nonListedTci: 1.0,
  totalNational: 29.8,
  aci: 6.3,
  totalScopus: 49.5,
  totalWebOfScience: 0,
  totalAbdc: 0,
  totalAjg: 0,
  otherPjr: 10,
  totalInternational: 65.8,
  totalPublications: 95.7
    },
    {
      discipline: "Technology and Operation Management",
  tciTier1: 21.0,
  tciTier2: 14.7,
  nonListedTci: 0.0,
  totalNational: 35.7,
  aci: 21.3,
  totalScopus: 12.5,
  totalWebOfScience: 1,
  totalAbdc: 0,
  totalAjg: 0,
  otherPjr: 1,
  totalInternational: 35.8,
  totalPublications: 71.5
    }
  ]

  const totalRow = {
    discipline: "Total",
  tciTier1: 68.0,
  tciTier2: 107.0,
  nonListedTci: 3.0,
  totalNational: 178.0,
  aci: 38.0,
  totalScopus: 117.0,
  totalWebOfScience: 1.0,
  totalAbdc: 0,
  totalAjg: 0,
  otherPjr: 19.0,
  totalInternational: 175.0,
  totalPublications: 353.0
  }

  return (
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
                className="bg-orange-50 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                rowSpan="2"
              >
                Total Publications<br/>(National + International)<br/>with single count
              </th>
            </tr>
            <tr>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                TCI<br/>(Tier 1)
              </th>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                TCI<br/>(Tier 2)
              </th>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Non-listed<br/>on TCI
              </th>
              <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Total<br/>National<br/>Publications
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                ACI
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Total Scopus
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Total<br/>Web of Science
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Total<br/>ABDC
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Total<br/>AJG
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Other PJR
              </th>
              <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">
                Total<br/>International<br/>Publications
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
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalScopus}</td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalWebOfScience}</td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAbdc}</td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.totalAjg}</td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{totalRow.otherPjr}</td>
              <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{totalRow.totalInternational}</td>
              <td className="bg-orange-50 px-4 py-3 text-sm text-center text-gray-900 font-bold">{totalRow.totalPublications}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
