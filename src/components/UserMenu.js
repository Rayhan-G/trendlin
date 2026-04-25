import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  // Check if user is admin (supports both role and is_admin flags)
  const isAdmin = user.role === 'admin' || user.is_admin === true

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    if (onLogout) onLogout()
    router.push('/')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-purple-600">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-sm text-gray-700 hidden md:block">
          {user.email?.split('@')[0]}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {isAdmin ? 'Administrator' : 'Member'}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              👤 Your Profile
            </Link>
            
            {/* ONLY SHOW FOR ADMIN USERS */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 font-medium"
                onClick={() => setIsOpen(false)}
              >
                📊 Admin Dashboard
              </Link>
            )}
            
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              ⚙️ Settings
            </Link>
            
            <hr className="my-1" />
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🚪 Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}