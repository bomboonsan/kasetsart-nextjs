// ใช้ path alias (@/) แทน relative path
import Sidebar from '@/components/layout/Sidebar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop layout with sidebar */}
      <div className="lg:flex">
        <Sidebar />
        <div className="flex-1 lg:ml-0">
          {/* Mobile/Tablet: เพิ่ม padding-top เพื่อหลีกเลี่ยง fixed header */}
          <main className="p-4 sm:p-6 lg:p-6 max-w-screen-2xl mx-auto lg:pt-6 pt-20">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
