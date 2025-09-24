"use client";

import { useState, useEffect, useRef, useTransition } from "react";

const TYPE_TABS = [
  { key: "icTypes", label: "IC Type" },
  { key: "impacts", label: "Impact" },
  { key: "sdgs", label: "SDG" },
];

export default function ScholarshipTable({
  title,
  subtitle,
  researchStats = {},
  // presentational department props
  departments = [],
  selectedDeptId = 'all',
  onDeptChange = null,
}) {
  const [activeType, setActiveType] = useState("icTypes");
  const [selectedItems, setSelectedItems] = useState([]);
  const activeData = researchStats?.[activeType] || [];
  const debounceRef = useRef(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Default: mark all items checked whenever activeData changes
  useEffect(() => {
    if (Array.isArray(activeData) && activeData.length) setSelectedItems(activeData.map((_, i) => i));
    else setSelectedItems([]);
  }, [activeData]);

  // นับรวม
  const counts = {
    icTypes: (researchStats?.icTypes || []).reduce((s, i) => s + (i.count || 0), 0),
    impacts: (researchStats?.impacts || []).reduce((s, i) => s + (i.count || 0), 0),
    sdgs: (researchStats?.sdgs || []).reduce((s, i) => s + (i.count || 0), 0),
  };

  const totalCount = counts[activeType] || 1;

  const selectedSum = (selectedItems || []).reduce((sum, idx) => {
    const item = activeData[idx];
    return sum + (item && item.count ? item.count : 0);
  }, 0);

  const handleCheckboxChange = (e) => {
    const value = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedItems((prev) => {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      });
    } else {
      setSelectedItems((prev) => prev.filter((i) => i !== value));
    }
  };

  console.log('departments render', departments);

  return (
    <div className="p-6 border border-gray-50 rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg text-gray-900 font-medium">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div />
      </div>

      <div className="overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-2 border-b mb-4">
          {TYPE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${activeType === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
            >
              {t.label} {counts[t.key] ? `(${counts[t.key]})` : "(0)"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mb-0 px-4">
          {/* Checkbox toggle check all / unchecked all */}
          <div className="flex items-center gap-3">
            <input
              id="select-all-toggle"
              type="checkbox"
              ref={(el) => {
                if (!el) return;
                el.indeterminate =
                  selectedItems.length > 0 &&
                  selectedItems.length < (activeData || []).length;
              }}
              checked={
                Array.isArray(activeData) &&
                activeData.length > 0 &&
                selectedItems.length === activeData.length
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems(
                    Array.isArray(activeData)
                      ? activeData.map((_, i) => i)
                      : [],
                  );
                } else {
                  setSelectedItems([]);
                }
              }}
              className="w-3 h-3"
            />
            <label
              htmlFor="select-all-toggle"
              className="text-sm text-gray-600 font-bold"
            >
              เลือกทั้งหมด
            </label>
          </div>
          <div className="ml-6 flex items-center gap-2">
            <label className="text-xs text-gray-500">เลือกภาควิชา</label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                const v = e.target.value === '' ? 'all' : e.target.value
                startTransition(() => {
                  if (debounceRef.current) clearTimeout(debounceRef.current)
                  debounceRef.current = setTimeout(() => {
                    if (typeof onDeptChange === 'function') onDeptChange(v)
                  }, 250)
                })
              }}
              className="px-3 py-1 bg-white border border-gray-200 text-sm rounded-md text-gray-900"
              disabled={!Array.isArray(departments) || departments.length === 0}
            >
              <option value="all">ทั้งหมด</option>
              {Array.isArray(departments) && departments.map((dept) => {
                const id = dept?.id ?? dept?.documentId ?? (dept?.attributes && (dept.attributes.id ?? dept.attributes.documentId)) ?? null
                const title = dept?.title ?? (dept?.attributes && dept.attributes.title) ?? String(dept)
                const value = id != null ? String(id) : (dept?.documentId ? String(dept.documentId) : null)
                if (!value) return null
                return <option key={value} value={value}>{title}</option>
              })}
            </select>
            {isPending && (
              <div className="ml-2 flex items-center text-xs text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
                <span>กำลังอัปเดต...</span>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-b-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  ประเภท
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  จำนวน
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  เปอร์เซ็นต์
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">
                  แสดงผล
                </th>
              </tr>
            </thead>
            <tbody>
              {activeData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                activeData.map((item, index) => {
                  const count = item.count || 0;
                  const percentage =
                    totalCount > 0
                      ? ((count / totalCount) * 100).toFixed(1)
                      : "0.0";

                  const colors = {
                    0: "#22c55e", // green
                    1: "#6366f1", // indigo
                    2: "#ef4444", // red
                    3: "#f59e0b", // amber
                    4: "#8b5cf6", // violet
                  };
                  const color = colors[index % 5] || "#6b7280";

                  return (
                    <tr
                      key={item.name || index}
                      className={`border-b border-b-gray-200 hover:bg-gray-50`}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={index}
                            checked={selectedItems.includes(index)}
                            onChange={handleCheckboxChange}
                          />
                          {item.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {(count || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-600">
                          {percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: color,
                              }}
                            ></div>
                          </div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {activeData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-t-gray-300 px-4">
            <div className="text-sm text-gray-600">
              รวม{" "}
              {activeType === "icTypes"
                ? "IC Types"
                : activeType === "impacts"
                  ? "Impact"
                  : "SDG"}
              :
              <span className="font-semibold text-gray-900 ml-1">
                {selectedSum.toLocaleString()} ผลงาน
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
