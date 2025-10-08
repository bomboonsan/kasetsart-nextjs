import { useMemo } from 'react';
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import ReportFilters from '@/components/report/ReportFilters';
import { useQuery } from '@apollo/client/react';
import { GET_REPORT_D } from '@/graphql/reportQueries';

export default function ReportTableDfull() {
  const { data, loading, error } = useQuery(GET_REPORT_D);
  const f1 = v => (v === 0 || v ? Number(v).toFixed(1) : '');

  // Mapping / constants
  const SCOPUS_QUARTER = { 1: 'q1', 2: 'q2', 3: 'q3', 4: 'q4', 5: 'delisted' };
  const WOS_MAP = { 1: 'scie', 2: 'ssci', 3: 'ahci', 4: 'esci' };
  const ABDC_MAP = { 1: 'aStar', 2: 'a', 3: 'b', 4: 'c', 5: 'other' };
  const AJG_MAP = { 5: 'ajg1', 4: 'ajg2', 3: 'ajg3', 2: 'ajg4', 1: 'ajg4Star' };

  // Helper to safely parse partners proportion per department
  function extractDepartmentProportion(pub, departmentId) {
    let partnersAgg = [];
    const allPartnersSources = [];
    (pub.projects || []).forEach(prj => {
      if (prj.partners) {
        allPartnersSources.push(prj.partners);
      }
    });

    allPartnersSources.forEach(src => {
      if (Array.isArray(src)) {
        partnersAgg = partnersAgg.concat(src);
      } else if (typeof src === 'string') {
        try {
          const parsed = JSON.parse(src);
          if (Array.isArray(parsed)) {
            partnersAgg = partnersAgg.concat(parsed);
          }
        } catch { /* ignore */ }
      }
    });

    if (partnersAgg.length === 0) return 1;

    let sum = 0;
    partnersAgg.forEach(p => {
      if (!p || typeof p !== 'object') return;
      const proportion = Number(p.partnerProportion || p.partnerProportion_percentage_custom || 0);
      const userDeps = p.user?.departments || p.User?.departments || [];
      const depIds = userDeps.map(d => d.documentId || d.id);
      if (depIds.includes(departmentId)) {
        if (!isNaN(proportion) && proportion > 0) sum += proportion;
      }
    });

    if (sum === 0) return 1;
    return sum;
  }

  const { reportData, totalRow, csvData } = useMemo(() => {
    if (!data) return { reportData: [], totalRow: {}, csvData: [] };
    const departments = (data.departments || []).filter(d => d.title !== 'สำนักงานเลขานุการ');
    const publications = data.publications || [];

    const rows = departments.map(dep => ({
      discipline: dep.title,
      tciTier1: 0,
      tciTier2: 0,
      nonTci: 0,
      totalNational: 0,
      aci: 0,
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      delisted: 0,
      totalScopus: 0,
      scie: 0,
      ssci: 0,
      ahci: 0,
      esci: 0,
      totalWebOfScience: 0,
      aStar: 0,
      a: 0,
      b: 0,
      c: 0,
      totalAbdc: 0,
      ajg1: 0,
      ajg2: 0,
      ajg3: 0,
      ajg4: 0,
      ajg4Star: 0,
      totalAjg: 0,
      otherPjr: 0,
      totalInternational: 0,
      totalPublications: 0,
      _depId: dep.documentId
    }));
    const rowByDept = Object.fromEntries(rows.map(r => [r._depId, r]));

    publications.forEach(pub => {
      const level = pub.level;
      const isJournalDb = String(pub.isJournalDatabase) === '1' || pub.isJournalDatabase === 1;
      const proportionPerDept = {};
      const pubDeptIds = new Set();
      (pub.projects || []).forEach(prj => {
        (prj.departments || []).forEach(d => pubDeptIds.add(d.documentId));
      });

      if (pubDeptIds.size === 0) return;

      pubDeptIds.forEach(depId => {
        proportionPerDept[depId] = extractDepartmentProportion(pub, depId);
      });

      pubDeptIds.forEach(depId => {
        const row = rowByDept[depId];
        if (!row) return;
        const p = proportionPerDept[depId] || 1;

        if (Number(level) === 0) { // National
          if (isJournalDb) {
            if (String(pub.isTCI1) === '1') row.tciTier1 += p;
            else if (String(pub.isTCI2) === '1') row.tciTier2 += p;
            else if (String(pub.isACI) === '1') row.aci += p;
            else row.nonTci += p;
          } else {
            row.nonTci += p;
          }
        } else if (Number(level) === 1) { // International
          if (isJournalDb) {
            // --- SINGLE COUNT LOGIC ---
            if (String(pub.isScopus) === '1') {
              const qKey = SCOPUS_QUARTER[Number(pub.scopusType)];
              if (qKey && row[qKey] !== undefined) row[qKey] += p;
            } else if (String(pub.isWOS) === '1') {
              const wKey = WOS_MAP[Number(pub.wosType)];
              if (wKey && row[wKey] !== undefined) row[wKey] += p;
            } else if (String(pub.isABDC) === '1') {
              const aKey = ABDC_MAP[Number(pub.abdcType)];
              if (aKey && row[aKey] !== undefined) row[aKey] += p;
            } else if (String(pub.isAJG) === '1') {
              const jKey = AJG_MAP[Number(pub.ajgType)];
              if (jKey && row[jKey] !== undefined) row[jKey] += p;
            }
          } else {
            row.otherPjr += p;
          }
        }
      });
    });

    // Post compute totals
    rows.forEach(r => {
      r.totalNational = r.tciTier1 + r.tciTier2 + r.nonTci;
      r.totalScopus = r.q1 + r.q2 + r.q3 + r.q4 + r.delisted;
      r.totalWebOfScience = r.scie + r.ssci + r.ahci + r.esci;
      r.totalAbdc = r.aStar + r.a + r.b + r.c;
      r.totalAjg = r.ajg1 + r.ajg2 + r.ajg3 + r.ajg4 + r.ajg4Star;
      r.totalInternational = r.totalScopus + r.totalWebOfScience + r.totalAbdc + r.totalAjg + r.otherPjr;
      r.totalPublications = r.totalNational + r.totalInternational;
    });

    // Aggregate total row
    const total = rows.reduce((acc, r) => {
      Object.keys(r).forEach(k => {
        if (k.startsWith('_') || k === 'discipline') return;
        acc[k] = (acc[k] || 0) + (typeof r[k] === 'number' ? r[k] : 0);
      });
      return acc;
    }, {});
    const totalRow = { discipline: 'Total', ...total };

    const csvData = [
      [
        "Discipline", "TCI_Tier1", "TCI_Tier2", "Non_TCI", "Total_National", "ACI", "Q1", "Q2", "Q3", "Q4", "Delisted_Scopus", "Total_Scopus", "SCIE", "SSCI", "AHCI", "ESCI", "Total_Web_of_Science", "A*", "A", "B", "C", "Total_ABDC", "AJG1", "AJG2", "AJG3", "AJG4", "AJG4*", "Total_AJG", "Other_PJR", "Total_International_SingleCount", "Total_Publications_SingleCount"
      ],
      ...rows.map(row => [
        row.discipline,
        row.tciTier1, row.tciTier2, row.nonTci, row.totalNational,
        row.aci, row.q1, row.q2, row.q3, row.q4, row.delisted, row.totalScopus,
        row.scie, row.ssci, row.ahci, row.esci, row.totalWebOfScience,
        row.aStar, row.a, row.b, row.c, row.totalAbdc,
        row.ajg1, row.ajg2, row.ajg3, row.ajg4, row.ajg4Star, row.totalAjg,
        row.otherPjr, row.totalInternational, row.totalPublications
      ]),
      [
        totalRow.discipline,
        totalRow.tciTier1 || 0, totalRow.tciTier2 || 0, totalRow.nonTci || 0, totalRow.totalNational || 0,
        totalRow.aci || 0, totalRow.q1 || 0, totalRow.q2 || 0, totalRow.q3 || 0, totalRow.q4 || 0, totalRow.delisted || 0, totalRow.totalScopus || 0,
        totalRow.scie || 0, totalRow.ssci || 0, totalRow.ahci || 0, totalRow.esci || 0, totalRow.totalWebOfScience || 0,
        totalRow.aStar || 0, totalRow.a || 0, totalRow.b || 0, totalRow.c || 0, totalRow.totalAbdc || 0,
        totalRow.ajg1 || 0, totalRow.ajg2 || 0, totalRow.ajg3 || 0, totalRow.ajg4 || 0, totalRow.ajg4Star || 0, totalRow.totalAjg || 0,
        totalRow.otherPjr || 0, totalRow.totalInternational || 0, totalRow.totalPublications || 0
      ]
    ];

    return { reportData: rows, totalRow, csvData };
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">กำลังโหลดรายงาน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-red-600">เกิดข้อผิดพลาดในการโหลดรายงาน</p>
        <p className="text-gray-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <ReportFilters />
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[2000px]">
            {/* Table Head */}
            <thead>
              <tr className="">
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r" rowSpan="2">Discipline</th>
                <th className="bg-green-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-b" colSpan="4">National Publications</th>
                <th className="bg-pink-200 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-b" colSpan="25">International Publications</th>
                <th className="bg-blue-100 px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider" rowSpan="3">Total Publications<br />(National + International)</th>
              </tr>
              <tr>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">TCI<br />(Tier 1)</th>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">TCI<br />(Tier 2)</th>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Non-listed<br />on TCI</th>
                <th className="bg-green-100 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Total<br />National<br />Publications</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">ACI</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Q1</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Q2</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Q3</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Q4</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Delisted from Scopus<br />(as of July 2024)</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Total Scopus</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">SCIE</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">SSCI</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AHCI</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">ESCI</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Total<br />Web of Science</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">A*</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">A</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">B</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">C</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Total<br />ABDC</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AJG1</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AJG2</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AJG3</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AJG4</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">AJG4*</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Total<br />AJG</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Other PJR</th>
                <th className="bg-pink-200 px-2 py-2 text-center text-xs font-medium text-gray-700 border-r">Total<br />International<br />Publications <br /> with single count</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border-r font-medium">{row.discipline}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.tciTier1)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.tciTier2)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.nonTci)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{f1(row.totalNational)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.aci)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.q1)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.q2)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.q3)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.q4)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.delisted)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.totalScopus)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.scie)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ssci)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ahci)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.esci)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.totalWebOfScience)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.aStar)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.a)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.b)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.c)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.totalAbdc)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ajg1)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ajg2)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ajg3)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ajg4)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.ajg4Star)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.totalAjg)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(row.otherPjr)}</td>
                  <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-medium">{f1(row.totalInternational)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">{f1(row.totalPublications)}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-3 text-sm text-gray-900 border-r font-bold">{totalRow.discipline}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.tciTier1)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.tciTier2)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.nonTci)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{f1(totalRow.totalNational)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.aci)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.q1)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.q2)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.q3)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.q4)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.delisted)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.totalScopus)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.scie)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ssci)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ahci)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.esci)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.totalWebOfScience)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.aStar)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.a)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.b)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.c)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.totalAbdc)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ajg1)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ajg2)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ajg3)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ajg4)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.ajg4Star)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.totalAjg)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r">{f1(totalRow.otherPjr)}</td>
                <td className="px-2 py-3 text-sm text-center text-gray-900 border-r font-bold">{f1(totalRow.totalInternational)}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900 font-bold">{f1(totalRow.totalPublications)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && reportData.length > 0 && (
        <CSVLink filename={"PublicationsReport_D.csv"} data={csvData}>
          <Button
            variant="success"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mt-4"
          >
            <span>Export CSV</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-3 3-3-3M12 12v9M5 20h14" />
            </svg>
          </Button>
        </CSVLink>
      )}
    </>
  );
}