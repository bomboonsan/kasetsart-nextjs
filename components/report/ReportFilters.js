import FieldSelect from "@/components/myui/FieldSelect";

export default function ReportFilters() {
  const yearOptions = [
    { value: '2026', label: 'โปรดระบุปีที่ (Datepicker)' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' },
    { value: '2017', label: '2017' },
    { value: '2016', label: '2016' },
  ]

  return (
    <>
    
    {/* <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ปีที่เริ่มต้น
          </label>
          <SelectField
            value="2023"
            options={yearOptions}
            placeholder="โปรดระบุปีที่ (Datepicker)"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ปีที่สิ้นสุด
          </label>
          <SelectField
            value="2023"
            options={yearOptions}
            placeholder="โปรดระบุปีที่ (Datepicker)"
          />
        </div>
        
        <div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Search
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <span className="font-medium">ผลลัพธ์ที่ค้นพบ:</span> <span className="font-semibold">5 results</span>
      </div>
    </div> */}
    </>
  )
}
