"use client"
// import { SelectField } from '@/components/ui'
import FieldSelect from "@/components/myui/FieldSelect";
export default function ReportHeader({ selectedReport, onChange }) {
  const reportOptions = [
    { 
  value: 'table-a', 
      label: 'Table 8-1 Part A: Intellectual Contribution (IC) Strategies for SA and PA (2019-2023)' 
    },
    { 
  value: 'table-b', 
      label: 'Table 8-1 Part B: Alignment with Mission ' 
    },
    { 
  value: 'table-c', 
      label: 'Table 8-1 Part C: Quality of Intellectual Contribution (Multiple counts)' 
    },
    { 
  value: 'table-d', 
      label: 'Table 8-1 Part C: Quality of Intellectual Contribution (Single count)' 
    },
    { 
  value: 'table-e', 
      label: 'รายงานข้อมูลการตีพิมพ์ผลงานวิจัยในวารสารวิชาการระดับชาติและนานาชาติ' 
    },
    {
  value: 'table-f',
      label: 'รายงานนำเสนอผลงานทางวิชาการระดับชาติและนานาชาติ'
    }
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทรายงาน
        </label>
        <FieldSelect
          value={selectedReport || 'table-a'}
          onChange={onChange}
          options={reportOptions}
          className="max-w-2xl"
        />
      </div>
    </div>
  )
}
