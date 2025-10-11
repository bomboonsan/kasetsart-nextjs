'use client'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { CSVLink } from 'react-csv'
import { Button } from '@/components/ui/button'
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery'
import { GET_REPORT_F } from '@/graphql/reportQueries'

/** แปลงวันที่เป็น DD/MM/YYYY */
function formatDate(d) {
    if (!d) return ''
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return ''
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

/** map level -> ป้ายไทย */
function mapLevelToLabel(level) {
    const v = typeof level == 'string' ? level.trim() : level
    const map = {
        '1': 'ระดับนานาชาติ',
        '2': 'ระดับชาติ',
        '3': 'ระดับภูมิภาค',
        '4': 'ระดับท้องถิ่น',
        1: 'ระดับนานาชาติ',
        2: 'ระดับชาติ',
        3: 'ระดับภูมิภาค',
        4: 'ระดับท้องถิ่น',
    }
    return map[v] || ''
}

/** สกัดชื่อผู้ร่วมวิจัยจาก partner หนึ่งคน */
function partnerName(p) {
    if (p?.User) {
        const u = p.User
        const th = [u.firstNameTH, u.lastNameTH].filter(Boolean).join(' ').trim()
        const en = [u.firstNameEN, u.lastNameEN].filter(Boolean).join(' ').trim()
        return th || en || u.email || u.username || p.fullname || 'ไม่ระบุชื่อ'
    }
    return p?.fullname || p?.orgName || 'ไม่ระบุชื่อ'
}

/** รวมรายชื่อ partner ของโปรเจกต์และลบชื่อซ้ำแบบหยาบ */
function projectAuthors(partners) {
    if (!Array.isArray(partners)) return []

    // Sort partners: First Author → Corresponding Author → others
    const sorted = [...partners].sort((a, b) => {
        const commentA = (a?.partnerComment || '').toLowerCase()
        const commentB = (b?.partnerComment || '').toLowerCase()

        const isFirstA = commentA.includes('first author')
        const isFirstB = commentB.includes('first author')
        const isCorrespondingA = commentA.includes('corresponding author')
        const isCorrespondingB = commentB.includes('corresponding author')

        if (isFirstA && !isFirstB) return -1
        if (!isFirstA && isFirstB) return 1
        if (isCorrespondingA && !isCorrespondingB) return -1
        if (!isCorrespondingA && isCorrespondingB) return 1

        // Keep original order for others
        return (a?.order || 0) - (b?.order || 0)
    })

    const list = sorted.map(partnerName).filter(Boolean)
    // ลบซ้ำแบบ case-insensitive
    const seen = new Set()
    const dedup = []
    for (const name of list) {
        const k = name.toLowerCase()
        if (!seen.has(k)) {
            seen.add(k)
            dedup.push(name)
        }
    }
    return dedup
}

export default function ReportTableE() {
    const currentYear = new Date().getFullYear()
    const MIN_YEAR = 2019
    const [startYear, setStartYear] = useState(MIN_YEAR)
    const [endYear, setEndYear] = useState(currentYear)
    const [selectedDepartment, setSelectedDepartment] = useState('all')

    const { data: session } = useSession()

    // ใช้ GraphQL อย่างเดียว
    const { data, loading, error } = usePaginatedQuery(GET_REPORT_F, {
        context: session?.jwt ? { headers: { Authorization: `Bearer ${session.jwt}` } } : undefined,
        fetchPolicy: 'cache-and-network',
    })

    // Get unique departments for filter
    const departments = useMemo(() => {
        return data?.departments ?? []
    }, [data])


    /**
     * สร้างแถว: เดินทุก project → เดินทุก conference
     * ผู้วิจัย = ชื่อจาก partners ของ project นั้น
     */
    const rows = useMemo(() => {
        const projects = data?.projects ?? []
        const flat = []

        for (const proj of projects) {
            // Check if project has partners from selected department
            const partners = Array.isArray(proj?.partners) ? proj.partners : []

            // Filter by department if not 'all'
            if (selectedDepartment !== 'all') {
                const hasSelectedDept = partners.some(p => {
                    const userDepts = p?.User?.departments || []
                    return userDepts.some(d => (d.id || d.documentId) === selectedDepartment)
                })
                if (!hasSelectedDept) continue // Skip this project
            }

            const authors = projectAuthors(partners)
            const conferences = Array.isArray(proj?.conferences) ? proj.conferences : []

            for (const c of conferences) {
                // Filter by year range
                if (c?.durationStart) {
                    const confStartYear = new Date(c.durationStart).getFullYear()
                    const confEndYear = c.durationEnd ? new Date(c.durationEnd).getFullYear() : confStartYear

                    const minYear = Math.min(confStartYear, confEndYear)
                    const maxYear = Math.max(confStartYear, confEndYear)

                    // Check if conference overlaps with selected year range
                    if (maxYear < startYear || minYear > endYear) {
                        continue // Skip this conference
                    }
                }

                flat.push({
                    title: c?.abstractTH || c?.abstractEN || '',
                    meeting: c?.journalName || '',
                    authors,
                    // level: mapLevelToLabel(c?.level),
                    level: c?.level == 0 ? "ระดับชาติ" : "นานาชาติ",
                    rawDate: c?.durationStart || null,
                    date: formatDate(c?.durationStart),
                    dateEnd: formatDate(c?.durationEnd),
                })
            }
        }

        // เรียงจากวันที่ใหม่ไปเก่า ถ้าไม่มีวันที่ให้ไปท้าย
        flat.sort((a, b) => {
            const ta = a.rawDate ? new Date(a.rawDate).getTime() : -Infinity
            const tb = b.rawDate ? new Date(b.rawDate).getTime() : -Infinity
            return tb - ta
        })

        // ใส่ running number
        return flat.map((r, i) => ({ no: i + 1, ...r }))
    }, [data, startYear, endYear, selectedDepartment])

    /** ข้อมูลสำหรับ CSV */
    const csvData = useMemo(
        () => [
            ['ลำดับ', 'ชื่อผลงานวิจัย/นำเสนอ', 'ชื่อการประชุม/วารสาร', 'ชื่อคณะผู้วิจัย', 'ระดับการประชุม', 'วัน/เดือน/ปีที่เสนอ'],
            ...rows.map(r => [
                r.no,
                r.title,
                r.meeting,
                Array.isArray(r.authors) ? r.authors.join(', ') : r.authors,
                r.level,
                r.date
            ]),
        ],
        [rows]
    )

    if (loading) {
        return (
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-center text-sm font-medium text-gray-800">
                        รายละเอียดข้อมูลการนำเสนอผลงานทางวิชาการ
                    </h3>
                </div>
                <p className="px-3 py-6 text-center text-sm text-gray-500">กำลังโหลด...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-center text-sm font-medium text-gray-800">
                        รายละเอียดข้อมูลการนำเสนอผลงานทางวิชาการ
                    </h3>
                </div>
                <p className="px-3 py-6 text-center text-sm text-red-600">{error.message}</p>
            </div>
        )
    }

    return (
        <>
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
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={e => setSelectedDepartment(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.documentId} value={dept.documentId}>
                                    {dept.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <CSVLink filename="Report5.csv" data={csvData}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <span>Export</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-3 3-3-3M12 12v9M5 20h14" />
                        </svg>
                    </Button>
                </CSVLink>
            </div>
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-800">
                        รายละเอียดข้อมูลการนำเสนอผลงานทางวิชาการ
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border w-20">ลำดับ</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อผลงานวิจัย</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อการประชุม</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อคณะผู้วิจัย</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border w-40">ระดับการประชุม</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border w-40">วัน/เดือน/ปีที่เสนอ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">ยังไม่มีข้อมูล</td>
                                </tr>
                            ) : (
                                rows.map(r => (
                                    <tr key={r.no} className="hover:bg-gray-50 align-top">
                                        <td className="px-3 py-2 text-sm text-gray-900 border text-center">{r.no}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.title}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.meeting}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">
                                            {Array.isArray(r.authors) && r.authors.length > 0 ? (
                                                r.authors.map((author, idx) => (
                                                    <div key={idx}>{author}</div>
                                                ))
                                            ) : (
                                                r.authors
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border text-center">{r.level}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border text-center">{r.date} - {r.dateEnd}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
