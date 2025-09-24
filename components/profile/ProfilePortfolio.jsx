'use client'
import React from 'react'
import { useEffect, useState } from 'react';

import PublicationItem from './PortfolioItem';
import Block from '../layout/Block';

const TYPE_TABS = [
    { key: 'PROJECT', label: 'โครงการวิจัย' },
    { key: 'CONFERENCE', label: 'ประชุมวิชาการ' },
    { key: 'PUBLICATION', label: 'ตีพิมพ์ทางวิชาการ' },
    { key: 'FUNDING', label: 'ขอรับทุนเขียนตำรา' },
    { key: 'BOOK', label: 'หนังสือและตำรา' },
]



export default function ProfilePortfolio({ data }) {
    console.log("ProfilePortfolio data:", data);
    const [conferences, setConferences] = useState([]);
    const [publications, setPublications] = useState([]);
    const [books, setBooks] = useState([]);
    
    useEffect(() => {
        let conferences = [];
        let publications = [];
        let books = [];
        if (!data) return;
        if (!data.projects) return;
        if (!data.funds) return;
        data.projects.forEach(project => {
            if (project.conferences && Array.isArray(project.conferences)) {
                conferences = conferences.concat(project.conferences);
            }
            if (project.publications && Array.isArray(project.publications)) {
                publications = publications.concat(project.publications);
            }
        });

        data.funds.forEach(fund => {
            if (fund.books && Array.isArray(fund.books)) {
                books = books.concat(fund.books);
            }
        });
        setConferences(conferences);
        setPublications(publications);
        setBooks(books);
    } , [data]);
    
    if (!data) return;

    


    const [activeType, setActiveType] = useState('PROJECT')
    return (
        <Block className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">ผลงานวิชาการ</h2>
            <div className="flex gap-2 border-b">
                {TYPE_TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveType(t.key)}
                        className={`px-3 py-2 text-sm -mb-px border-b-2 ${activeType === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="space-y-4 mt-5">
                {(() => {
                    switch (activeType) {
                        case 'PROJECT':
                            return data.projects.length === 0 ? (
                                <div className="text-sm text-gray-500">ยังไม่มีโครงการ</div>
                            ) : (
                                data.projects.map(p => (
                                    <PublicationItem
                                        key={p.documentId || p.id}
                                        title={p.nameTH}
                                        description={p.nameEN}
                                        editLink={`/form/project/edit/${p.documentId || p.id}`}
                                        attachments={p.attachments || []}
                                    />
                                ))
                            );
                        case 'CONFERENCE':
                            return conferences.length === 0 ? (
                                <div className="text-sm text-gray-500">ยังไม่มีข้อมูลประชุมวิชาการ</div>
                            ) : (
                                    conferences.map(c => (
                                    <PublicationItem
                                        key={c.documentId || c.id}
                                        title={c.titleTH}
                                        description={c.titleEN}
                                        editLink={`/form/conference/edit/${c.documentId || c.id}`}
                                        attachments={c.attachments || []}
                                    />
                                ))
                            );
                        case 'PUBLICATION':
                            return publications.length === 0 ? (
                                <div className="text-sm text-gray-500">ยังไม่มีข้อมูลตีพิมพ์ทางวิชาการ</div>
                            ) : (
                                publications.map(pu => (
                                    <PublicationItem
                                        key={pu.documentId || pu.id}
                                        title={pu.titleTH}
                                        description={pu.titleEN}
                                        editLink={`/form/publication/edit/${pu.documentId || pu.id}`}
                                        attachments={pu.attachments || []}
                                    />
                                ))
                            );
                        case 'FUNDING':
                            return data.funds.length === 0 ? (
                                <div className="text-sm text-gray-500">ยังไม่มีข้อมูลขอรับทุนเขียนตำรา</div>
                            ) : (
                                data.funds.map(f => (
                                    <PublicationItem
                                        key={f.documentId || f.id}
                                        title={f.contentDesc}
                                        editLink={`/form/fund/edit/${f.documentId || f.id}`}
                                        attachments={f.attachments || []}
                                    />
                                ))
                            );
                        case 'BOOK':
                            return books.length === 0 ? (
                                <div className="text-sm text-gray-500">ยังไม่มีข้อมูลหนังสือและตำรา</div>
                            ) : (
                                books.map(b => (
                                    <PublicationItem
                                        key={b.documentId || b.id}
                                        title={b.titleTH}
                                        description={b.titleEN}
                                        editLink={`/form/book/edit/${b.documentId || b.id}`}
                                        attachments={b.attachments || []}
                                    />
                                ))
                            );
                        default:
                            return null;
                    }
                })()}
                                    
            </div>
        </Block>
    );
}