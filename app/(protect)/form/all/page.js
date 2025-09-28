'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Pageheader from '@/components/layout/Pageheader';

export default function FormAll() {
    const sections = [
        {
            title: 'ทุนโครงการวิจัย',
            description: 'จัดการโครงการวิจัยและข้อมูลการวิจัยทั้งหมดในระบบ',
            href: '/form/project',
            icon: '🔬',
            color: 'bg-blue-500'
        },
        {
            title: 'ทุนหนังสือหรือตำรา',
            description: 'จัดการข้อมูลทุนสนับสนุนโครงการทั้งหมด',
            href: '/form/fund',
            icon: '💰',
            color: 'bg-green-500'
        },
        {
            title: 'ประชุมวิชาการ',
            description: 'จัดการข้อมูลการเข้าร่วมและนำเสนอในที่ประชุมทั้งหมด',
            href: '/form/conference',
            icon: '🎤',
            color: 'bg-purple-500'
        },
        {
            title: 'ตีพิมพ์ทางวิชาการ',
            description: 'จัดการข้อมูลบทความและงานตีพิมพ์ทั้งหมด',
            href: '/form/publication',
            icon: '📄',
            color: 'bg-orange-500'
        },
        {
            title: 'หนังสือและตำรา',
            description: 'จัดการข้อมูลหนังสือและตำราทั้งหมด',
            href: '/form/book',
            icon: '📚',
            color: 'bg-red-500'
        }
    ]

    return (
        <div className="space-y-6">
            <div className='flex justify-between items-center'>
                <Pageheader title="จัดการข้อมูลวิจัยและผลงาน" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <Link key={section.href} href={section.href} className="block">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    {/* <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                    {section.icon}
                  </div> */}
                                    <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                                </div>
                                <p className="text-gray-600 mb-4">{section.description}</p>
                                <div className="flex justify-end">
                                    <span className="text-blue-600 font-medium hover:text-blue-800">
                                        จัดการข้อมูล →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    )
}
