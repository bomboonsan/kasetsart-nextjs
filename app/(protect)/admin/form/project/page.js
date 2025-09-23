"use client"

import React from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { GET_PROJECTS } from '@/graphql/projectQueries'

export default function ProjectTable() {
    const { data: session, status } = useSession();
    const { data, loading, error } = useQuery(GET_PROJECTS,
        {
            variables: {
                pagination: { limit: 50 },
                sort: ["publishedAt:desc"]
            }
        },
        {
            context: {
                headers: {
                    Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
                }
            }
        }
    );

    const projects = data?.projects || [];

    return (
        <div>
            <Pageheader title="จัดการโครงการวิจัย" />

            <div className="mb-4 flex items-center gap-2">
                <input className="flex-1 border rounded px-3 py-2" placeholder="ค้นหาจากชื่อโครงการ..." />
                <select className="border rounded px-3 py-2">
                    <option>วันที่สร้าง (ใหม่ล่าสุด)</option>
                </select>
                <Button>ค้นหา</Button>
            </div>

            <div className="text-sm text-gray-600 mb-4">แสดง {projects.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 text-left text-sm text-gray-500">
                        <tr>
                            <th className="p-4">ชื่อโครงการ</th>
                            <th className="p-4">ปีงบประมาณ</th>
                            <th className="p-4">งบประมาณ</th>
                            <th className="p-4">สถานะ</th>
                            <th className="p-4">วันที่เผยแพร่</th>
                            <th className="p-4">วันที่แก้ไข</th>
                            <th className="p-4">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={7} className="p-6 text-center">Loading...</td></tr>
                        )}
                        {error && (
                            <tr><td colSpan={7} className="p-6 text-center text-red-600">Error loading projects</td></tr>
                        )}

                        {projects.map((p) => (
                            <tr key={p.documentId} className="border-t">
                                <td className="p-4">
                                    <div className="font-semibold">{p.nameTH || p.nameEN || '—'}</div>
                                    <div className="text-xs text-gray-500">{p.documentId}</div>
                                </td>
                                <td className="p-4">{p.fiscalYear || '-'}</td>
                                <td className="p-4">{p.budget ? `${p.budget} บาท` : '-'}</td>
                                <td className="p-4"><span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{p.status || 'เผยแพร่'}</span></td>
                                <td className="p-4">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('th-TH') : '-'}</td>
                                <td className="p-4">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('th-TH') : '-'}</td>
                                <td className="p-4 text-right">
                                    <a className="text-blue-600 mr-3">ดู</a>
                                    <a className="text-green-600">แก้ไข</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}