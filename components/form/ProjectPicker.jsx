'use client'

import { useEffect, useState } from 'react'
import { useQuery } from "@apollo/client/react";
import { GET_PROJECTS } from '../../graphql/projectQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function ProjectPicker({ label = 'โครงการวิจัย', onSelect, selectedProject, required = false }) {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState('')

    // Load user's projects from API
    // const { data: projectsRes, error: projectsError, isLoading } = useSWR(
    //     open ? 'my-projects' : null,
    //     () => projectAPI.getMyProjects(),
    //     {
    //         onError: (error) => {
    //             const msg = error?.response?.data?.error?.message || error?.message || 'โหลดโครงการไม่สำเร็จ'
    //             setError(msg)
    //         }
    //     }
    // )

    useEffect(() => {
        if (projectsError) {
            setError(projectsError.message || 'โหลดโครงการไม่สำเร็จ')
        }
    }, [projectsError])

    const projects = projectsRes?.data || projectsRes || []

    return (
        <div className="space-y-1 flex items-center">
            <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500 ml-1">*</span>}</label>
            </div>
            <div className="flex-1 space-x-3">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="font-medium py-2 px-4 rounded-md transition-colors duration-200 text-zinc-600 text-sm bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
                >
                    {selectedProject ? 'เปลี่ยนโครงการ' : 'คลิกเพื่อเลือกโครงการวิจัย'}
                </button>
                {selectedProject && (
                    <span className="text-sm text-gray-700">{selectedProject.nameTH || selectedProject.nameEN || `Project #${selectedProject.id}`}</span>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4">
                        <div className="text-lg font-medium">เลือกโครงการวิจัย</div>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        {isLoading ? (
                            <div className="text-sm text-gray-500">กำลังโหลด...</div>
                        ) : (
                            <div className="max-h-80 overflow-auto divide-y divide-gray-100 border rounded">
                                {projects.map(p => (
                                    <button
                                        key={p.documentId || p.id}
                                        type="button"
                                        onClick={() => { onSelect && onSelect(p); setOpen(false) }}
                                        className="w-full text-left p-3 hover:bg-gray-50"
                                    >
                                        <div className="font-medium text-gray-900">{p.nameTH || p.nameEN || `Project #${p.id}`}</div>
                                        <div className="text-xs text-gray-600">ปีงบประมาณ: {p.fiscalYear}</div>
                                    </button>
                                ))}
                                {projects.length === 0 && (
                                    <div className="p-4 text-sm text-gray-500">ไม่มีรายการโครงการ</div>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button variant="outline" type="button" onClick={() => setOpen(false)}>ปิด</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
