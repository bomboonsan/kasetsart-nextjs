"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { MY_PROJECTS } from '@/graphql/me'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'

export default function ProjectTable() {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    const filters = useMemo(() => {
        if (!debouncedSearch) return undefined;
        // filter by Thai or EN name containing the search term (case-insensitive)
        return {
            or: [
                { nameTH: { containsi: debouncedSearch } },
                { nameEN: { containsi: debouncedSearch } },
            ],
        };
    }, [debouncedSearch]);

    const { data, loading, error } = useQuery(MY_PROJECTS, {
        variables: {
            pagination: { limit: 50 },
            sort: ["publishedAt:desc"],
            filters,
            userId: session?.user?.documentId,
        },
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    });

    const projects = data?.projects || [];

    return (
        <div>
            <Pageheader title="จัดการโครงการวิจัย" btnName="เพิ่มทุนโครงการวิจัย" btnLink="/form/create/project" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white" placeholder="ค้นหาจากชื่อโครงการ..." />
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {projects.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={'px-5'}>ชื่อโครงการ</TableHead>
                            <TableHead className={'px-5'}>ปีงบประมาณ</TableHead>
                            <TableHead className={'px-5'}>งบประมาณ</TableHead>
                            <TableHead className={'px-5'}>วันที่เผยแพร่</TableHead>
                            <TableHead className={'px-5'}>วันที่แก้ไข</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center">Loading...</TableCell></TableRow>
                        )}
                        {error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-red-600">Error loading projects</TableCell></TableRow>
                        )}
                        {projects.length === 0 && !loading && !error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-gray-500">ไม่พบข้อมูล</TableCell></TableRow>
                        )}

                        {projects.map((p) => (
                            <TableRow key={p.documentId}>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="font-semibold">{p.nameTH || p.nameEN || '—'}</div>
                                    <div className="text-xs text-gray-500">{p.nameEN}</div>
                                </TableCell>
                                <TableCell className={'px-5'}>{p.fiscalYear || '-'}</TableCell>
                                <TableCell className={'px-5'}>{p.budget ? `${p.budget} บาท` : '-'}</TableCell>
                                <TableCell className={'px-5'}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className={'px-5'}>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <a className="text-blue-600 mr-3" href={`/form/project/view/${p.documentId}`}>ดู</a>
                                    <a className="text-green-600" href={`/form/project/edit/${p.documentId}`}>แก้ไข</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}