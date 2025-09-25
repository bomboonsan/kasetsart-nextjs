'use client'
import { worksAPI } from '@/lib/api'
import { CSVLink, CSVDownload } from "react-csv";
import { Button } from "@/components/ui/button";

import React, { useState, useEffect, useMemo, use } from 'react'
import { useSession } from "next-auth/react";
// GraphQL
import { useQuery } from "@apollo/client/react";
import { GET_REPORT_F } from '@/graphql/reportQueries';

function formatDate(d) {
    if (!d) return ''
    try {
        const date = new Date(d)
        if (Number.isNaN(date.getTime())) return ''
        const dd = String(date.getDate()).padStart(2, '0')
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const yyyy = date.getFullYear()
        return `${dd}/${mm}/${yyyy}`
    } catch (e) {
        return ''
    }
}

function mapLevelToLabel(level) {
    // Assumption: level is an integer. Map to Thai labels conservatively.
    const map = {
        1: 'ระดับนานาชาติ',
        2: 'ระดับชาติ',
        3: 'ระดับภูมิภาค',
        4: 'ระดับท้องถิ่น',
    }
    return map[level] || (level ? String(level) : '')
}

function extractPartners(projectResearch) {
    if (!projectResearch) return []

    // projectResearch may be an object with research_partners in different shapes
    let partners = []
    // shape: projectResearch.research_partners or projectResearch.research_partners.data
    if (projectResearch.research_partners) {
        partners = projectResearch.research_partners.data || projectResearch.research_partners
    } else if (projectResearch.data && projectResearch.data.attributes) {
        partners = projectResearch.data.attributes.research_partners?.data || []
    } else if (Array.isArray(projectResearch)) {
        partners = projectResearch
    }

    // normalize each partner to have fullname either at top-level or attributes.fullname
    return (partners || []).map(p => {
        const obj = p.attributes || p
        return obj.fullname || obj.name || ''
    }).filter(Boolean)
}



export default function ReportTableE() {
    const session = useSession()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [csvData, setCsvData] = useState([])

    // new data fetching
    const [dataRaw , setDataRaw] = useState([])

    useEffect(() => {
        let mounted = true

        async function load() {
            setLoading(true)
            setError('')

            try {
                const params = {
                    publicationState: 'preview',
                    populate: 'project_research.research_partners',
                    ['pagination[pageSize]']: 100
                }

                const res = await worksAPI.getConferences(params)
                const data = res?.data || res || []

                if (!mounted) return

                const normalized = (data || []).map((w, idx) => {
                    // w may already be a flat object
                    const title = w?.titleTH || w?.titleEN || w?.title || ''
                    const journal = w?.journalName || ''
                    const partners = extractPartners(w.project_research || w.projectResearch || w.project_researchs || (w.project_research && w.project_research.data) || w.project_research)
                    const authors = partners.join(', ') || (w?.authors || '')
                    const level = mapLevelToLabel(w?.level)
                    /* debug removed */
                    const date = formatDate(w?.durationStart || w?.publicationDate || w?.duration)

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

    // ========================================================================================================================
    // ========================================================================================================================
    // ========================================================================================================================
    // ========================================================================================================================

    
    const { data, loadingData, errorData } = useQuery(GET_REPORT_F, {
        variables: {
            pagination: { limit: 50 },
            sort: ["publicationDate:desc"],
            userId: session?.user?.documentId,
        },
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    });
    console.log({ data, loadingData, errorData });
    
    useEffect(() => {
        setDataRaw(data || []);
    }, [data , loadingData, errorData]);

    // ========================================================================================================================
    // ========================================================================================================================
    // ========================================================================================================================
    // ========================================================================================================================

    if (!data && loading) return <p>Loading...</p>;

    return (
        <>
        <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="text-center text-sm font-medium text-gray-800">รายละเอียดข้อมูลการนำเสนอผลงานทางวิชาการ</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr>
                            
                            <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ลำดับ</th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อผลงานวิจัย</th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อการประชุม</th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ชื่อคณะผู้วิจัย</th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">ระดับการประชุม</th>
                            <th className="px-3 py-2 text-xs font-semibold text-gray-700 border">วัน/เดือน/ปีที่เสนอ</th>
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
            <CSVLink filename={"Report6.xlsx"} data={csvData}><Button 
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
