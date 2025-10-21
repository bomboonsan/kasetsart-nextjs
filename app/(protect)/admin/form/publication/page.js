"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_PUBLICATIONS } from '@/graphql/formQueries'
import { formatDateToMMYYYY } from '@/utils/formatters'
import { GET_USER_DEPARTMENTS } from "@/graphql/userQueries";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'

export default function PublicationTable() {
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

    const { data, loading, error } = useQuery(GET_PUBLICATIONS, {
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

    let publications = data?.publications || [];

    // // เตรียมข้อมูลสำหรับ Filter แผนกสำหรับ Role = Admin
    // const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    // const myDeptId = meData?.usersPermissionsUser?.departments?.[0].documentId;
    // if (roleName === 'Admin' && myDeptId) {
    //     publications = publications.filter(pub =>
    //         pub?.projects?.some(proj =>
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

    if (loading && meDataLoading) { return <div className="p-6">Loading...</div> }

    return (
        <div>
            <Pageheader title="จัดการข้อมูลตีพิมพ์" btnName="เพิ่มข้อมูลตีพิมพ์" btnLink="/form/create/publication" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white"
                    placeholder="ค้นหาจากชื่อผลงาน หรือชื่อวารสาร..."
                />
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {publications.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={'px-5'}>ชื่อผลงาน</TableHead>
                            <TableHead className={'px-5'}>วารสาร / แหล่งตีพิมพ์</TableHead>
                            <TableHead className={'px-5'}>วัน/เดือน/ปี ที่ตีพิมพ์</TableHead>
                            <TableHead className={'px-5'}>ระดับ</TableHead>
                            <TableHead className={'px-5'}>ฐานข้อมูลวารสาร</TableHead>
                            <TableHead className={'px-5'}>วันที่เพิ่มเข้าสู่ระบบ</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center">Loading...</TableCell></TableRow>
                        )}
                        {error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-red-600">Error loading publications: {error.message}</TableCell></TableRow>
                        )}

                        {publications.length === 0 && !loading && !error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-gray-500">ไม่พบข้อมูลการตีพิมพ์</TableCell></TableRow>
                        )}

                        {publications.map((p) => (
                            <TableRow key={p.documentId}>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="font-semibold">{p.titleTH || p.titleEN || '—'}</div>
                                    {p.titleEN && p.titleTH && (
                                        <div className="text-xs text-gray-500">{p.titleEN}</div>
                                    )}
                                </TableCell>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="text-sm">{p.journalName || '-'}</div>
                                </TableCell>
                                <TableCell className={'px-5'}>
                                    {formatDateToMMYYYY(p.durationStart) || '-'} - {formatDateToMMYYYY(p.durationEnd) || '-'}
                                </TableCell>
                                <TableCell className={'px-5'}>{getLevelText(p.level)}</TableCell>
                                <TableCell className={'px-5'}>{p.isJournalDatabase == '0' ? 'อยู่ในฐานข้อมูล' : 'ไม่อยู่ในฐานข้อมูล'}</TableCell>
                                <TableCell className={'px-5'}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <a className="text-blue-600 mr-3" href={`/form/publication/view/${p.documentId}`}>ดู</a>
                                    <a className="text-green-600" href={`/form/publication/edit/${p.documentId}`}>แก้ไข</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
