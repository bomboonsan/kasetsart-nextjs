'use client'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { CSVLink } from 'react-csv'
import { Button } from '@/components/ui/button'
import { useQuery } from '@apollo/client/react'
import { GET_REPORT_E } from '@/graphql/reportQueries'

/** map ประเภทสิ่งพิมพ์ */
function mapLevelToLabel(level) {
    if (level === null || level === undefined) return ''
    const n = Number(level)
    if (n === 0) return 'ระดับชาติ'
    if (n === 1) return 'ระดับนานาชาติ'
    return String(level)
}

/** ชื่อผู้ร่วมวิจัยจาก partner */
function partnerName(p) {
    if (p?.User) {
        const u = p.User
        const th = [u.firstNameTH, u.lastNameTH].filter(Boolean).join(' ').trim()
        const en = [u.firstNameEN, u.lastNameEN].filter(Boolean).join(' ').trim()
        return th || en || u.email || u.username || p.fullname || 'ไม่ระบุชื่อ'
    }
    return p?.fullname || p?.orgName || 'ไม่ระบุชื่อ'
}

/** รวมรายชื่อผู้วิจัยของโปรเจกต์ */
function projectAuthors(partners) {



    const list = (Array.isArray(partners) ? partners : []).map(partnerName).filter(Boolean)
    const seen = new Set()
    const out = []
    for (const name of list) {
        const k = name.toLowerCase()
        if (!seen.has(k)) {
            seen.add(k)
            out.push(name)
        }
    }
    return out.join(', ')
}

/** แปลงปี (volume) เป็นข้อความแสดงผล */
function formatYear(volume) {
    // if (volume === null || volume === undefined) return ''
    // return String(volume)
    if (!volume) return ''
    const date = new Date(volume)
    if (Number.isNaN(date.getTime())) return ''
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${mm}/${yyyy}`
}


export default function ReportTableE_Publications() {
    const currentYear = new Date().getFullYear()
    const MIN_YEAR = 2019
    const [startYear, setStartYear] = useState(MIN_YEAR)
    const [endYear, setEndYear] = useState(currentYear)
    const [selectedDepartment, setSelectedDepartment] = useState('all')
    const { data: session } = useSession()

    const { data, loading, error } = useQuery(GET_REPORT_E, {
        context: session?.jwt ? { headers: { Authorization: `Bearer ${session.jwt}` } } : undefined,
        fetchPolicy: 'cache-and-network',
    })

    // Get unique departments for filter
    const departments = useMemo(() => {
        return data?.departments ?? []
    }, [data])

    // flatten: ทุก project → ทุก publication (with filters)
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
            const pubs = Array.isArray(proj?.publications) ? proj.publications : []

            for (const p of pubs) {
                // Filter by year range
                if (p?.durationStart) {
                    const pubStartYear = new Date(p.durationStart).getFullYear()
                    const pubEndYear = p.durationEnd ? new Date(p.durationEnd).getFullYear() : pubStartYear

                    const minYear = Math.min(pubStartYear, pubEndYear)
                    const maxYear = Math.max(pubStartYear, pubEndYear)

                    // Check if publication overlaps with selected year range
                    if (maxYear < startYear || minYear > endYear) {
                        continue // Skip this publication
                    }
                }

                flat.push({
                    title: p?.abstractTH || p?.abstractEN || '',
                    meeting: p?.journalName || '',              // ชื่อวารสาร
                    authors,
                    level: mapLevelToLabel(p?.level),           // ประเภท
                    date: formatYear(p?.durationStart),                // ปี
                    dateEnd: formatYear(p?.durationEnd),              // ปี (ถ้ามี)
                    yearSort: p?.durationStart ?? -Infinity,
                    dbFlag: p?.isJournalDatabase ?? null,       // เก็บไว้ใช้ต่อ ถ้าต้องโชว์ภายหลัง
                })
            }
        }

        // เรียงปีใหม่→เก่า ถ้าไม่มีปีไปท้าย
        flat.sort((a, b) => {
            const ta = a.yearSort ?? -Infinity
            const tb = b.yearSort ?? -Infinity
            return Number(tb) - Number(ta)
        })

        return flat.map((r, i) => ({ no: i + 1, ...r }))
    }, [data, startYear, endYear, selectedDepartment])

    const csvData = useMemo(
        () => [
            ['ลำดับ', 'ชื่อผลงานที่ตีพิมพ์', 'ชื่อวารสารวิชาการ', 'ชื่อคณะผู้วิจัย', 'ระดับการตีพิมพ์', 'วัน/เดือน/ปีที่ตีพิมพ์'],
            ...rows.map(r => [r.no, r.title, r.meeting, r.authors, r.level, r.date]),
        ],
        [rows]
    )

    if (loading) {
        return (
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-center text-sm font-medium text-gray-800">
                        รายละเอียดข้อมูลการตีพิมพ์ผลงานวิจัยในวารสารวิชาการระดับชาติและนานาชาติ
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
                        รายละเอียดข้อมูลการตีพิมพ์ผลงานวิจัยในวารสารวิชาการระดับชาติและนานาชาติ
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
                        รายละเอียดข้อมูลการตีพิมพ์ผลงานวิจัยในวารสารวิชาการระดับชาติและนานาชาติ
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ลำดับ</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อผลงานที่ตีพิมพ์</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อวารสารวิชาการ</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อคณะผู้วิจัย</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ระดับการตีพิมพ์</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">วัน/เดือน/ปีที่ตีพิมพ์</th>
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
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.no}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.title}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.meeting}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.authors}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.level}</td>
                                        <td className="px-3 py-2 text-sm text-gray-900 border">{r.date} - {r.dateEnd}</td>
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
