"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_PROJECTS } from '@/graphql/projectQueries'
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

    const { data, loading, error } = useQuery(GET_PROJECTS, {
        variables: {
            pagination: { limit: 50 },
            sort: ["publishedAt:desc"],
            filters,
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
            <Pageheader title="จัดการโครงการวิจัย" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white" placeholder="ค้นหาจากชื่อโครงการ..." />
                <Button>ค้นหา</Button>
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {projects.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อโครงการ</TableHead>
                            <TableHead>ปีงบประมาณ</TableHead>
                            <TableHead>งบประมาณ</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead>วันที่เผยแพร่</TableHead>
                            <TableHead>วันที่แก้ไข</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center">Loading...</TableCell></TableRow>
                        )}
                        {error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-red-600">Error loading projects</TableCell></TableRow>
                        )}

                        {projects.map((p) => (
                            <TableRow key={p.documentId}>
                                <TableCell>
                                    <div className="font-semibold">{p.nameTH || p.nameEN || '—'}</div>
                                    <div className="text-xs text-gray-500">{p.documentId}</div>
                                </TableCell>
                                <TableCell>{p.fiscalYear || '-'}</TableCell>
                                <TableCell>{p.budget ? `${p.budget} บาท` : '-'}</TableCell>
                                <TableCell><span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{p.status || 'เผยแพร่'}</span></TableCell>
                                <TableCell>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <a className="text-blue-600 mr-3">ดู</a>
                                    <a className="text-green-600">แก้ไข</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}