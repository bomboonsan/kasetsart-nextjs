"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client/react'
import Pageheader from '@/components/layout/Pageheader'
import { GET_CONFERENCE } from '@/graphql/formQueries'
import { Button } from '@/components/ui/button'
import Block from '@/components/layout/Block'
import FieldView from '@/components/myui/FieldView'
import PartnersView from '@/components/form/PartnersView'
import { formatDateToDDMMYYYY } from '@/utils/formatters'
import { Country, State, City } from 'country-state-city'

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

export default function ConferenceView() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id

    const { data, loading, error } = useQuery(GET_CONFERENCE, {
        variables: { documentId },
        skip: !documentId,
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        }
    })

    const conference = data?.conference

    const getEnvironmentalText = (value) => {
        if (value == '0') return 'เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืน';
        if (value == '1') return 'ไม่เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืน';
        return '-';
    };

    const getPresentationWorkText = (value) => {
        if (value == '0') return 'ได้รับเชิญ (Invited Paper.)';
        if (value == '1') return 'เสนอเอง';
        return '-';
    };

    const getPresentTypeText = (value) => {
        if (value == '0') return 'ภาคบรรยาย (Oral)';
        if (value == '1') return 'ภาคโปสเตอร์ (Poster)';
        if (value == '2') return 'เข้าร่วมประชุมวิชาการ';
        return '-';
    };

    const getArticleTypeText = (value) => {
        if (value == '0') return 'Abstract อย่างเดียว';
        if (value == '1') return 'เรื่องเต็ม';
        return '-';
    };

    const getLevelText = (value) => {
        if (value == '0') return 'ระดับชาติ';
        if (value == '1') return 'ระดับนานาชาติ';
        return '-';
    };

    const getCostTypeText = (value) => {
        const costTypes = {
            '1': 'เงินทุนส่วนตัว',
            '10': 'เงินอุดหนุนรัฐบาลและเงินอุดหนุนอื่นที่รัฐบาลจัดสรรให้',
            '11': 'เงินงบประมาณมหาวิทยาลัย',
            '12': 'เงินรายได้ส่วนกลาง มก.',
            '13': 'ทุนอุดหนุนวิจัย มก.',
            '14': 'เงินรายได้มหาวิทยาลัย',
            '15': 'เงินรายได้ส่วนงาน',
            '16': 'องค์กรรัฐ',
            '17': 'องค์กรอิสระและเอกชน',
            '18': 'แหล่งทุนต่างประเทศ',
            '20': 'รัฐวิสาหกิจ',
        };
        return costTypes[value] || '-';
    };

    return (
        <div>
            <Pageheader title="ข้อมูลการประชุม" />
            {loading && <div className="p-6">Loading...</div>}
            {error && <div className="p-6 text-red-600">โหลดข้อมูลผิดพลาด: {error.message}</div>}
            {conference && (
                <div className='space-y-4'>
                    <Block>
                        <div className='mb-4 flex justify-end'>
                            <Button variant="default" onClick={() => router.push(`/admin/form/conference/edit/${conference.documentId}`)}>แก้ไข</Button>
                        </div>
                        <div className="inputGroup">
                            <FieldView label="ชื่อผลงาน (ไทย)" value={conference.titleTH || '-'} />
                            <FieldView label="ชื่อผลงาน (อังกฤษ)" value={conference.titleEN || '-'} />
                            <FieldView label="เกี่ยวข้องกับสิ่งแวดล้อมและความยั่งยืน" value={getEnvironmentalText(conference.isEnvironmentallySustainable)} />
                            <FieldView label="ชื่อการประชุมทางวิชาการ" value={conference.journalName || '-'} />
                            <FieldView label="โครงการวิจัยที่เกี่ยวข้อง" value={conference.projects?.[0]?.nameTH || conference.projects?.[0]?.nameEN || '-'} />
                            <FieldView label="DOI" value={conference.doi || '-'} />
                            <FieldView label="ISBN" value={conference.isbn || '-'} />
                            <FieldView label="วัน/เดือน/ปี ที่นำเสนอ" value={conference.durationStart && conference.durationEnd ? `${formatDateToDDMMYYYY(conference.durationStart)} - ${formatDateToDDMMYYYY(conference.durationEnd)}` : formatDateToDDMMYYYY(conference.durationStart) || formatDateToDDMMYYYY(conference.durationEnd) || '-'} />
                            <FieldView label="ค่าใช้จ่าย" value={conference.cost ? `${conference.cost.toLocaleString()} บาท จาก${getCostTypeText(conference.costType)}` : '-'} />
                            <FieldView label="การนำเสนอผลงาน" value={getPresentationWorkText(conference.presentationWork)} />
                            <FieldView label="ประเภทการนำเสนอ" value={getPresentTypeText(conference.presentType)} />
                            <FieldView label="ลักษณะของบทความ" value={getArticleTypeText(conference.articleType)} />
                            <FieldView label="บทคัดย่อ (ไทย)" value={conference.abstractTH || '-'} />
                            <FieldView label="บทคัดย่อ (อังกฤษ)" value={conference.abstractEN || '-'} />
                            <FieldView label="สรุปเนื้อหา" value={conference.summary || '-'} />
                            <FieldView label="ระดับการนำเสนอ" value={getLevelText(conference.level)} />
                            <FieldView label="สถานที่" value={getLocationLabel(conference.city, conference.state, conference.country)} />
                            <FieldView label="ชื่อแหล่งทุน" value={conference.fundName || '-'} />
                            <FieldView label="คำสำคัญ" value={conference.keywords || '-'} />
                        </div>
                    </Block>

                    <Block>
                        <h2 className="text-lg font-medium mb-3">ไฟล์แนบ</h2>
                        <div className="space-y-2">
                            {conference.attachments && conference.attachments.length > 0 ? (
                                conference.attachments.map((file) => (
                                    <div key={file.documentId || file.id}>
                                        <a href={`${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1338'}${file.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div>ไม่มีไฟล์แนบ</div>
                            )}
                        </div>
                    </Block>

                    {conference.projects?.[0]?.partners && conference.projects[0].partners.length > 0 && (
                        <Block>
                            <h2 className="text-lg font-medium mb-3">ผู้ร่วมงาน</h2>
                            <PartnersView data={conference.projects[0].partners} />
                        </Block>
                    )}
                </div>
            )}
        </div>
    )
}