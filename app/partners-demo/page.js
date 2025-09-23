'use client'
import React, { useState } from 'react';
import Partners from '@/components/form/Partners';

const initialData = [
    {
        id: 1,
        order: 1,
        fullname: "สมชาย ใจดี",
        orgName: "คณะเกษตรศาสตร์ มหาวิทยาลัยเกษตรศาสตร์",
        partnerType: "หัวหน้าโครงการ",
        partnerComment: "First Author",
        partnerProportion_percentage_custom: "50",
        partnerProportion: 0.5,
        isInternal: true,
    },
    {
        id: 2,
        order: 2,
        fullname: "สมหญิง รักงาน",
        orgName: "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์",
        partnerType: "นักวิจัยร่วม",
        partnerComment: "",
        partnerProportion_percentage_custom: "30",
        partnerProportion: 0.3,
        isInternal: true,
    }
];

export default function PartnersDemo() {
    const [partnersData, setPartnersData] = useState(initialData);

    const handlePartnersChange = (newData) => {
        console.log('Partners data changed:', newData);
        setPartnersData(newData);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Partners Component Demo</h1>
            
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">ผู้ร่วมโครงการวิจัย</h2>
                <Partners 
                    data={partnersData} 
                    onChange={handlePartnersChange} 
                />
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Current Data (JSON):</h3>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(partnersData, null, 2)}
                </pre>
            </div>
        </div>
    );
}