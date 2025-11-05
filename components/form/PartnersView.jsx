import React, { useState, useEffect } from 'react';

export default function PartnersView({ data }) {
    const [displayRows, setDisplayRows] = useState([]);

    // useEffect(() => {
    //     setHasFirstAuthor(displayRows.some(p => p.partnerComment?.includes('First Author')));
    //     setHasCorresponding(displayRows.some(p => p.partnerComment?.includes('Corresponding Author')));
    // }, [displayRows]);

    useEffect(() => {
        // Initialize with sorted data from props
        const sortedData = Array.isArray(data) ? [...data].sort((a, b) => a.order - b.order) : [];
        setDisplayRows(sortedData);
    }, [data]);


    return (
        <>
            <div className="bg-white border border-gray-200 rounded-b-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ชื่อ-นามสกุล
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    หน่วยงาน
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ประเภทผู้ร่วมโครงการวิจัย
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    หมายเหตุ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สัดส่วนการมีส่วนร่วม (%)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สัดส่วนการวิจัย (%)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayRows.map((p, i) => (
                                <tr key={p.id || p.userID || i} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {p.fullname ? p.fullname : "ไม่ระบุ"}
                                            </div>
                                            <span className='text-xs text-gray-700'>{p.isInternal ? "บุคคลภายใน" : "บุคคลภายนอก"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {p.orgName || '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{p.partnerType || '-'}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{p.partnerComment || '-'}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {p.partnerProportion_percentage_custom && (
                                            <div className="text-sm text-gray-900">
                                                {(parseFloat(p.partnerProportion_percentage_custom))}%
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {p.partnerProportion && (
                                            <div className="text-sm text-gray-900">
                                                {(Number(p.partnerProportion).toFixed(2))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}