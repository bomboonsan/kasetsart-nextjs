"use client";

import dynamic from 'next/dynamic';
import { useRef, useTransition, useEffect } from 'react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Presentational-only version: expects fully shaped `data` [{ category, personnel, percentage }]
export default function PersonnelChart({
  title,
  subtitle,
  data = [],
  colors = ['#6366f1', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444'],
  height = 200,
  // presentational department props
  departments = [],
  selectedDeptId = 'all',
  onDeptChange = null,
  // optional prop if parent already provides a friendly label
  selectedDeptLabel,
}) {
  const debounceRef = useRef(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])
  const displayData = Array.isArray(data) ? data : [];

  // Create series data for stacked bar
  const seriesData = displayData.map(item => ({ name: item.category, data: [item.percentage] }));

  const options = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      stacked: true,
      stackType: '100%',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: colors,
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50px',
        borderRadius: 8
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        if (val < 8) return '' // Hide labels for small segments
        return val.toFixed(1) + '%'
      },
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontWeight: 600
      }
    },
    xaxis: {
      categories: ['Personnel Distribution'],
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    grid: {
      show: false
    },
    legend: {
      show: false
  },
    tooltip: {
      enabled: true,
      theme: 'light',
      y: {
        formatter: function (val, opts) {
          const i = opts.seriesIndex;
          const p = displayData[i];
          return `${p?.personnel || 0} คน (${val.toFixed(1)}%)`;
        }
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 border border-gray-50 rounded-lg shadow-sm bg-white h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h2 className='text-base sm:text-lg text-gray-900 font-medium'>{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}{selectedDeptLabel ? ` (${selectedDeptLabel})` : ''}</p>}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">เลือกภาควิชา</label>
          <select
            value={selectedDeptId}
            onChange={(e) => {
              const v = e.target.value
              startTransition(() => {
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(() => {
                  if (typeof onDeptChange === 'function') onDeptChange(v)
                }, 250)
              })
            }}
            className="px-2 sm:px-3 py-1 bg-white border border-gray-200 text-xs sm:text-sm rounded-md text-gray-900"
            disabled={!Array.isArray(departments) || departments.length === 0}
          >
            <option value="all">ทั้งหมด</option>
            {Array.isArray(departments) && departments.map((dept) => {
              const id = dept?.id ?? dept?.documentId ?? (dept?.attributes && (dept.attributes.id ?? dept.attributes.documentId)) ?? null
              const title = dept?.title ?? (dept?.attributes && dept.attributes.title) ?? String(dept)
              const value = id != null ? String(id) : (dept?.documentId ? String(dept.documentId) : null)
              if (!value) return null
              return (
                <option key={value} value={value}>{title}</option>
              )
            })}
          </select>
          {isPending && (
            <div className="ml-2 flex items-center text-xs text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
              <span className="hidden sm:inline">กำลังอัปเดต...</span>
            </div>
          )}
        </div>
      </div>
      {displayData.length === 0 ? (
        <div className="flex justify-center items-center h-32 text-sm text-gray-500">ไม่มีข้อมูล</div>
      ) : (
        <>
            {/* Custom legend with percentages - responsive grid */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
            {displayData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs text-gray-600">{item.category}</span>
                <span className="text-xs font-medium text-gray-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
          
          <Chart
            options={options}
            series={seriesData}
            type="bar"
            height={height}
          />

          {/* Personnel details table */}
          <div className="mt-6 space-y-2">
            {displayData.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">{item.category}</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">{item.personnel} คน</span>
                  <span className="text-xs sm:text-sm text-gray-500">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
