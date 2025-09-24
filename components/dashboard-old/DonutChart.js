'use client'

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function DonutChart({ 
  title, 
  subtitle,
  data = [],
  colors = ['#6366f1', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444'],
  height = 300 
}) {
  // Normalize input so it can accept either
  // - [{ label, value }]
  // - [{ category, percentage }]
  const normalized = (Array.isArray(data) ? data : []).map((item) => {
    const label = item.label ?? item.category ?? ''
    const rawVal = item.value ?? item.percentage ?? 0
    const value = typeof rawVal === 'string' ? parseFloat(rawVal) : (rawVal || 0)
    return { label, value: isNaN(value) ? 0 : value }
  })
  const series = normalized.map(item => item.value)
  const labels = normalized.map(item => item.label)

  const options = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
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
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 600,
              color: '#111827',
              formatter: function (val) {
                return val + '%'
              }
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 400,
              color: '#6b7280',
              formatter: function (w) {
                return '100%'
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      fontSize: '12px',
      fontWeight: 400,
      markers: {
        width: 8,
        height: 8,
        strokeWidth: 0,
        radius: 2
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4
      }
    },
    stroke: {
      width: 0
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function (val, opts) {
          return val + '%'
        }
      }
    }
  }

  return (
    <div className="p-6 border border-gray-50 rounded-lg shadow-sm bg-white">
      <div className="mb-4">
        <h2 className='text-lg text-gray-900 font-medium'>{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <Chart
        options={options}
        series={series}
        type="donut"
        height={height}
      />
    </div>
  )
}
