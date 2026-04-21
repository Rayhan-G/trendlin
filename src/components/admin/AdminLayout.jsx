// src/components/admin/AdminLayout.jsx
import AdminNavigation from './AdminNavigation'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      <main>{children}</main>
    </div>
  )
}