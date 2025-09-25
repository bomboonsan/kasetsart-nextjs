import { useEffect, useState } from 'react'
import { worksAPI } from '@/lib/api'
import { CSVLink, CSVDownload } from "react-csv";
import { Button } from "@/components/ui/button";

// Format ISO date to dd/mm/yyyy
function formatDate(d) {
    if (!d) return ''
    try {
        const date = new Date(d)
        if (Number.isNaN(date.getTime())) return ''
        const dd = String(date.getDate()).padStart(2, '0')
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const yyyy = date.getFullYear()
        return `${mm}/${yyyy}`
    } catch (e) {
        return ''
    }
}

// Map level: requirement states 0 = ระดับชาติ, 1 = นานาชาติ
function mapLevelToLabel(level) {
    if (level === null || level === undefined) return ''
    const n = Number(level)
    if (n === 0) return 'ระดับชาติ'
    if (n === 1) return 'ระดับนานาชาติ'
    return String(level)
}

// Normalize various Strapi shapes for research partners to array of fullname strings
function extractPartners(projectResearch) {
    if (!projectResearch) return []

    // possible shapes:
    // 1) project_research: { id, attributes: { research_partners: { data: [...] }}}
    // 2) project_research: { research_partners: { data: [...] } }
    // 3) project_research: { research_partners: [...] }
    // 4) provided directly as array

    let partners = []
    if (Array.isArray(projectResearch)) {
        partners = projectResearch
    } else if (projectResearch.data && projectResearch.data.attributes) {
        partners = projectResearch.data.attributes.research_partners?.data || []
    } else if (projectResearch.research_partners) {
        partners = projectResearch.research_partners.data || projectResearch.research_partners
    } else if (projectResearch.attributes && projectResearch.attributes.research_partners) {
        partners = projectResearch.attributes.research_partners.data || projectResearch.attributes.research_partners
    }

    return (partners || []).map(p => {
        const obj = p.attributes || p
        return obj.fullname || obj.name || ''
    }).filter(Boolean)
}

export default function ReportTableE() {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [csvData, setCsvData] = useState([])

    useEffect(() => {
        let mounted = true

        async function load() {
            setLoading(true)
            setError('')
            try {
                const params = {
                    publicationState: 'preview',
                    // populate project_research and its research_partners
                    ['populate[project_research][populate]']: 'research_partners',
                    ['pagination[pageSize]']: 200
                }

                const res = await worksAPI.getPublications(params)
                const data = res?.data || res || []

                if (!mounted) return

                const normalized = (data || []).map((w, idx) => {
                    const title = w?.titleTH || w?.titleEN || w?.title || ''
                    const journal = w?.journalName || ''
                    const projectResearch = w.project_research || w.projectResearch || (w.data && w.data.attributes && w.data.attributes.project_research) || null
                    const partners = extractPartners(projectResearch)
                    const authors = partners.join(', ') || ''
                    const level = mapLevelToLabel(w?.level || 1) 
                    const date = formatDate(w?.durationStart)

                    return {
                        no: idx + 1,
                        title,
                        meeting: journal,
                        authors,
                        level,
                        date,
                    }
                })
                setCsvData([
                    ['ลำดับ', 'ชื่อผลงานที่ตีพิมพ์', 'ชื่อวารสารวิชาการ', 'ชื่อคณะผู้วิจัย', 'ระดับการตีพิมพ์', 'วัน/เดือน/ปีที่ตีพิมพ์'],
                    ...normalized.map(r => [r.no, r.title, r.meeting, r.authors, r.level, r.date])
                ])

                setRows(normalized)
            } catch (e) {
                setError(e?.message || String(e))
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [])

    return (
        <>
        <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="text-center text-sm font-medium text-gray-800">รายละเอียดข้อมูลการตีพิมพ์ผลงานวิจัยในวารสารวิชาการระดับชาติและนานาชาติ</h3>
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
                        {loading ? (
                            <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">กำลังโหลด...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-red-600">{error}</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">ยังไม่มีข้อมูล</td></tr>
                        ) : (
                            rows.map((r) => (
                                <tr key={r.no} className="hover:bg-gray-50 align-top">
                                    <td className="px-3 py-2 text-sm text-gray-900 border align-top">{r.no}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border align-top">{r.title}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border align-top">{r.meeting}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border align-top">{r.authors}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border align-top">{r.level}</td>
                                    <td className="px-3 py-2 text-sm text-gray-900 border align-top">{r.date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </div>
            <CSVLink filename={"Report5.xlsx"} data={csvData}><Button 
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
