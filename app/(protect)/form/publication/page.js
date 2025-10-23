"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { MY_PUBLICATIONS } from '@/graphql/me'
import { DELETE_PUBLICATION } from '@/graphql/formQueries'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'
import { formatDateToMMYYYY } from '@/utils/formatters';

export default function PublicationTable() {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [deletingId, setDeletingId] = useState(null);

    const authContext = useMemo(() => ({
        headers: {
            Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
        },
    }), [session?.jwt]);

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

    const { data, loading, error, refetch } = useQuery(MY_PUBLICATIONS, {
        variables: {
            pagination: { limit: 50 },
            sort: ["updatedAt:desc"],
            filters,
            userId: session?.user?.documentId,
        },
        context: authContext
    });

    const [deletePublication, { loading: deleteLoading }] = useMutation(DELETE_PUBLICATION);

    const handleDelete = async (documentId) => {
        if (!documentId || deleteLoading) return;
        const confirmed = window.confirm('ยืนยันการลบข้อมูลการตีพิมพ์นี้หรือไม่?');
        if (!confirmed) return;
        try {
            setDeletingId(documentId);
            await deletePublication({
                variables: { documentId },
                context: authContext,
            });
            await refetch();
        } catch (err) {
            console.error('Failed to delete publication', err);
            window.alert(err?.message ? `ลบข้อมูลไม่สำเร็จ: ${err.message}` : 'ลบข้อมูลไม่สำเร็จ');
        } finally {
            setDeletingId(null);
        }
    };

    const publications = data?.publications || [];

    const getLevelText = (level) => {
        if (level == '0') return 'ระดับชาติ';
        if (level == '1') return 'ระดับนานาชาติ';
        return '-';
    };

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
                                    <div className="flex justify-end gap-3">
                                        <a className="text-blue-600" href={`/form/publication/view/${p.documentId}`}>ดู</a>
                                        <a className="text-green-600" href={`/form/publication/edit/${p.documentId}`}>แก้ไข</a>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="px-0 py-0 leading-0 h-5 text-red-600"
                                            onClick={() => handleDelete(p.documentId)}
                                            disabled={deletingId === p.documentId || deleteLoading}
                                        >
                                            {deletingId === p.documentId ? 'กำลังลบ...' : 'ลบ'}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
