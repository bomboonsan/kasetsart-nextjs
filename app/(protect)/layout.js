// ใช้ path alias (@/) แทน relative path
import Sidebar from '@/components/layout/Sidebar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1">
        <main className="p-6 max-w-screen-2xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
