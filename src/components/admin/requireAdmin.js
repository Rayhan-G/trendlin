// components/admin/requireAdmin.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function requireAdmin(Component) {
  return function ProtectedAdminPage(props) {
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
      const verifyAdmin = async () => {
        try {
          const response = await fetch('/api/admin/verify')
          
          if (response.ok) {
            setIsAuthorized(true)
          } else {
            router.replace('/admin/login')
          }
        } catch (error) {
          router.replace('/admin/login')
        } finally {
          setIsLoading(false)
        }
      }

      verifyAdmin()
    }, [router])

    if (isLoading) {
      return (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <style jsx>{`
            .admin-loading {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f8fafc;
            }
            .loading-spinner {
              width: 48px;
              height: 48px;
              border: 3px solid #e2e8f0;
              border-top-color: #8b5cf6;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )
    }

    if (!isAuthorized) {
      return null
    }

    return <Component {...props} />
  }
}