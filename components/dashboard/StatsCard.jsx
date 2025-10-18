'use client'
import Link from "next/link"

export default function StatsCard({ title, stats, bgColor = 'bg-white' }) {
  return (
    <div className={`p-4 sm:p-6 border border-gray-50 rounded-lg shadow-sm space-y-4 ${bgColor}`}>
      <h2 className='text-base sm:text-lg text-gray-900 font-medium'>{title}</h2>
      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 5 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Link href={stat.href} key={index} className="flex items-start space-x-3">
          <div key={index} className="flex items-start space-x-3">
            <div className="flex items-center justify-center size-12 rounded bg-gray-100 flex-shrink-0">
              <stat.icon />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 break-words">{stat.label}</div>
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
