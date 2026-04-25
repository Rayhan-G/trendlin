import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AuthModal from './AuthModal'
import UserMenu from './UserMenu'

export default function Navigation() {
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    // Optional: Refresh the page to update all components
    router.reload()
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-purple-600">
              MyApp
            </Link>
            
            <div className="flex items-center gap-4">
              {!loading && (
                <>
                  {user ? (
                    <UserMenu user={user} onLogout={handleLogout} />
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Sign In
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  )
}