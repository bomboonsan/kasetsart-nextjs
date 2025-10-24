"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Pageheader from '@/components/layout/Pageheader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { GET_CONFERENCES, DELETE_CONFERENCE } from '@/graphql/formQueries'
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
import { Country, State, City } from 'country-state-city'


export default function ConferenceTable() {
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
        // filter by Thai or EN title, or journal name containing the search term (case-insensitive)
        return {
            or: [
                { titleTH: { containsi: debouncedSearch } },
                { titleEN: { containsi: debouncedSearch } },
                { journalName: { containsi: debouncedSearch } },
            ],
        };
    }, [debouncedSearch]);

    const { data, loading, error, refetch } = useQuery(GET_CONFERENCES, {
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

    const [deleteConference, { loading: deleteLoading }] = useMutation(DELETE_CONFERENCE);

    const handleDelete = async (documentId) => {
        if (!documentId || deleteLoading) return;
        const confirmed = window.confirm('ยืนยันการลบข้อมูลการประชุมนี้หรือไม่?');
        if (!confirmed) return;
        try {
            setDeletingId(documentId);
            await deleteConference({
                variables: { documentId },
                context: authContext,
            });
            await refetch();
        } catch (err) {
            console.error('Failed to delete conference', err);
            window.alert(err?.message ? `ลบข้อมูลไม่สำเร็จ: ${err.message}` : 'ลบข้อมูลไม่สำเร็จ');
        } finally {
            setDeletingId(null);
        }
    };

    let conferences = data?.conferences || [];

    // เตรียมข้อมูลสำหรับ Filter แผนกสำหรับ Role = Admin
    const roleName = session?.user?.role?.name || session?.user?.academicPosition || "";
    const myDeptId = meData?.usersPermissionsUser?.departments?.[0]?.documentId;

    if (loading && meDataLoading) { return }

    // Filter สำหรับ Admin ให้แสดงเฉพาะ conference ที่มี project ที่มี partner ในแผนกเดียวกัน
    if (roleName === 'Admin' && myDeptId) {
        conferences = conferences.filter(conference => {
            // ตรวจสอบว่า conference มี projects หรือไม่
            if (!conference?.projects || conference.projects.length === 0) return false;

            // ตรวจสอบว่ามี project ใดที่มี partner ในแผนกเดียวกันหรือไม่
            return conference.projects.some(proj => {
                if (!proj.partners) return false;

                try {
                    const partnersArray = typeof proj.partners === 'string'
                        ? JSON.parse(proj.partners)
                        : proj.partners;

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
        });
    }

    const getLevelText = (level) => {
        if (level == '0') return 'ระดับชาติ';
        if (level == '1') return 'ระดับนานาชาติ';
        return '-';
    };

    const toUpperSafe = (value) => typeof value === 'string' ? value.trim().toUpperCase() : '';

    const getCountryLabel = (countryCode) => {
        const normalizedCountry = toUpperSafe(countryCode);
        if (!normalizedCountry) return '';
        const country = Country.getCountryByCode(normalizedCountry);
        return country?.name || normalizedCountry;
    };

    const getStateLabel = (stateCode, countryCode) => {
        const normalizedState = toUpperSafe(stateCode);
        if (!normalizedState) return '';
        const normalizedCountry = toUpperSafe(countryCode);
        if (normalizedCountry) {
            const directMatch = typeof State.getStateByCodeAndCountry === 'function'
                ? State.getStateByCodeAndCountry(normalizedState, normalizedCountry)
                : null;
            if (directMatch?.name) return directMatch.name;
            const states = State.getStatesOfCountry(normalizedCountry);
            const fallback = states.find((state) => state?.isoCode?.toUpperCase() === normalizedState);
            if (fallback?.name) return fallback.name;
        }
        return stateCode || normalizedState;
    };

    const getCityLabel = (cityValue, stateCode, countryCode) => {
        if (typeof cityValue === 'string') {
            const trimmed = cityValue.trim();
            if (trimmed) return trimmed;
        }

        if (cityValue === null || cityValue === undefined) return '';

        const normalizedCountry = toUpperSafe(countryCode);
        const normalizedState = toUpperSafe(stateCode);
        if (!normalizedCountry || !normalizedState) return '';

        const cities = City.getCitiesOfState(normalizedCountry, normalizedState);
        const match = cities.find((city) => String(city?.id) === String(cityValue));
        return match?.name || '';
    };

    const getLocationLabel = (city, stateCode, countryCode) => {
        const parts = [];
        const cityLabel = getCityLabel(city, stateCode, countryCode);
        if (cityLabel) parts.push(cityLabel);
        const stateLabel = getStateLabel(stateCode, countryCode);
        if (stateLabel) parts.push(stateLabel);
        const countryLabel = getCountryLabel(countryCode);
        if (countryLabel) parts.push(countryLabel);
        return parts.length ? parts.join(', ') : '-';
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
            <Pageheader title="จัดการข้อมูลการประชุมวิชาการ" btnName="เพิ่มข้อมูลการประชุมวิชาการ" btnLink="/form/create/conference" />

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
                            <TableHead className={'px-5'}>วัน/เดือน/ปี ที่นำเสนอ</TableHead>
                            <TableHead className={'px-5'}>วันที่เพิ่มเข้าสู่ระบบ</TableHead>
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
                                <TableCell className={'px-5 md:max-w-64 whitespace-normal'}>{getLocationLabel(c.city, c.state, c.country)}</TableCell>
                                <TableCell className={'px-5'}>
                                    {c.durationStart && c.durationEnd && (c.durationStart !== c.durationEnd)
                                        ? `${formatDateToDDMMYYYY(c.durationStart)} - ${formatDateToDDMMYYYY(c.durationEnd)}`
                                        : `${formatDateToDDMMYYYY(c.durationStart)}` || '-'
                                    }
                                </TableCell>
                                <TableCell className={'px-5'}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('th-TH') : '-'}</TableCell>
                                <TableCell className="text-right px-5">
                                    <div className="flex justify-end gap-3">
                                        <a className="text-blue-600" href={`/form/conference/view/${c.documentId}`}>ดู</a>
                                        <a className="text-green-600" href={`/form/conference/edit/${c.documentId}`}>แก้ไข</a>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="px-0 py-0 leading-0 h-5 text-red-600"
                                            onClick={() => handleDelete(c.documentId)}
                                            disabled={deletingId === c.documentId || deleteLoading}
                                        >
                                            {deletingId === c.documentId ? 'กำลังลบ...' : 'ลบ'}
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