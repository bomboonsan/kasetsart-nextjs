'use client'

export default function ScholarshipTableAll({ title, subtitle, data = [] }) {
  return (
    <div className="p-6 border border-gray-50 rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className='text-lg text-gray-900 font-medium'>{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-sm font-medium text-gray-700">IC Type Tool</th>
              <th className="text-right py-3 text-sm font-medium text-gray-700">Impact</th>
              <th className="text-right py-3 text-sm font-medium text-gray-700">SDG</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center space-x-3">
                    {item.color && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.type}</div>
                      {item.percentage && (
                        <div className="text-xs text-gray-500">{item.percentage}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-right py-3">
                  <span className="text-sm text-gray-900">{item.impact}</span>
                </td>
                <td className="text-right py-3">
                  <span className="text-sm text-gray-900">{item.sdg}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
