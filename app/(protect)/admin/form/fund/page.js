"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_FUNDS, DELETE_FUND } from '@/graphql/formQueries'
import { GET_USER_DEPARTMENTS } from "@/graphql/userQueries";
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
    const [deletingId, setDeletingId] = useState(null);

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
        return {
            or: [
                { fundTypeText: { containsi: debouncedSearch } },
                { contentDesc: { containsi: debouncedSearch } },
                { pastPublications: { containsi: debouncedSearch } },
            ],
        };
    }, [debouncedSearch]);

    const { data, loading, error, refetch } = useQuery(GET_FUNDS, {
        variables: {
            pagination: { limit: 50 },
            sort: ["updatedAt:desc"],
            filters,
        },
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    });

    const [deleteFund, { loading: deleteLoading }] = useMutation(DELETE_FUND);

    const handleDelete = async (documentId) => {
        if (!documentId || deleteLoading) return;
        const confirmed = window.confirm('ยืนยันการลบทุนนี้หรือไม่?');
        if (!confirmed) return;
        try {
            setDeletingId(documentId);
            await deleteFund({
                variables: { documentId },
                context: authContext,
            });
            await refetch();
        } catch (err) {
            console.error('Failed to delete fund', err);
            window.alert(err?.message ? `ลบข้อมูลไม่สำเร็จ: ${err.message}` : 'ลบข้อมูลไม่สำเร็จ');
        } finally {
            setDeletingId(null);
        }
    };

    let funds = data?.funds || [];

    // // เตรียมข้อมูลสำหรับ Filter แผนกสำหรับ Role = Admin
    // const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    // const myDeptId = meData?.usersPermissionsUser?.departments?.[0].documentId;
    // if (roleName === 'Admin' && myDeptId) {
    //     funds = funds.filter(p =>
    //         p.partners?.some(partner =>
    //             partner?.User?.departments?.some(dep =>
    //                 dep?.id === myDeptId || dep?.documentId === myDeptId
    //             )
    //         )
    //     );
    // }

    console.log('funds', funds);

    return (
        <div>
            <Pageheader title="จัดการทุนหนังสือหรือตำรา" btnName="เพิ่มทุนหนังสือหรือตำรา" btnLink="/form/create/fund" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white" placeholder="ค้นหาจากชื่อทุน..." />
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {funds.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={'px-5'}>ชื่อทุน</TableHead>
                            <TableHead className={'px-5'}>ประเภททุน</TableHead>
                            {/* <TableHead className={'px-5'}>คำอธิบาย</TableHead> */}
                            {/* <TableHead className={'px-5'}>จำนวนผู้เขียน</TableHead> */}
                            <TableHead className={'px-5'}>จำนวนหน้า</TableHead>
                            <TableHead className={'px-5'}>ระยะเวลา</TableHead>
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
                                {/* <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>{f.contentDesc ? (f.contentDesc.length > 120 ? f.contentDesc.slice(0, 120) + '...' : f.contentDesc) : '-'}</TableCell> */}
                                {/* <TableCell className={'px-5'}>{f.partners ? f.partners.length + ' ท่าน' : '-'}</TableCell> */}
                                <TableCell className={'px-5'}>{f.pages}</TableCell>
                                <TableCell className={'px-5'}>{f.period}</TableCell>
                                <TableCell className={'px-5'}>{f.createdAt ? new Date(f.createdAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <div className="flex justify-end gap-3">
                                        <a className="text-blue-600" href={`/form/fund/view/${f.documentId}`}>ดู</a>
                                        <a className="text-green-600" href={`/admin/form/fund/edit/${f.documentId}`}>แก้ไข</a>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="px-0 text-red-600"
                                            onClick={() => handleDelete(f.documentId)}
                                            disabled={deletingId === f.documentId || deleteLoading}
                                        >
                                            {deletingId === f.documentId ? 'กำลังลบ...' : 'ลบ'}
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
