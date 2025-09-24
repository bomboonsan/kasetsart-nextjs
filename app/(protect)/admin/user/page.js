"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useSession } from "next-auth/react";
import Pageheader from '@/components/layout/Pageheader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GET_ALL_USERS, UPDATE_USER_PROFILE } from '@/graphql/userQueries'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // Fetch users (we'll filter client-side for simplicity)
    const { data, loading, error, refetch } = useQuery(GET_ALL_USERS,
        { variables: { pagination: { limit: 500 } } },
        {
            context: {
                headers: {
                    Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
                }
            }
        }
    )
    const [updateUser] = useMutation(UPDATE_USER_PROFILE, {
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const users = data?.usersPermissionsUsers || []
    console.log("users", users);

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !search || [u.username, u.email, u.firstNameTH, u.lastNameTH, u.firstNameEN, u.lastNameEN].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
            const matchesRole = roleFilter === 'all' || (u.role && (u.role.id == roleFilter || u.role.name === roleFilter))
            return matchesSearch && matchesRole
        })
    }, [users, search, roleFilter])

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUser({ variables: { id: userId, data: { role: newRole } } })
            refetch()
        } catch (e) {
            console.error(e)
        }
    }

    const handleToggleBlocked = async (userId, blocked) => {
        try {
            await updateUser({ variables: { id: userId, data: { blocked } } })
            refetch()
        } catch (e) { console.error(e) }
    }

    return (
        <div>
            <Pageheader title="จัดการผู้ใช้งาน" />

            <div className="mb-4 bg-white rounded-lg shadow p-4 flex gap-3 items-end">
                <div className="flex-1">
                    <label className="text-sm text-gray-600">ค้นหา</label>
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ชื่อหรืออีเมล" />
                </div>
                <div className="w-48">
                    <label className="text-sm text-gray-600">บทบาท</label>
                    <select className="w-full px-3 py-2 border rounded" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">ทั้งหมด</option>
                        <option value="1">User</option>
                        <option value="3">Admin</option>
                        <option value="4">Super admin</option>
                    </select>
                </div>
                <div>
                    <Button onClick={() => { setSearch(''); setRoleFilter('all') }} variant="outline">รีเซ็ต</Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className={'bg-gray-50 font-bikd'}>
                                <TableHead className="px-5">ชื่อ-นามสกุล</TableHead>
                                <TableHead className="px-5">ภาควิชา</TableHead>
                                <TableHead className="px-5">คณะ</TableHead>
                                <TableHead className="px-5">อีเมล</TableHead>
                                <TableHead className="px-5">บทบาท</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && <TableRow><TableCell colSpan={6} className="p-6 text-center">Loading...</TableCell></TableRow>}
                            {error && <TableRow><TableCell colSpan={6} className="p-6 text-center text-red-600">Error: {error.message}</TableCell></TableRow>}
                            {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="p-6 text-center text-gray-500">ไม่พบข้อมูลผู้ใช้</TableCell></TableRow>}
                            {filtered.map(u => (
                                <TableRow key={u.documentId || u.id} className={'text-gray-600'}>
                                    <TableCell className="px-5 text-sm">{(u.firstNameTH || '') + ' ' + (u.lastNameTH || '')}</TableCell>
                                    <TableCell className="px-5 text-sm">{u.departments?.[0]?.title || '-'}</TableCell>
                                    <TableCell className="px-5 text-sm">{u.faculties?.[0]?.title || '-'}</TableCell>
                                    <TableCell className="px-5 text-sm">{u.email || '-'}</TableCell>
                                    <TableCell className="px-5 text-sm">{u.role.name || '-'}</TableCell>
                                    <TableCell className="text-right  text-sm">
                                        <div className="flex items-center justify-end gap-2">
                                            <select defaultValue={u.role?.documentId || 'nf9v7nyjebiy06f5kjpshual'} onChange={(e) => handleRoleChange(u.documentId || u.id, e.target.value)} className="px-2 py-1 border rounded text-sm">
                                                <option value="nf9v7nyjebiy06f5kjpshual">User</option>
                                                <option value="nv62t3lijrmcf91kf97zc18j">Admin</option>
                                                <option value="paz95zzzpd60h4c9toxlbqkl">Super admin</option>
                                            </select>
                                            <Button size="sm" variant={u.blocked ? 'destructive' : 'outline'} onClick={() => handleToggleBlocked(u.documentId || u.id, !u.blocked)}>
                                                {u.blocked ? 'ยกเลิกบล็อก' : 'บล็อก'}
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
    )
}
