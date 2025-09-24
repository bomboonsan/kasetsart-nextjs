"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD } from '@/graphql/dashboard';
import StatsCard from '@/components/dashboard/StatsCard';
import DonutChart from '@/components/dashboard/DonutChart';
import PersonnelChart from '@/components/dashboard/PersonnelChart';
import ScholarshipTable from '@/components/dashboard/ScholarshipTable';
import { FileBadge, Presentation, HandCoins, BookOpen } from 'lucide-react';

// Map academic type names (from usersPermissionsUsers.academic_types) into code -> count.
function aggregateAcademicTypes(users = []) {
  const counts = {}; // key -> number
  users.forEach(u => {
    const types = u?.academic_types || [];
    types.forEach(t => {
      const name = t?.name || '';
      if (!name) return;
      counts[name] = (counts[name] || 0) + 1;
    });
  });
  return counts; // e.g. { A: 10, PA: 5 }
}

// Build research stats (icTypes, impacts, sdgs) from project relations.
function buildResearchStats(projects = [], icTypesMaster = [], impactsMaster = [], sdgsMaster = [], filterDeptId = null) {
  // Filter projects by department (any matching department.documentId)
  const filteredProjects = filterDeptId ? projects.filter(p => {
    const depts = p?.departments || [];
    return depts.some(d => d?.documentId === filterDeptId);
  }) : projects;

  const icCounts = {};
  const impactCounts = {};
  const sdgCounts = {};

  filteredProjects.forEach(p => {
    (p.ic_types || []).forEach(item => { if (item?.documentId) icCounts[item.documentId] = (icCounts[item.documentId] || 0) + 1; });
    (p.impacts || []).forEach(item => { if (item?.documentId) impactCounts[item.documentId] = (impactCounts[item.documentId] || 0) + 1; });
    (p.sdgs || []).forEach(item => { if (item?.documentId) sdgCounts[item.documentId] = (sdgCounts[item.documentId] || 0) + 1; });
  });

  const icTypes = icTypesMaster.map(m => ({ documentId: m.documentId, name: m.name, count: icCounts[m.documentId] || 0 }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const impacts = impactsMaster.map(m => ({ documentId: m.documentId, name: m.name, count: impactCounts[m.documentId] || 0 }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const sdgs = sdgsMaster.map(m => ({ documentId: m.documentId, name: m.name, count: sdgCounts[m.documentId] || 0 }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);

  return { icTypes, impacts, sdgs };
}

export default function DashboardPage() {
  const { data, loading, error } = useQuery(GET_DASHBOARD, { fetchPolicy: 'cache-and-network' });
  const [selectedDept, setSelectedDept] = useState('all');
  // Checkbox toggles for each stats category (simulate old behaviour if needed)
  const [useProjects, setUseProjects] = useState(true);
  const [useFunds, setUseFunds] = useState(true);
  const [usePublications, setUsePublications] = useState(true);
  const [useConferences, setUseConferences] = useState(true);
  const [useBooks, setUseBooks] = useState(true);

  const projects = data?.projects || [];
  const funds = data?.funds || [];
  const conferences = data?.conferences || [];
  const publications = data?.publications || [];
  const books = data?.books || [];
  const users = data?.usersPermissionsUsers || [];
  const icTypesMaster = data?.icTypes || [];
  const impactsMaster = data?.impacts || [];
  const sdgsMaster = data?.sdgs || [];
  const departments = data?.departments || [];

  // Stats (apply toggles; you could extend to filter by dept if domain requires)
  const stats = useMemo(() => {
    const items = [];
    if (useProjects) items.push({ key: 'projects', value: String(projects.length), label: 'ทุนโครงการวิจัย', href: '/dashboard/admin/form/projects', icon: HandCoins });
    if (useFunds) items.push({ key: 'funds', value: String(funds.length), label: 'ทุนตำราหนังสือ', href: '/dashboard/admin/form/funds', icon: HandCoins });
    if (usePublications) items.push({ key: 'publications', value: String(publications.length), label: 'การตีพิมพ์ทางวิชาการ', href: '/dashboard/admin/form/publications', icon: FileBadge });
    if (useConferences) items.push({ key: 'conferences', value: String(conferences.length), label: 'การประชุมวิชาการ', href: '/dashboard/admin/form/conferents', icon: Presentation });
    if (useBooks) items.push({ key: 'books', value: String(books.length), label: 'หนังสือและตำรา', href: '/dashboard/admin/form/books', icon: BookOpen });
    return items;
  }, [useProjects, useFunds, usePublications, useConferences, useBooks, projects.length, funds.length, publications.length, conferences.length, books.length]);

  // Academic personnel distribution (from usersPermissionsUsers.academic_types) – treat each academic type entry as one person in that category
  const facultyPersonnelData = useMemo(() => {
    const counts = aggregateAcademicTypes(users);
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(counts).map(([label, raw]) => ({ label, value: ((raw / total) * 100).toFixed(1), raw }));
  }, [users]);

  // Department specific personnel chart could be derived if each user stored department relationship; not in query now, so we reuse faculty data
  const departmentPersonnelData = facultyPersonnelData.map(d => ({ category: d.label, personnel: d.raw, percentage: d.value }));

  // Research stats built from project relations
  const researchStats = useMemo(() => buildResearchStats(projects, icTypesMaster, impactsMaster, sdgsMaster, selectedDept === 'all' ? null : selectedDept), [projects, icTypesMaster, impactsMaster, sdgsMaster, selectedDept]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">ไม่สามารถโหลดข้อมูล: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-6 gap-5'>
        <div className='col-span-6'>
          {/* <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-700">เลือกภาควิชา:
              <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="ml-2 px-3 py-1 bg-white border border-gray-200 text-sm rounded-md text-gray-900">
                <option value="all">ทั้งหมด</option>
                {departments.map(d => <option key={d.documentId} value={d.documentId}>{d.title}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <label className="flex items-center gap-1"><input type="checkbox" checked={useProjects} onChange={e => setUseProjects(e.target.checked)} /> Projects</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={useFunds} onChange={e => setUseFunds(e.target.checked)} /> Funds</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={usePublications} onChange={e => setUsePublications(e.target.checked)} /> Publications</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={useConferences} onChange={e => setUseConferences(e.target.checked)} /> Conferences</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={useBooks} onChange={e => setUseBooks(e.target.checked)} /> Books</label>
            </div>
          </div> */}
          <StatsCard title="สรุปจำนวนผลงานวิชาการทั้งหมดของคณะ" stats={stats} />
        </div>

        <div className='col-span-6 md:col-span-2 h-full'>
          <DonutChart title="ภาพรวมประเภทบุคคลากรของคณะ" subtitle="% จำนวนบุคคลากรแบ่งตามประเภท" data={facultyPersonnelData} colors={['#AAB3DE', '#E0E0E0', '#24B364', '#00BAD1', '#FF9F43']} height={350} />
        </div>

        <div className='col-span-6 md:col-span-4 h-full'>
          <PersonnelChart
            title="ภาพรวมประเภทบุคคลากรของภาควิชา"
            subtitle="จำนวนบุคลากรแบ่งตามประเภท"
            data={departmentPersonnelData}
            colors={['#6366f1', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444']}
            height={80}
            departments={departments}
            selectedDeptId={selectedDept}
            onDeptChange={(id) => setSelectedDept(id)}
            selectedDeptLabel={selectedDept === 'all' ? 'ทั้งหมด' : (departments.find(d => d.documentId === selectedDept)?.title || '')}
          />
        </div>

        <div className='col-span-6 md:col-span-6'>
          <ScholarshipTable
            title="สถิติงานวิจัยตาม IC Types, Impact และ SDG"
            subtitle="จำนวนโครงการวิจัยแยกตามหมวดหมู่"
            researchStats={researchStats}
            departments={departments}
            selectedDeptId={selectedDept}
            onDeptChange={(id) => setSelectedDept(id)}
          />
        </div>
      </div>
    </div>
  );
}

