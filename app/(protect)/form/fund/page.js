"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { MY_FUNDS } from '@/graphql/me'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'

export default function FundTable() {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    const filters = useMemo(() => {
        if (!debouncedSearch) return undefined;
        return {
            or: [
                { fundTypeText: { containsi: debouncedSearch } },
                { contentDesc: { containsi: debouncedSearch } },
                { pastPublications: { containsi: debouncedSearch } },
            ],
        };
    }, [debouncedSearch]);

    const { data, loading, error } = useQuery(MY_FUNDS, {
        variables: {
            pagination: { limit: 50 },
            sort: ["updatedAt:desc"],
            filters,
            userId: session?.user?.documentId,
        },
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    });

    const funds = data?.funds || [];

    return (
        <div>
            <Pageheader title="จัดการคำขอรับทุน (ตำรา/หนังสือ)" btnName="เพิ่มคำขอรับทุน" btnLink="/form/create/fund" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white" placeholder="ค้นหาจากประเภททุนหรือคำอธิบาย..." />
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {funds.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={'px-5'}>ชื่อทุน</TableHead>
                            <TableHead className={'px-5'}>ประเภททุน</TableHead>
                            <TableHead className={'px-5'}>คำอธิบาย</TableHead>
                            <TableHead className={'px-5'}>จำนวนผู้เขียน</TableHead>
                            <TableHead className={'px-5'}>วันที่เพิ่มเข้าสู่ระบบ</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center">Loading...</TableCell></TableRow>
                        )}
                        {error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-red-600">Error loading funds</TableCell></TableRow>
                        )}
                        {funds.length === 0 && !loading && !error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-gray-500">ไม่พบข้อมูล</TableCell></TableRow>
                        )}

                        {funds.map((f) => (
                            <TableRow key={f.documentId}>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>{f.fundName ? f.fundName : '-'}</TableCell>
                                <TableCell className={'px-5'}>
                                    <div className="font-semibold">{f.fundType == "0" ? "ตำรา" : "หนังสือ"}</div>
                                </TableCell>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>{f.contentDesc ? (f.contentDesc.length > 120 ? f.contentDesc.slice(0, 120) + '...' : f.contentDesc) : '-'}</TableCell>
                                <TableCell className={'px-5'}>{f.partners ? f.partners.length + ' ท่าน' : '-'}</TableCell>
                                <TableCell className={'px-5'}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <a className="text-blue-600 mr-3" href={`/form/fund/view/${f.documentId}`}>ดู</a>
                                    <a className="text-green-600" href={`/admin/form/fund/edit/${f.documentId}`}>แก้ไข</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
