import { useEffect, useState, useMemo } from 'react'
// import { reportAPI } from '@/lib/api' // no longer needed; computing locally from graph
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import ReportFilters from '@/components/report/ReportFilters'
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery'
import { GET_REPORT_B } from '@/graphql/reportQueries'

export default function ReportTableB() {
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ teaching: 0, research: 0, practice: 0, societal: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Year filters (start/end) - default full range 2019..current year
  const currentYear = new Date().getFullYear()
  const MIN_YEAR = 2019
  const [startYear, setStartYear] = useState(MIN_YEAR)
  const [endYear, setEndYear] = useState(currentYear)

  // Impact names ตามที่กำหนด
  const IMPACT_NAMES = {
    teaching: 'Teaching & Learning Impact',
    research: 'Research & Scholarly Impact',
    practice: 'Practice & Community Impact',
    societal: 'Societal Impact'
  }

  // Mapping ของ impacts กับ documentId [key เป็น documentId ของ Strapi]
  const IMPACT_MAP = [
    { label: 'Teaching & Learning Impact', key: 'ccuvur1gtltvalcc9lvkc4q2' },
    { label: 'Research & Scholarly Impact', key: 'd6ffaiiqsghhzb6cir9nm7um' },
    { label: 'Practice & Community Impact', key: 'xeuhvpciv7stvysq70yl9k6z' },
    { label: 'Societal Impact', key: 'kq6ol8bm18pucphvxfk0sxt7' },
  ]

  // ตัวอย่าง = มีการทำผลงาน publication ขึ้นมาโดยมี 3 คนทำ สมมติว่าเป็นคนในคณะบริหารทั้งหมด แต่คนละภาควิชา สัดส่วนการวิจัยจะอยู่ที่คนละ 0.3 
  // ยกตัวอย่างว่า หากเป็นคอลัมน์ช่อง Teaching & Learning Impact จะดูว่าผลงาน publication นั้นมีค่า Impact ที่เลือกเป็น Teaching & Learning Impact หรือไม่ ถ้าใช่ 0.3 จะไปขึ้นที่ค่าของคอลัมน์ "Teaching & Learning Impact"
  // ตัวอย่างเพิ่มเติม: อาจารย์ A อยู่ภาค Finance
  // DISCIPLINE | Teaching & Learning Impact |
  // FINANCE | 0.3 |
  // ในขณะที่อาจารย์ อีก 2 คนที่มีรายชื่อทำผลงานด้วยกัน ก็จะไปขึ้นค่าแบบนี้ หลักการเดียวกัน แต่อยู่ใน row ของภาคตนเอง นั้นเอง

  const { data, loading: gqlLoading, error: gqlError } = usePaginatedQuery(GET_REPORT_B)

  useEffect(() => {
    setLoading(gqlLoading)
    if (gqlError) setError(gqlError.message)
  }, [gqlLoading, gqlError])

  // Compute rows based on publications & conferences -> projects -> impacts -> contributors (users_permissions_users)
  const computed = useMemo(() => {
    // Early states
    if (!data || (!data.publications && !data.conferences)) return { rows: [], totals: { teaching: 0, research: 0, practice: 0, societal: 0, total: 0 } }

    // Map impact documentId -> impact category key (teaching/research/practice/societal)
    const impactIdToCategory = IMPACT_MAP.reduce((acc, i) => { acc[i.key] = i.label; return acc }, {})

    // Accumulator per department - initialize with all departments from data
    const deptAcc = new Map() // disciplineName -> { teaching, research, practice, societal }

    // Initialize all departments with zero values
    const allDepartments = data.departments.filter(d => d.title !== 'สํานักงานเลขานุการ') || []
    for (const dept of allDepartments) {
      const deptTitle = dept.title || 'Unknown Department'
      deptAcc.set(deptTitle, { teaching: 0, research: 0, practice: 0, societal: 0 })
    }

    // Helper function to process items (publications or conferences)
    const processItems = (items) => {
      for (const item of items || []) {
        // Filter by durationStart year (if present)
        if (item.durationStart) {
          const itemYear = new Date(item.durationStart).getFullYear()
          if (Number.isFinite(itemYear)) {
            if (itemYear < startYear || itemYear > endYear) continue
          }
        } else {
          // If no date, skip (or include? choose skip for clarity)
          continue
        }
        // For each item, gather unique projects (already provided) and their contributors
        const projects = item.projects || []
        for (const project of projects) {
          const projectImpacts = project.impacts || []
          if (projectImpacts.length === 0) continue // no impact classification -> skip

          const contributors = project.users_permissions_users || []
          // Build list of (userDepartments)
          // If a user has multiple departments, we will attribute equally to each department (common approach). Adjust if needed.
          const userDeptPairs = []
          for (const user of contributors) {
            const departments = user.departments || []
            if (departments.length === 0) {
              // Skip users without departments instead of creating "Unknown Department"
              continue
            } else {
              for (const d of departments) {
                userDeptPairs.push(d.title || 'Unknown Department')
              }
            }
          }

          if (userDeptPairs.length === 0) continue // avoid division by zero

          // Weight per contributor-department association (proportional allocation)
          const weight = 1 / userDeptPairs.length

          // For each impact of the project add weight to department accumulator in the correct category
          for (const impact of projectImpacts) {
            const impactLabel = impactIdToCategory[impact.documentId]
            if (!impactLabel) continue // impact not one of the 4 tracked

            // Translate full label back to category key used in table totals (teaching, research, etc.)
            let categoryKey = null
            if (impactLabel === IMPACT_NAMES.teaching) categoryKey = 'teaching'
            else if (impactLabel === IMPACT_NAMES.research) categoryKey = 'research'
            else if (impactLabel === IMPACT_NAMES.practice) categoryKey = 'practice'
            else if (impactLabel === IMPACT_NAMES.societal) categoryKey = 'societal'
            if (!categoryKey) continue

            for (const deptTitle of userDeptPairs) {
              if (!deptAcc.has(deptTitle)) {
                // This shouldn't happen now since we pre-initialized all departments
                deptAcc.set(deptTitle, { teaching: 0, research: 0, practice: 0, societal: 0 })
              }
              const bucket = deptAcc.get(deptTitle)
              bucket[categoryKey] += weight
            }
          }
        }
      }
    }

    // Process both publications and conferences
    processItems(data.publications)
    processItems(data.conferences)

    // Build row list
    const rowsList = Array.from(deptAcc.entries()).map(([discipline, vals]) => {
      const total = vals.teaching + vals.research + vals.practice + vals.societal
      return { discipline, teaching: vals.teaching, research: vals.research, practice: vals.practice, societal: vals.societal, total }
    })

    // Sort alphabetically for consistency
    rowsList.sort((a, b) => a.discipline.localeCompare(b.discipline))

    // Totals
    const totalsAcc = rowsList.reduce((acc, r) => {
      acc.teaching += r.teaching
      acc.research += r.research
      acc.practice += r.practice
      acc.societal += r.societal
      return acc
    }, { teaching: 0, research: 0, practice: 0, societal: 0 })
    const totalAll = totalsAcc.teaching + totalsAcc.research + totalsAcc.practice + totalsAcc.societal

    return { rows: rowsList, totals: { ...totalsAcc, total: totalAll } }
  }, [data, startYear, endYear])

  useEffect(() => {
    if (computed) {
      setRows(computed.rows)
      setTotals(computed.totals)
    }
  }, [computed])

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
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-blue-100">
          <h3 className="text-center text-base sm:text-lg font-bold text-gray-800">Impacts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.teaching).toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.research).toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.practice).toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(row.societal).toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">{Number(row.total).toFixed(1)}</td>
                  </tr>
                ))
              )}

              {!loading && !error && rows.length > 0 && (
                <tr className="bg-gray-300 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">Total</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.teaching).toFixed(0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.research).toFixed(0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.practice).toFixed(0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 border-r">{Number(totals.societal).toFixed(0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-bold">{Number(totals.total).toFixed(0)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
