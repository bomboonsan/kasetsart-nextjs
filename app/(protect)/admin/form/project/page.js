"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_PROJECTS, DELETE_PROJECT } from '@/graphql/projectQueries'
import { GET_USER_DEPARTMENTS } from "@/graphql/userQueries";
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
    const [deletingId, setDeletingId] = useState(null);

    const authContext = {
        headers: { Authorization: session?.jwt ? `Bearer ${session.jwt}` : "" },
    };

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

    const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
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

    const [deleteProject, { loading: deleteLoading }] = useMutation(DELETE_PROJECT);

    const handleDelete = async (documentId) => {
        if (!documentId || deleteLoading) return;
        const confirmed = window.confirm('ยืนยันการลบโครงการนี้หรือไม่?');
        if (!confirmed) return;
        try {
            setDeletingId(documentId);
            await deleteProject({
                variables: { documentId },
                context: authContext,
            });
            await refetch();
        } catch (err) {
            console.error('Failed to delete project', err);
            window.alert(err?.message ? `ลบข้อมูลไม่สำเร็จ: ${err.message}` : 'ลบข้อมูลไม่สำเร็จ');
        } finally {
            setDeletingId(null);
        }
    };

    // โหลดข้อมูลตัวเอง (เพื่อดูว่าตัวเองอยู่แผนกไหน)
    let { data: meData, loading: meDataLoading } = useQuery(GET_USER_DEPARTMENTS, {
        variables: { documentId: session?.user?.documentId },
        context: authContext,
    });
    let projects = data?.projects || [];

    // เตรียมข้อมูลสำหรับ Filter แผนกสำหรับ Role = Admin
    const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    const myDeptId = meData?.usersPermissionsUser?.departments?.[0]?.documentId;

    if (loading && meDataLoading) { return }

    // Filter สำหรับ Admin ให้แสดงเฉพาะโครงการที่มี partner ในแผนกเดียวกัน
    if (roleName === 'Admin' && myDeptId) {
        projects = projects.filter(p => {
            if (!p.partners) return false;
            try {
                const partnersArray = typeof p.partners === 'string'
                    ? JSON.parse(p.partners)
                    : p.partners;

                return partnersArray?.some(partner => {
                    const userDepts = partner?.User?.departments || [];
                    return userDepts.some(dept =>
                        dept?.id === myDeptId || dept?.documentId === myDeptId
                    );
                });
            } catch (err) {
                console.error('Error parsing partners:', err);
                return false;
            }
        });
    }


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
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-red-600">Error loading projects</TableCell></TableRow>
                        )}
                        {projects.length === 0 && !loading && !error && (
                            <TableRow><TableCell colSpan={7} className="p-6 text-center text-gray-500">ไม่พบข้อมูล</TableCell></TableRow>
                        )}

                        {projects.map((p) => (
                            <TableRow key={p.documentId}>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="font-semibold">{p.nameTH || p.nameEN || '—'}</div>
                                    {p.nameEN && p.nameTH && <div className="text-xs text-gray-500">{p.nameEN}</div>}
                                </TableCell>
                                <TableCell className={'px-5'}>{p.fiscalYear || '-'}</TableCell>
                                <TableCell className={'px-5'}>{p.budget ? `${p.budget} บาท` : '-'}</TableCell>
                                <TableCell className={'px-5'}>{p.durationStart ? new Date(p.durationStart).toLocaleDateString('th-TH') + ' - ' + (p.durationEnd ? new Date(p.durationEnd).toLocaleDateString('th-TH') : '-') : '-'}</TableCell>
                                <TableCell className={'px-5'}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <div className="flex justify-end gap-3">
                                        <a className="text-blue-600" href={`/form/project/view/${p.documentId}`}>ดู</a>
                                        <a className="text-green-600" href={`/form/project/edit/${p.documentId}`}>แก้ไข</a>
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