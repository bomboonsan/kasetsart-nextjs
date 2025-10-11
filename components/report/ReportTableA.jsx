import { useEffect, useState, useMemo } from 'react'
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import ReportFilters from '@/components/report/ReportFilters'
import { useQuery } from '@apollo/client/react'
import { GET_REPORT_A } from '@/graphql/reportQueries'

export default function ReportTableA() {
  const { data, loading, error } = useQuery(GET_REPORT_A)
  const fmt1 = (v) => (v === 0 || v ? Number(v).toFixed(1) : '')
  const currentYear = new Date().getFullYear()
  const MIN_YEAR = 2019
  const [startYear, setStartYear] = useState(MIN_YEAR)
  const [endYear, setEndYear] = useState(currentYear)

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
    const allPublications = data.publications || []
    const allConferences = data.conferences || []
    const allBooks = data.books || []

    // Filter data by year range
    const publications = allPublications.filter(pub => {
      if (!pub.durationStart && !pub.durationEnd) return true
      const pubStartYear = pub.durationStart ? new Date(pub.durationStart).getFullYear() : null
      const pubEndYear = pub.durationEnd ? new Date(pub.durationEnd).getFullYear() : null

      // If only start date exists
      if (pubStartYear && !pubEndYear) {
        return pubStartYear >= startYear && pubStartYear <= endYear
      }
      // If only end date exists
      if (!pubStartYear && pubEndYear) {
        return pubEndYear >= startYear && pubEndYear <= endYear
      }
      // If both dates exist, check if ranges overlap
      if (pubStartYear && pubEndYear) {
        const minYear = Math.min(pubStartYear, pubEndYear)
        const maxYear = Math.max(pubStartYear, pubEndYear)
        return (minYear <= endYear) && (maxYear >= startYear)
      }
      return true
    })

    const conferences = allConferences.filter(conf => {
      if (!conf.durationStart && !conf.durationEnd) return true
      const confStartYear = conf.durationStart ? new Date(conf.durationStart).getFullYear() : null
      const confEndYear = conf.durationEnd ? new Date(conf.durationEnd).getFullYear() : null

      // If only start date exists
      if (confStartYear && !confEndYear) {
        return confStartYear >= startYear && confStartYear <= endYear
      }
      // If only end date exists
      if (!confStartYear && confEndYear) {
        return confEndYear >= startYear && confEndYear <= endYear
      }
      // If both dates exist, check if ranges overlap
      if (confStartYear && confEndYear) {
        const minYear = Math.min(confStartYear, confEndYear)
        const maxYear = Math.max(confStartYear, confEndYear)
        return (minYear <= endYear) && (maxYear >= startYear)
      }
      return true
    })

    const books = allBooks.filter(book => {
      if (!book.publishedAt) return true
      const publishYear = new Date(book.publishedAt).getFullYear()
      return publishYear >= startYear && publishYear <= endYear
    })

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

      // totalMembers: users with academic_types > 0
      const totalMembers = depUsers.filter(u => (u.academic_types || []).length > 0).length

      // membersWithICs: users with academic_types > 0 AND (projects > 0 OR funds > 0)
      const usersWithICs = depUsers.filter(u => {
        const hasAcademicTypes = (u.academic_types || []).length > 0
        const hasProjects = (u.projects || []).length > 0
        const hasFunds = (u.funds || []).length > 0
        return hasAcademicTypes && (hasProjects || hasFunds)
      })

      const membersWithICsSet = new Set()

      let bds = 0, ais = 0, tls = 0

      // BDS/AIS/TLS: Calculate from both publications AND conferences
      const processICTypes = (projects) => {
        projects.forEach(prj => {
          const types = prj.ic_types || []
          const hasBDS = types.some(t => t.documentId === IC_TYPE_IDS.BDS)
          const hasAIS = types.some(t => t.documentId === IC_TYPE_IDS.AIS)
          const hasTLS = types.some(t => t.documentId === IC_TYPE_IDS.TLS)

          // Process partners to sum partnerProportion by department
          let partners = prj.partners || []

          // Handle if partners is a string (need to parse)
          if (typeof partners === 'string') {
            try { partners = JSON.parse(partners) } catch { partners = [] }
          }

          // Ensure partners is an array
          if (!Array.isArray(partners)) {
            partners = []
          }

          partners.forEach(partner => {
            const userDeps = partner.User?.departments || []
            const userDepIds = userDeps.map(d => d.id || d.documentId)

            // Check if user is internal (has departments) and belongs to current department
            if (userDeps.length > 0 && userDepIds.includes(depId)) {
              const proportion = Number(partner.partnerProportion || 0)

              if (hasBDS) {
                bds += proportion
                membersWithICsSet.add(partner.User?.documentId || partner.userID)
              }
              if (hasAIS) {
                ais += proportion
                membersWithICsSet.add(partner.User?.documentId || partner.userID)
              }
              if (hasTLS) {
                tls += proportion
                membersWithICsSet.add(partner.User?.documentId || partner.userID)
              }
            }
          })
        })
      }

      // Process publications
      publications.forEach(pub => {
        processICTypes(pub.projects || [])
      })

      // Process conferences
      conferences.forEach(conf => {
        processICTypes(conf.projects || [])
      })

      // Types of ICs (PRJ / APR-ER PROCEEDING / ALL OTHER)
      // PRJ from publication.projects, APR-ER from conference.projects, ALL OTHER from book.funds
      let prj = 0, aprEr = 0, allOther = 0

      // PRJ: Calculate from publications
      publications.forEach(pub => {
        (pub.projects || []).forEach(prjObj => {
          let partners = prjObj.partners || []

          // Handle if partners is a string (need to parse)
          if (typeof partners === 'string') {
            try { partners = JSON.parse(partners) } catch { partners = [] }
          }

          // Ensure partners is an array
          if (!Array.isArray(partners)) {
            partners = []
          }

          partners.forEach(partner => {
            const userDeps = partner.User?.departments || []
            const userDepIds = userDeps.map(d => d.id || d.documentId)

            // Check if user is internal (has departments) and belongs to current department
            if (userDeps.length > 0 && userDepIds.includes(depId)) {
              const proportion = Number(partner.partnerProportion || 0)
              prj += proportion
              // Add user to membersWithICs set
              membersWithICsSet.add(partner.User?.documentId || partner.userID)
            }
          })
        })
      })

      // APR-ER: Calculate from conferences
      conferences.forEach(conf => {
        (conf.projects || []).forEach(prjObj => {
          let partners = prjObj.partners || []

          // Handle if partners is a string (need to parse)
          if (typeof partners === 'string') {
            try { partners = JSON.parse(partners) } catch { partners = [] }
          }

          // Ensure partners is an array
          if (!Array.isArray(partners)) {
            partners = []
          }

          partners.forEach(partner => {
            const userDeps = partner.User?.departments || []
            const userDepIds = userDeps.map(d => d.id || d.documentId)

            // Check if user is internal (has departments) and belongs to current department
            if (userDeps.length > 0 && userDepIds.includes(depId)) {
              const proportion = Number(partner.partnerProportion || 0)
              aprEr += proportion
              // Add user to membersWithICs set
              membersWithICsSet.add(partner.User?.documentId || partner.userID)
            }
          })
        })
      })

      // ALL OTHER: Calculate from books
      books.forEach(book => {
        (book.funds || []).forEach(fund => {
          let partners = fund.partners || []

          // Handle if partners is a string (need to parse)
          if (typeof partners === 'string') {
            try { partners = JSON.parse(partners) } catch { partners = [] }
          }

          // Ensure partners is an array
          if (!Array.isArray(partners)) {
            partners = []
          }

          partners.forEach(partner => {
            const userDeps = partner.User?.departments || []
            const userDepIds = userDeps.map(d => d.id || d.documentId)

            // Check if user is internal (has departments) and belongs to current department
            if (userDeps.length > 0 && userDepIds.includes(depId)) {
              const proportion = Number(partner.partnerProportion || 0)
              allOther += proportion
              // Add user to membersWithICs set
              membersWithICsSet.add(partner.User?.documentId || partner.userID)
            }
          })
        })
      })

      // Members with/without ICs
      // membersWithICs is already calculated based on users with academic_types AND (projects OR funds)
      const membersWithICs = usersWithICs.length
      const membersWithoutICs = totalMembers - membersWithICs

      // PART & ALL: Calculate percentages based on participation
      // Supporting: participation == '1'
      // Participating: participation == '0'
      const supportingCount = depUsers.filter(u => u.participation === '1').length
      const participatingCount = depUsers.filter(u => u.participation === '0').length
      const totalParticipation = supportingCount + participatingCount

      // PART: Percentage of participating users
      const partPercentage = totalParticipation > 0
        ? (participatingCount / totalParticipation) * 100
        : 0

      // ALL: Percentage of all participating users (should always be 100%)
      const allPercentage = totalParticipation > 0
        ? (totalParticipation / totalParticipation) * 100
        : 0

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
        prj,
        aprEr,
        allOther,
        totalTypes: typesTotal,
        part: partPercentage,
        all: allPercentage,
        // Keep raw counts for total row calculation
        _supportingCount: supportingCount,
        _participatingCount: participatingCount
      }
    })

    // Aggregate total row
    const total = deptStats.reduce((acc, row) => {
      Object.keys(row).forEach(k => {
        if (k === 'discipline' || k.startsWith('_')) return
        if (k === 'part' || k === 'all') return // Skip percentages, calculate separately
        acc[k] = (acc[k] || 0) + (typeof row[k] === 'number' ? row[k] : 0)
      })
      return acc
    }, {})

    // Calculate total percentages
    const totalSupportingCount = deptStats.reduce((sum, row) => sum + row._supportingCount, 0)
    const totalParticipatingCount = deptStats.reduce((sum, row) => sum + row._participatingCount, 0)
    const totalParticipationSum = totalSupportingCount + totalParticipatingCount

    const totalPartPercentage = totalParticipationSum > 0
      ? (totalParticipatingCount / totalParticipationSum) * 100
      : 0
    const totalAllPercentage = totalParticipationSum > 0
      ? (totalParticipationSum / totalParticipationSum) * 100
      : 0

    const totalRow = {
      discipline: 'Total',
      ...total,
      part: totalPartPercentage,
      all: totalAllPercentage
    }

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
        r.prj,
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
        totalRow.prj || 0,
        totalRow.aprEr || 0,
        totalRow.allOther || 0,
        totalRow.totalTypes || 0,
        totalRow.part || 0,
        totalRow.all || 0
      ]
    ]

    return { rows: deptStats, total: totalRow, csvData }
  }, [data, startYear, endYear])

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
      <div className="mb-4 flex flex-wrap gap-4 items-end justify-between bg-white p-4 rounded-lg shadow">
        <div className='flex flex-wrap gap-4 '>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Year</label>
            <select
              value={startYear}
              onChange={e => {
                const val = Number(e.target.value)
                // Ensure ordering
                if (val > endYear) {
                  setStartYear(endYear)
                } else {
                  setStartYear(val)
                }
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Year</label>
            <select
              value={endYear}
              onChange={e => {
                const val = Number(e.target.value)
                if (val < startYear) {
                  setEndYear(startYear)
                } else {
                  setEndYear(val)
                }
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
      </div>
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
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.prj)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.aprEr)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.allOther)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{fmt1(row.totalTypes)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(row.part)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium">{fmt1(row.all)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-300 font-semibold">
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
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{fmt1(totalRow.prj)}</td>
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

    </>
  );
}
