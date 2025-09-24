"use client"

import { useEffect, useState } from 'react'

export default function ProfileStats(data) {
    console.log("ProfileStats data:", data);

    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        projects: 0,
        conferences: 0,
        publications: 0,
        funds: 0,
        books: 0,
    });
    useEffect(() => {
        if (data.userId) {
            let conferencesCount = 0;
            let publicationsCount = 0;
            if (data.userId.projects && Array.isArray(data.userId.projects)) {
                data.userId.projects.forEach(project => {
                    if (project.conferences && Array.isArray(project.conferences)) {
                        conferencesCount += project.conferences.length;
                    }
                    if (project.publications && Array.isArray(project.publications)) {
                        publicationsCount += project.publications.length;
                    }
                });
            }
            let booksCount = 0;
            if (data.userId.funds && Array.isArray(data.userId.funds)) {
                data.userId.funds.forEach(fund => {
                    if (fund.books && Array.isArray(fund.books)) {
                        booksCount += fund.books.length;
                    }
                });
            }
            // Update counts state
            setCounts({
                projects: data.userId.projects?.length || 0,
                conferences: conferencesCount,
                publications: publicationsCount,
                funds: data.userId.funds?.length || 0,
                books: booksCount,
            });
            setLoading(false);
        }
    }, [data.userId]);

    const stats = [
        { label: 'โครงการวิจัย', value: loading ? '...' : String(counts.projects) }, // Project Research
        { label: 'ประชุมวิชาการ', value: loading ? '...' : String(counts.conferences) }, // Work Conference
        { label: 'ตีพิมพ์ทางวิชาการ', value: loading ? '...' : String(counts.publications) }, // Work Publication
        { label: 'ขอทุนเขียนตำรา', value: loading ? '...' : String(counts.funds) }, // Project Funding
        { label: 'หนังสือและตำรา', value: loading ? '...' : String(counts.books) }, // Work Book
    ]
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 bg-gray-50 p-6 rounded-b-lg border-t border-t-gray-200 z-10 relative -mt-2 shadow">
            {stats.map((stat, index) => (
                <p key={index} className="text-gray-900 text-center space-x-1.5">
                    <span className="text-primary text-xl font-bold">{stat.value}</span>
                    <span className="text-lg">{stat.label}</span>
                </p>
            ))}
        </div>
    )
}