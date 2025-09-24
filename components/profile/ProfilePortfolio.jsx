'use client'
import React from 'react'

export default function ProfilePortfolio({ data }) {
    return (
        <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">ผลงานวิชาการ</h2>
            <div className="space-y-6">
                {data.length === 0 ? (
                    <div className="text-sm text-gray-500">ยังไม่มีข้อมูลผลงานวิชาการ</div>
                ) : (
                    data.map((item, index) => (
                        <div key={item.documentId || `pub-${index}`} className="border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.authors.join(', ')}</p>
                            <p className="text-sm text-gray-500">{item.year}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}