"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_CONFERENCES } from '@/graphql/formQueries'
import { GET_USER_DEPARTMENTS } from "@/graphql/userQueries";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'
import { formatDateToDDMMYYYY } from '@/utils/formatters';

export default function ConferenceTable() {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const authContext = {
        headers: { Authorization: session?.jwt ? `Bearer ${session.jwt}` : "" },
    };
    // โหลดข้อมูลตัวเอง (เพื่อดูว่าตัวเองอยู่แผนกไหน)
    let { data: meData, loading: meDataLoading } = useQuery(GET_USER_DEPARTMENTS, {
        variables: { documentId: session?.user?.documentId },
        context: authContext,
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(t);
    }, [search]);

    const filters = useMemo(() => {
        if (!debouncedSearch) return undefined;
        // filter by Thai or EN title, or journal name containing the search term (case-insensitive)
        return {
            or: [
                { titleTH: { containsi: debouncedSearch } },
                { titleEN: { containsi: debouncedSearch } },
                { journalName: { containsi: debouncedSearch } },
            ],
        };
    }, [debouncedSearch]);

    const { data, loading, error } = useQuery(GET_CONFERENCES, {
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

    let conferences = data?.conferences || [];
    // // เตรียมข้อมูลสำหรับ Filter แผนกสำหรับ Role = Admin
    // const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    // const myDeptId = meData?.usersPermissionsUser?.departments?.[0].documentId;
    // if (roleName === 'Admin' && myDeptId) {
    //     conferences = conferences.filter(conference =>
    //         conference?.projects?.some(proj =>
    //             proj?.partners?.some(partner =>
    //                 partner?.User?.departments?.some(dep =>
    //                     dep?.id === myDeptId || dep?.documentId === myDeptId
    //                 )
    //             )
    //         )
    //     );
    // }

    const getLevelText = (level) => {
        if (level == '0') return 'ระดับชาติ';
        if (level == '1') return 'ระดับนานาชาติ';
        return '-';
    };

    const getLocationText = (conference) => {
        const parts = [];
        if (conference.city) parts.push(conference.city);
        if (conference.state) parts.push(conference.state);
        if (conference.country) parts.push(conference.country);
        return parts.length > 0 ? parts.join(', ') : '-';
    };

    return (
        <div>
            <Pageheader title="จัดการข้อมูลการประชุม" btnName="เพิ่มข้อมูลการประชุม" btnLink="/form/create/conference" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white"
                    placeholder="ค้นหาจากชื่อผลงาน หรือชื่อการประชุม..."
                />
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {conferences.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={'px-5'}>ชื่อผลงาน</TableHead>
                            <TableHead className={'px-5'}>ชื่อการประชุม</TableHead>
                            <TableHead className={'px-5'}>ระดับ</TableHead>
                            <TableHead className={'px-5'}>สถานที่</TableHead>
                            <TableHead className={'px-5'}>ระยะเวลา</TableHead>
                            <TableHead className={'px-5'}>วันที่เผยแพร่</TableHead>
                            <TableHead className={'px-5'}>วันที่แก้ไข</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow><TableCell colSpan={8} className="p-6 text-center">Loading...</TableCell></TableRow>
                        )}
                        {error && (
                            <TableRow><TableCell colSpan={8} className="p-6 text-center text-red-600">Error loading conferences: {error.message}</TableCell></TableRow>
                        )}

                        {conferences.length === 0 && !loading && !error && (
                            <TableRow><TableCell colSpan={8} className="p-6 text-center text-gray-500">ไม่พบข้อมูลการประชุม</TableCell></TableRow>
                        )}

                        {conferences.map((c) => (
                            <TableRow key={c.documentId}>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="font-semibold">{c.titleTH || c.titleEN || '—'}</div>
                                    {c.titleEN && c.titleTH && (
                                        <div className="text-xs text-gray-500">{c.titleEN}</div>
                                    )}
                                </TableCell>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="text-sm">{c.journalName || '-'}</div>
                                </TableCell>
                                <TableCell className={'px-5'}>{getLevelText(c.level)}</TableCell>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>{getLocationText(c)}</TableCell>
                                <TableCell className={'px-5'}>
                                    {c.durationStart && c.durationEnd && (c.durationStart !== c.durationEnd)
                                        ? `${formatDateToDDMMYYYY(c.durationStart)} - ${formatDateToDDMMYYYY(c.durationEnd)}`
                                        : `${formatDateToDDMMYYYY(c.durationStart)}` || '-'
                                    }
                                </TableCell>
                                <TableCell className={'px-5'}>{c.publishedAt ? new Date(c.publishedAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className={'px-5'}>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <a className="text-blue-600 mr-3" href={`/form/conference/view/${c.documentId}`}>ดู</a>
                                    <a className="text-green-600" href={`/form/conference/edit/${c.documentId}`}>แก้ไข</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}