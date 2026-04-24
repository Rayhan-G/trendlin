// src/pages/_app.js
import '../styles/globals.css'
import { useRouter } from 'next/router'
import FrontendLayout from '../components/frontend/Layout'
import AdminLayout from '../components/admin/AdminLayout'
import { useEffect, useState } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Check if we're on an admin page
  const isAdminRoute = router.pathname.startsWith('/admin')
  const isAuthPage = router.pathname === '/admin/login'
  
  // Handle dark mode
  useEffect(() => {
    setMounted(true)
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
  if (!mounted) {
    return null
  }
  
  // Admin routes use AdminLayout, auth page uses no layout, frontend uses FrontendLayout
  if (isAdminRoute && !isAuthPage) {
    return (
      <ErrorBoundary>
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      </ErrorBoundary>
    )
  }
  
  if (isAdminRoute && isAuthPage) {
    return (
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    )
  }
  
  // Frontend routes
  return (
    <ErrorBoundary>
      <FrontendLayout>
        <Component {...pageProps} />
      </FrontendLayout>
    </ErrorBoundary>
  )
}