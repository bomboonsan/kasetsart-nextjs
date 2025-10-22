"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import Pageheader from "@/components/layout/Pageheader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import toast from 'react-hot-toast';

import { GET_ALL_USERS } from "@/graphql/userQueries";
import { GET_USERS_FILTER_OPTIONS } from "@/graphql/optionForm";
import { GET_USER_DEPARTMENTS } from "@/graphql/userQueries";

// อธิบายฟังก์ชัน: สร้าง context ให้ Apollo ใส่ Authorization header ทุกคำขอ
const useAuthContext = (jwt) => ({
    headers: { Authorization: jwt ? `Bearer ${jwt}` : "" },
});

export default function AdminUsersPage() {
    // รับ session เพื่อดึง JWT
    const { data: session } = useSession();
    const authContext = {
        headers: { Authorization: session?.jwt ? `Bearer ${session.jwt}` : "" },
    };

    // สถานะบนหน้าจอ
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    // โหลดรายการผู้ใช้
    const { data, loading, error, refetch } = useQuery(GET_ALL_USERS, {
        variables: { pagination: { limit: 500 } },
        context: authContext, // สำคัญ: รวม options เป็นก้อนเดียว
        fetchPolicy: "network-only",
    });

    // โหลดตัวเลือกแผนก
    const { data: filterData , loading: filterLoading } = useQuery(GET_USERS_FILTER_OPTIONS, {
        context: authContext,
    });

    const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    const showAdmin = useMemo(() => {
        if (!roleName) return false;
        const r = roleName.toLowerCase();
        return r == "admin"
    }, [roleName]);

    // โหลดข้อมูลตัวเอง (เพื่อดูว่าตัวเองอยู่แผนกไหน)
    let { data: meData } = useQuery(GET_USER_DEPARTMENTS, {
        variables: { documentId: session?.user?.documentId },
        context: authContext,
    });

    // จัดการข้อมูลผู้ใช้
    const users = data?.usersPermissionsUsers ?? [];

    // คำนวณผลการกรอง (รวมทั้งการกรองตามภาควิชาและบทบาท)
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter((u) => {
            const text = [
                u.username,
                u.email,
                u.firstNameTH,
                u.lastNameTH,
                u.firstNameEN,
                u.lastNameEN,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchesSearch = !q || text.includes(q);
            const matchesRole =
                roleFilter === "all" || (u.role && u.role.documentId === roleFilter);
            let matchesDepartment;
                
                if (session?.user?.role?.name === "Admin") {
                    
                    // Admin เห็นเฉพาะแผนกตัวเอง
                    const myDeptId = meData?.usersPermissionsUser?.departments?.[0].documentId;
                    matchesDepartment =
                        myDeptId === "all" || (u.departments && u.departments.some(d => d.documentId === myDeptId));
                } else {
                    // Super admin เห็นได้หมด
                    matchesDepartment =
                        departmentFilter === "all" || (u.departments && u.departments.some(d => d.documentId === departmentFilter));
                }

            return matchesSearch && matchesRole && matchesDepartment;
        });
    }, [users, search, roleFilter, departmentFilter, roleName, meData]);

    // Cache for resolving rapid updates (documentId -> in-progress flag)
    const [rowLoading, setRowLoading] = useState({});

    const setLoadingFor = (key, val) => setRowLoading(prev => ({ ...prev, [key]: val }));

    // เปลี่ยนบทบาท ผ่าน REST internal API
    const handleRoleChange = async (userDocId, numericRoleId) => {
        const key = `role-${userDocId}`;
        try {
            setLoadingFor(key, true);
            const res = await fetch('/api/admin/users/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: session?.jwt ? `Bearer ${session.jwt}` : '' },
                body: JSON.stringify({ user: { documentId: userDocId }, role: { id: Number(numericRoleId) } })
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`Role update failed: ${res.status} ${t}`);
            }
            await refetch();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoadingFor(key, false);
        }
    };

    // บล็อก/ปลดบล็อก ผ่าน REST internal API
    const handleToggleBlocked = async (userDocId, nextBlocked) => {
        const key = `block-${userDocId}`;
        try {
            setLoadingFor(key, true);
            const res = await fetch('/api/admin/users/toggle-block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: session?.jwt ? `Bearer ${session.jwt}` : '' },
                body: JSON.stringify({ user: { documentId: userDocId }, blocked: nextBlocked })
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(`Block toggle failed: ${res.status} ${t}`);
            }
            await refetch();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoadingFor(key, false);
        }
    };

    const roleDocumentToId = (doc) =>  {
        // 1: "nf9v7nyjebiy06f5kjpshual", // User
        // 3: "nv62t3lijrmcf91kf97zc18j", // Admin
        // 4: "paz95zzzpd60h4c9toxlbqkl", // Super admin
        return {
            "nf9v7nyjebiy06f5kjpshual": 1,
            "nv62t3lijrmcf91kf97zc18j": 3,
            "paz95zzzpd60h4c9toxlbqkl": 4
        }[doc] || 1;
    }

    if (loading || filterLoading || !roleFilter) return <p>Loading...</p>;

    return (
        <div>
            <Pageheader title="จัดการผู้ใช้งาน" />

            <div className="mb-4 bg-white rounded-lg shadow p-4 flex gap-3 items-end">
                <div className="flex-1">
                    <label className="text-sm text-gray-600">ค้นหา</label>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ชื่อหรืออีเมล"
                    />
                </div>
                {!showAdmin && (<div className="w-48">
                    <label className="text-sm text-gray-600">ภาควิชา</label>
                    <select
                        className="w-full px-3 py-0.5 border rounded-lg shadow-xs shadow-gray-600/5"
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                        <option value="all">ทั้งหมด</option>
                        {filterData?.departments?.map(d => (
                            <option key={d.documentId} value={d.documentId}>{d.title}</option>
                        ))}
                    </select>
                </div>)}
                <div className="w-48">
                    <label className="text-sm text-gray-600">บทบาท</label>
                    <select
                        className="w-full px-3 py-0.5 border rounded-lg shadow-xs shadow-gray-600/5"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="nf9v7nyjebiy06f5kjpshual">User</option>
                        <option value="nv62t3lijrmcf91kf97zc18j">Admin</option>
                        <option value="paz95zzzpd60h4c9toxlbqkl">Super admin</option>
                    </select>
                </div>
                <div>
                    <Button onClick={() => { setSearch(""); setRoleFilter("all"); setDepartmentFilter("all"); }} variant="outline">
                        รีเซ็ต
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="px-5">ชื่อ-นามสกุล</TableHead>
                                <TableHead className="px-5">ภาควิชา</TableHead>
                                <TableHead className="px-5">คณะ</TableHead>
                                <TableHead className="px-5">อีเมล</TableHead>
                                <TableHead className="px-5">บทบาท</TableHead>
                                {!showAdmin && <>
                                <TableHead className="text-right"></TableHead>
                                </>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-6 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            )}
                            {error && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-6 text-center text-red-600">
                                        Error: {error.message}
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="p-6 text-center text-gray-500">
                                        ไม่พบข้อมูลผู้ใช้
                                    </TableCell>
                                </TableRow>
                            )}

                            {filtered.map((u) => (
                                <TableRow key={u.documentId || u.id} className="text-gray-600">
                                    <TableCell className="px-5 text-sm">
                                        <Link href={`/admin/user/${u.documentId || u.id}`} className="text-primary font-medium hover:underline">
                                            {(u.firstNameTH || "") + " " + (u.lastNameTH || "")}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="px-5 text-sm">
                                        {u.departments?.[0]?.title || "-"}
                                    </TableCell>
                                    <TableCell className="px-5 text-sm">
                                        {u.faculties?.[0]?.title || "-"}
                                    </TableCell>
                                    <TableCell className="px-5 text-sm">
                                        {u.email || "-"}
                                    </TableCell>
                                    <TableCell className="px-5 text-sm">
                                        {u.role?.name || "-"}
                                    </TableCell>
                                    {!showAdmin && <>
                                    
                                    <TableCell className="text-right text-sm">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={roleDocumentToId(u.role?.documentId) ?? 1}
                                                onChange={(e) => handleRoleChange(u.documentId ?? u.id, e.target.value)}
                                                className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                                                disabled={rowLoading[`role-${u.documentId ?? u.id}`]}
                                            >
                                                <option value={1}>User</option>
                                                <option value={3}>Admin</option>
                                                <option value={4}>Super admin</option>
                                            </select>

                                            <Button
                                                size="sm"
                                                variant={u.blocked ? "destructive" : "outline"}
                                                onClick={() => handleToggleBlocked(u.documentId ?? u.id, !u.blocked)}
                                                disabled={rowLoading[`block-${u.documentId ?? u.id}`]}
                                            >
                                                {rowLoading[`block-${u.documentId ?? u.id}`]
                                                    ? '...' : (u.blocked ? "ยกเลิกบล็อก" : "บล็อก")}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    </>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
