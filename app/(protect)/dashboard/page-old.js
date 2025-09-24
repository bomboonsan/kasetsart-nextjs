'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
// คอมโพเนนต์ UI ของ Dashboard
import StatsCard from '@/components/dashboard/StatsCard'
import DonutChart from '@/components/dashboard/DonutChart'
import PersonnelChart from '@/components/dashboard/PersonnelChart'
import ScholarshipTable from '@/components/dashboard/ScholarshipTable'
import ScholarshipTableAll from '@/components/dashboard/ScholarshipTableAll'
import { dashboardAPI, valueFromAPI } from '@/lib/api'
import { FileSearch, FileBadge, Presentation, HandCoins, BookOpen } from "lucide-react";

export default function DashboardHome() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState([])
  const [facultyPersonnelData, setFacultyPersonnelData] = useState([])
  const [departmentPersonnelData, setDepartmentPersonnelData] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('all')
  const [researchStats, setResearchStats] = useState({ icTypes: [], impacts: [], sdgs: [] })

  // Use SWR to load initial dashboard data
  const { data: deptsRes, error: deptError, isLoading: loadingDepts } = useSWR('departments', () => valueFromAPI.getDepartments(), { revalidateOnFocus: false, dedupingInterval: 60000 })
  const { data: statsRes, error: statsError, isLoading: loadingStats } = useSWR('dashboardStats', () => dashboardAPI.getStats(), { revalidateOnFocus: false, dedupingInterval: 60000 })
  const { data: facultyPersonnelRes, error: facultyError, isLoading: loadingFaculty } = useSWR('facultyPersonnel', () => dashboardAPI.getPersonnelByAcademicType(), { revalidateOnFocus: false, dedupingInterval: 60000 })
  const { data: researchStatsRes, error: researchError, isLoading: loadingResearch } = useSWR('researchStats', () => dashboardAPI.getResearchStatsByTypes(), { revalidateOnFocus: false, dedupingInterval: 60000 })

  const loadResearchStatsForDepartment = useCallback(async (departmentId) => {
    try {
      const stats = await dashboardAPI.getResearchStatsByTypes(departmentId)
      console.log('Loaded research stats for department', departmentId, stats)
      setResearchStats(stats)
    } catch (err) {
      setError('ไม่สามารถโหลดสถิติการวิจัยสำหรับภาควิชานี้ได้')
    }
  }, [])

  const loadPersonnelForDepartment = useCallback(async (departmentId) => {
    try {
      if (!departmentId || departmentId === 'all') {
        return
      }
      const deptPersonnel = await dashboardAPI.getPersonnelByAcademicType(departmentId)
      const keys = ['SA', 'PA', 'SP', 'IP', 'A']
      const normalized = {}
      keys.forEach(k => {
        const foundKey = Object.keys(deptPersonnel || {}).find(rk => String(rk).toUpperCase() === k)
        normalized[k] = Number(foundKey ? deptPersonnel[foundKey] : 0)
      })
      const total = Object.values(normalized).reduce((s, v) => s + v, 0) || 1
      const deptChartData = Object.entries(normalized).map(([type, count]) => ({
        category: type,
        personnel: count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      setDepartmentPersonnelData(deptChartData)
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลบุคลากรสำหรับภาควิชานี้ได้')
    }
  }, [])

  // When selectedDept changes, reload personnel-by-department and research stats
  useEffect(() => {
    loadPersonnelForDepartment(selectedDept)
    loadResearchStatsForDepartment(selectedDept)
  }, [selectedDept, loadPersonnelForDepartment, loadResearchStatsForDepartment])

  // When SWR data becomes available map into local state
  useEffect(() => {
    if (deptsRes) {
      const departmentsData = (deptsRes?.data || deptsRes || []).map(d => {
        const rawId = d?.id ?? d?.attributes?.id ?? null
        const rawDoc = d?.documentId ?? d?.attributes?.documentId ?? null
        const name = d?.attributes?.name || d?.name || d?.title || d?.attributes?.displayName || d?.displayName || d
        return { id: rawId, documentId: rawDoc, name }
      })
      setDepartments(departmentsData)
      // คอมเมนต์ (ไทย): แก้ไขให้ใช้ functional update เพื่อหลีกเลี่ยงการใส่ selectedDept ใน dependency array
      if (departmentsData.length > 0) {
        setSelectedDept(currentSelectedDept => {
          if (currentSelectedDept === 'all') {
            return departmentsData[0].documentId || departmentsData[0].id || 'all';
          }
          return currentSelectedDept;
        });
      }
    }

    if (statsRes) {
      const [projectsRes, fundingsRes, publicationsRes, conferencesRes, booksRes] = statsRes
      const projectsCount = projectsRes?.meta?.pagination?.total || projectsRes?.data?.length || 0
      const fundingsCount = fundingsRes?.meta?.pagination?.total || fundingsRes?.data?.length || 0
      const publicationsCount = publicationsRes?.meta?.pagination?.total || publicationsRes?.data?.length || 0
      const conferencesCount = conferencesRes?.meta?.pagination?.total || conferencesRes?.data?.length || 0
      const booksCount = booksRes?.meta?.pagination?.total || booksRes?.data?.length || 0

      const statsData = [
        { value: String(projectsCount), href: '/dashboard/admin/form/projects' , label: 'ทุนโครงการวิจัย', icon: () => <HandCoins className='size-8 text-gray-600' /> },
        { value: String(fundingsCount), href: '/dashboard/admin/form/funds' , label: 'ทุนตำราหนังสือ', icon: () => <HandCoins className='size-8 text-gray-600' /> },
        { value: String(publicationsCount), href: '/dashboard/admin/form/publications' , label: 'การตีพิมพ์ทางวิชาการ', icon: () => <FileBadge className='size-8 text-gray-600' /> },
        { value: String(conferencesCount), href: '/dashboard/admin/form/conferents' , label: 'การประชุมวิชาการ', icon: () => <Presentation className='size-8 text-gray-600' /> },
        { value: String(booksCount), href: '/dashboard/admin/form/books' , label: 'หนังสือและตำรา', icon: () => <BookOpen className='size-8 text-gray-600' /> },
      ]

      setStats(statsData)
    }

    if (facultyPersonnelRes) {
      const normalizePersonnelCounts = (raw = {}) => {
        const keys = ['SA', 'PA', 'SP', 'IP', 'A']
        const out = {}
        keys.forEach(k => {
          const foundKey = Object.keys(raw || {}).find(rk => String(rk).toUpperCase() === k)
          out[k] = Number(foundKey ? raw[foundKey] : 0)
        })
        return out
      }

      const normalizedFaculty = normalizePersonnelCounts(facultyPersonnelRes)
      const totalPersonnel = Object.values(normalizedFaculty).reduce((sum, count) => sum + count, 0) || 1
      const facultyChartData = Object.entries(normalizedFaculty).map(([type, count]) => ({
        label: type,
        value: ((count / totalPersonnel) * 100).toFixed(1),
        raw: count
      }))

      const departmentChartData = Object.entries(normalizedFaculty).map(([type, count]) => ({
        category: type,
        personnel: count,
        percentage: ((count / totalPersonnel) * 100).toFixed(1)
      }))

      setFacultyPersonnelData(facultyChartData)
      setDepartmentPersonnelData(departmentChartData)
    }

    if (researchStatsRes) {
      setResearchStats(researchStatsRes)
      console.log('Loaded research stats for all departments', researchStatsRes)
    }

    setLoading(Boolean(loadingDepts || loadingStats || loadingFaculty || loadingResearch))
    if (deptError || statsError || facultyError || researchError) {
      setError('ไม่สามารถโหลดข้อมูล Dashboard ได้')
    }
  }, [deptsRes, statsRes, facultyPersonnelRes, researchStatsRes, loadingDepts, loadingStats, loadingFaculty, loadingResearch, deptError, statsError, facultyError, researchError])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">
        {error}
        <button
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-6 gap-5'>
        <div className='col-span-6'>
          <StatsCard title="สรุปจำนวนผลงานวิชาการทั้งหมดของคณะ" stats={stats} />
        </div>

        <div className='col-span-6 md:col-span-2 h-full'>
          <DonutChart
            title="ภาพรวมประเภทบุคคลากรของคณะ"
            subtitle="% จำนวนบุคคลากรแบ่งตามประเภท"
            data={facultyPersonnelData}
            colors={['#AAB3DE', '#E0E0E0', '#24B364', '#00BAD1', '#FF9F43']}
            height={350}
          />
        </div>

        <div className='col-span-6 md:col-span-4 h-full'>
          <PersonnelChart
            title="ภาพรวมประเภทบุคคลากรของภาควิชา"
            subtitle="จำนวนบุคลากรแบ่งตามประเภท"
            data={departmentPersonnelData}
            colors={['#6366f1', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444']}
            height={80}
          />
        </div>

        <div className='col-span-6 md:col-span-6'>
          <ScholarshipTable
            title="สถิติงานวิจัยตาม IC Types, Impact และ SDG"
            subtitle="จำนวนโครงการวิจัยแยกตามหมวดหมู่"
            researchStats={researchStats}
          />
        </div>
      </div>
    </div>
  )
}