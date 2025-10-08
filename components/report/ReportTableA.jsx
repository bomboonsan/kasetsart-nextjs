import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import ReportFilters from '@/components/report/ReportFilters'
import { useQuery } from '@apollo/client/react'
import { GET_REPORT_A } from '@/graphql/reportQueries'
import { useMemo } from 'react'

export default function ReportTableA() {
  const { data, loading, error } = useQuery(GET_REPORT_A)
  const fmt1 = (v) => (v === 0 || v ? Number(v).toFixed(1) : '')

  // Constants for IC type documentIds
  const IC_TYPE_IDS = {
    BDS: 'fdjpi1aog5lx9gvjxlnf47ym', // Basic or Discovery Scholarship
    AIS: 'ajvjbvrlfv7vz5owyr3qrdsn', // Applied Integrative / Application Scholarship
    TLS: 'bnl6a37iee0vec6aj3q3qm31'  // Teaching and Learning Scholarship
  }

  const { rows: reportData, total: totalRow, csvData } = useMemo(() => {
    if (!data) return { rows: [], total: {}, csvData: [] }

    const departments = data.departments || []
    const users = data.usersPermissionsUsers || []
    const publications = data.publications || []
    const conferences = data.conferences || []
    const books = data.books || []

    // Helper: map departmentId -> users
    const deptUsersMap = new Map()
    users.forEach(u => {
      (u.departments || []).forEach(dep => {
        if (!deptUsersMap.has(dep.documentId)) deptUsersMap.set(dep.documentId, [])
        deptUsersMap.get(dep.documentId).push(u)
      })
    })

    // Publication IC type counts per department
    const deptStats = departments.map(dep => {
      const depId = dep.documentId
      const depUsers = deptUsersMap.get(depId) || []
      const totalMembers = depUsers.length
      const membersWithICsSet = new Set()

      let bds = 0, ais = 0, tls = 0

      publications.forEach(pub => {
        (pub.projects || []).forEach(prj => {
          // A project contributes to dept if project has department OR any user belongs to dept (we only have project.departments for now)
          const projectDeptIds = (prj.departments || []).map(d => d.documentId)
          if (projectDeptIds.includes(depId)) {
            const types = prj.ic_types || []
            let hasType = false
            types.forEach(t => {
              if (t.documentId === IC_TYPE_IDS.BDS) { bds++; hasType = true }
              else if (t.documentId === IC_TYPE_IDS.AIS) { ais++; hasType = true }
              else if (t.documentId === IC_TYPE_IDS.TLS) { tls++; hasType = true }
            })
            if (hasType) {
              // Without project -> user relation we approximate membersWithICs using all dept users (could refine if we had linking)
              depUsers.forEach(u => membersWithICsSet.add(u.documentId))
            }
          }
        })
      })

      // Types of ICs (PRJ / APR-ER PROCEEDING / ALL OTHER)
      // Based on instructions: PRJ from publication.project.partners, APR/ER from conference.project.partners, ALL OTHER from book.fund.partners
      let prj = 0, aprEr = 0, allOther = 0

      const accumulatePartners = (partners, category) => {
        if (!Array.isArray(partners)) return
        partners.forEach(p => {
          // partners likely stored as JSON string or array of objects; we expect partnerProportion & maybe a user or department linkage.
          // If object has user departments we could filter; current schema returns scalar 'partners'. So we attempt JSON.parse fallback.
          let item = p
          if (typeof p === 'string') {
            try { item = JSON.parse(p) } catch { /* ignore */ }
          }
          // If item is array, recurse
          if (Array.isArray(item)) return accumulatePartners(item, category)
          if (item && typeof item === 'object') {
            // Check department id of user
            const userDeps = item.user?.departments || item.User?.departments || []
            const userDepIds = userDeps.map(d => d.documentId || d.id)
            if (userDepIds.includes(depId) || depUsers.length === 0) {
              const proportion = Number(item.partnerProportion || item.partnerProportion_percentage_custom || 0)
              if (!isNaN(proportion)) {
                if (category === 'prj') prj += proportion
                else if (category === 'aprEr') aprEr += proportion
                else if (category === 'allOther') allOther += proportion
              } else {
                if (category === 'prj') prj += 1
                else if (category === 'aprEr') aprEr += 1
                else if (category === 'allOther') allOther += 1
              }
            }
          }
        })
      }

      publications.forEach(pub => {
        (pub.projects || []).forEach(prjObj => {
          if ((prjObj.departments || []).some(d => d.documentId === depId)) {
            accumulatePartners(prjObj.partners, 'prj')
          }
        })
      })
      conferences.forEach(conf => {
        (conf.projects || []).forEach(prjObj => {
          if ((prjObj.departments || []).some(d => d.documentId === depId)) {
            accumulatePartners(prjObj.partners, 'aprEr')
          }
        })
      })
      books.forEach(book => {
        (book.funds || []).forEach(fund => {
          accumulatePartners(fund.partners, 'allOther')
        })
      })

      // Members with/without ICs
      const membersWithICs = membersWithICsSet.size
      const membersWithoutICs = totalMembers - membersWithICs

      // PART: users with participation == 0
      const partCount = depUsers.filter(u => Number(u.participation) === 0).length

      // ALL: total users in department (same as totalMembers)
      const allCount = totalMembers

      const portfolioTotal = bds + ais + tls
      const typesTotal = prj + aprEr + allOther

      return {
        discipline: dep.title,
        totalMembers,
        membersWithoutICs,
        membersWithICs,
        bds,
        ais,
        tls,
        total: portfolioTotal,
        bdsTypes: prj, // mapping provided: Types_BDS column is PRJ per instructions (naming difference)
        aprEr,
        allOther,
        totalTypes: typesTotal,
        part: partCount,
        all: allCount
      }
    })

    // Aggregate total row
    const total = deptStats.reduce((acc, row) => {
      Object.keys(row).forEach(k => {
        if (k === 'discipline') return
        acc[k] = (acc[k] || 0) + (typeof row[k] === 'number' ? row[k] : 0)
      })
      return acc
    }, {})
    const totalRow = { discipline: 'Total', ...total }

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
      ...deptStats.map(r => [
        r.discipline,
        r.totalMembers,
        r.membersWithoutICs,
        r.membersWithICs,
        r.bds,
        r.ais,
        r.tls,
        r.total,
        r.bdsTypes,
        r.aprEr,
        r.allOther,
        r.totalTypes,
        r.part,
        r.all
      ]),
      [
        totalRow.discipline,
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

    return { rows: deptStats, total: totalRow, csvData }
  }, [data])

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
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.totalMembers)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.membersWithoutICs)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.membersWithICs)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.bds)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.ais)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.tls)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{fmt1(row.total)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.bdsTypes)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.aprEr)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.allOther)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{fmt1(row.totalTypes)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.part)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium">{fmt1(row.all)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">
                  {totalRow.discipline}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.totalMembers)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.membersWithoutICs)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.membersWithICs)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.bds)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.ais)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.tls)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{fmt1(totalRow.total)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.bdsTypes)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.aprEr)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.allOther)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{fmt1(totalRow.totalTypes)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.part)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-bold">{fmt1(totalRow.all)}</td>
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
