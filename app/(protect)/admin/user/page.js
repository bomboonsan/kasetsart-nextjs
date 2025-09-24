"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import Pageheader from "@/components/layout/Pageheader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

import {
    GET_ALL_USERS,
    UPDATE_USER_ROLE,
    UPDATE_USER_BLOCKED,
} from "@/graphql/userQueries";

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

    // โหลดรายการผู้ใช้
    const { data, loading, error, refetch } = useQuery(GET_ALL_USERS, {
        variables: { pagination: { limit: 500 } },
        context: authContext, // สำคัญ: รวม options เป็นก้อนเดียว
        fetchPolicy: "network-only",
    });


    // จัดการข้อมูลผู้ใช้
    const users = data?.usersPermissionsUsers ?? [];

    // คำนวณผลการกรอง
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
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    // เปลี่ยนบทบาท
    const [updateUserRole] = useMutation(UPDATE_USER_ROLE, { context: authContext });
    const handleRoleChange = async (userDocId, roleDocId) => {
        // หมายเหตุ: roleDocId = documentId ของ role
        console.log("update target userId=", userDocId);
        await updateUserRole({ variables: { id: userDocId, roleId: roleDocId }, context: authContext });
        await refetch();
    };

    // บล็อก/ปลดบล็อก
    const [updateUserBlocked] = useMutation(UPDATE_USER_BLOCKED, { context: authContext });
    const handleToggleBlocked = async (userDocId, nextBlocked) => {
        await updateUserBlocked({ variables: { id: userDocId, blocked: nextBlocked }, context: authContext });
        await refetch();
    };


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
                <div className="w-48">
                    <label className="text-sm text-gray-600">บทบาท</label>
                    <select
                        className="w-full px-3 py-2 border rounded"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">ทั้งหมด</option>
                        {/* ใช้ documentId ของ role จริงในระบบคุณ */}
                        <option value="nf9v7nyjebiy06f5kjpshual">User</option>
                        <option value="nv62t3lijrmcf91kf97zc18j">Admin</option>
                        <option value="paz95zzzpd60h4c9toxlbqkl">Super admin</option>
                    </select>
                </div>
                <div>
                    <Button onClick={() => { setSearch(""); setRoleFilter("all"); }} variant="outline">
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
                                <TableHead className="text-right"></TableHead>
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
                                    <TableCell className="text-right text-sm">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={u.role?.documentId ?? "nf9v7nyjebiy06f5kjpshual"}
                                                onChange={(e) =>
                                                    handleRoleChange(u.documentId ?? u.id, e.target.value)
                                                }
                                                className="px-2 py-1 border rounded text-sm"
                                                // disabled={changingRole}
                                            >
                                                <option value="nf9v7nyjebiy06f5kjpshual">User</option>
                                                <option value="nv62t3lijrmcf91kf97zc18j">Admin</option>
                                                <option value="paz95zzzpd60h4c9toxlbqkl">Super admin</option>
                                            </select>

                                            <Button
                                                size="sm"
                                                variant={u.blocked ? "destructive" : "outline"}
                                                onClick={() =>
                                                    handleToggleBlocked(u.documentId ?? u.id, !u.blocked)
                                                }
                                                // disabled={togglingBlocked}
                                            >
                                                {u.blocked ? "ยกเลิกบล็อก" : "บล็อก"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
