'use client'

import { useEffect, useState } from 'react'
import { useQuery } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { GET_PROJECTS } from '../../graphql/projectQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, FileText, X } from 'lucide-react';
import Partners from './Partners';

export default function ProjectPicker({ label = 'โครงการวิจัย', onSelect, selectedProject, required = false }) {
    const { data: session } = useSession();
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredProjects, setFilteredProjects] = useState([])

    const { data: projectsData, loading, error } = useQuery(GET_PROJECTS, {
        variables: {
            pagination: { pageSize: 100 },
            filters: searchTerm ? {
                or: [
                    { fundName: { containsi: searchTerm } },
                    { isEnvironmentallySustainable: { containsi: isEnvironmentallySustainable } },
                    { nameTH: { containsi: searchTerm } },
                    { nameEN: { containsi: searchTerm } },
                    { keywords: { containsi: searchTerm } },
                    { fiscalYear: { eq: parseInt(searchTerm) || undefined } }
                ]
            } : {}
        },
        skip: !searchOpen,
        context: {
            headers: {
                Authorization: session?.jwt ? `Bearer ${session?.jwt}` : ""
            }
        },
        ssr: false
    });

    useEffect(() => {
        const returned = projectsData?.projects;
        if (Array.isArray(returned)) {
            const projects = returned.map(project => ({
                id: project.documentId || project.id,
                documentId: project.documentId || project.id,
                nameTH: project.nameTH,
                nameEN: project.nameEN,
                fiscalYear: project.fiscalYear,
                budget: project.budget,
                keywords: project.keywords,
                projectType: project.projectType,
                isEnvironmentallySustainable: project.isEnvironmentallySustainable,
                fundName: project.fundName,
                researchKind: project.researchKind,
                departments: project.departments || [],
                users: project.users || [],
                partners: project.partners || [],
            }));
            setFilteredProjects(projects);
        } else {
            setFilteredProjects([]);
        }
    }, [projectsData]);

    const handleProjectSelect = (project) => {
        onSelect(project);
        setSearchOpen(false);
        setSearchTerm('');
    };

    const clearSelection = () => {
        onSelect(null);
    };

    const formatProjectDisplay = (project) => {
        return project.nameTH || project.nameEN || `Project #${project.id}`;
    };

    const formatProjectDetails = (project) => {
        const details = [];
        if (project.fiscalYear) details.push(`ปีงบประมาณ: ${project.fiscalYear}`);
        if (project.budget) details.push(`งบประมาณ: ${project.budget.toLocaleString()} บาท`);
        return details.join(' • ');
    };

    return (
        <div className="space-y-1 flex items-center">
            <div className="w-1/3">
                <Label className="text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            </div>
            <div className="flex-1 space-x-3">
                {selectedProject ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                                {formatProjectDisplay(selectedProject)}
                            </div>
                            {formatProjectDetails(selectedProject) && (
                                <div className="text-xs text-gray-600">{formatProjectDetails(selectedProject)}</div>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearSelection}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-gray-500">
                                <Search className="w-4 h-4 mr-2" />
                                คลิกเพื่อเลือกโครงการวิจัย
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>เลือกโครงการวิจัย</DialogTitle>
                                <DialogDescription>ค้นหาและเลือกโครงการวิจัยจากระบบ</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="ค้นหาด้วยชื่อโครงการ, ปีงบประมาณ, หรือคำสำคัญ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                                    {loading && (
                                        <div className="p-4 text-center text-gray-500">กำลังโหลด...</div>
                                    )}
                                    {error && (
                                        <div className="p-4 text-center text-red-500">เกิดข้อผิดพลาด: {error.message}</div>
                                    )}
                                    {!loading && !error && filteredProjects.length === 0 && (
                                        <div className="p-4 text-center text-gray-500">ไม่พบโครงการวิจัย</div>
                                    )}
                                    {!loading && !error && filteredProjects.map((project) => (
                                        <div
                                            key={project.documentId}
                                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleProjectSelect(project)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatProjectDisplay(project)}
                                                    </div>
                                                    {formatProjectDetails(project) && (
                                                        <div className="text-xs text-gray-600">{formatProjectDetails(project)}</div>
                                                    )}
                                                    {project.keywords && (
                                                        <div className="text-xs text-gray-500">คำสำคัญ: {project.keywords}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}
