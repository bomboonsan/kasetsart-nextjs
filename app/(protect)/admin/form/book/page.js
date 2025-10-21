"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_BOOKS } from '@/graphql/formQueries'
import { GET_USER_DEPARTMENTS } from "@/graphql/userQueries";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'

export default function BookTable() {
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
        // filter by Thai or EN title, or writer containing the search term (case-insensitive)
        return {
            or: [
                { titleTH: { containsi: debouncedSearch } },
                { titleEN: { containsi: debouncedSearch } },
                { writers: { containsi: debouncedSearch } },
            ],
        };
    }, [debouncedSearch]);

    const { data, loading, error } = useQuery(GET_BOOKS, {
        variables: {
            pagination: { limit: 50 },
            sort: ["publicationDate:desc"],
            filters,
        },
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    });


    let books = data?.books || [];
    // // เตรียมข้อมูลสำหรับ Filter แผนกสำหรับ Role = Admin
    // const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    // const myDeptId = meData?.usersPermissionsUser?.departments?.[0].documentId;
    // if (roleName === 'Admin' && myDeptId) {
    //     books = books.filter(book =>
    //         book?.funds?.some(fund =>
    //             fund?.partners?.some(partner =>
    //                 partner?.User?.departments?.some(dep =>
    //                     dep?.id === myDeptId || dep?.documentId === myDeptId
    //                 )
    //             )
    //         )
    //     );
    // }



    const getWriters = (book) => {
        let writersFullName = ''
        if (book.funds && book.funds.length > 0) {
            const writers = book.funds.map(fund => fund.writers).flat().filter(Boolean);
            if (writers.length > 0) {
                const fullNamesSet = writers.map(w => w.fullName).flat();
                writersFullName = Array.from(new Set(fullNamesSet)).join(', ');
                return writersFullName;
            }
        }
        return [];
    }
    // getWriters(books[0] || {});

    return (
        <div>
            <Pageheader title="จัดการข้อมูลหนังสือ" btnName="เพิ่มข้อมูลหนังสือ" btnLink="/form/create/book" />

            {/* filter */}
            <div className="mb-4 flex items-center gap-2">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white"
                    placeholder="ค้นหาจากชื่อผลงาน หรือผู้แต่ง..."
                />
            </div>
            {/* /filter */}

            <div className="text-sm text-gray-600 mb-4">แสดง {books.length} รายการ จากทั้งหมด</div>

            <div className="bg-white rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={'px-5'}>ชื่อผลงาน</TableHead>
                            <TableHead className={'px-5'}>ประเภท</TableHead>
                            <TableHead className={'px-5'}>Year Contracted</TableHead>
                            <TableHead className={'px-5'}>ระดับผลงาน</TableHead>
                            <TableHead className={'px-5'}>วันที่เพิ่มเข้าสู่ระบบ</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow><TableCell colSpan={6} className="p-6 text-center">Loading...</TableCell></TableRow>
                        )}
                        {error && (
                            <TableRow><TableCell colSpan={6} className="p-6 text-center text-red-600">Error loading books: {error.message}</TableCell></TableRow>
                        )}

                        {books.length === 0 && !loading && !error && (
                            <TableRow><TableCell colSpan={6} className="p-6 text-center text-gray-500">ไม่พบข้อมูลหนังสือ</TableCell></TableRow>
                        )}

                        {books.map((b) => (
                            <TableRow key={b.documentId}>
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>
                                    <div className="font-semibold ">{b.titleTH || b.titleEN || '—'}</div>
                                    {b.titleEN && b.titleTH && (
                                        <div className="text-xs text-gray-500">{b.titleEN}</div>
                                    )}
                                </TableCell>
                                <TableCell className={'px-5'}>{b.bookType == '0' ? 'หนังสือ' : "ตำรา"}</TableCell>
                                <TableCell className={'px-5'}>{b.yearContracted ? b.yearContracted : '-'}</TableCell>
                                <TableCell className={'px-5'}>{b.level == '0' ? 'ระดับชาติ' : "ระดับนานาชาติ"}</TableCell>
                                <TableCell className={'px-5'}>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <a className="text-blue-600 mr-3" href={`/form/book/view/${b.documentId}`}>ดู</a>
                                    <a className="text-green-600" href={`/admin/form/book/edit/${b.documentId}`}>แก้ไข</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
