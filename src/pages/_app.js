// pages/_app.js
import '../styles/globals.css'
import { useRouter } from 'next/router'
import FrontendLayout from '../components/frontend/Layout'
import { useEffect, useState } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import Toast from '../components/ui/Toast'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Check if we're on an admin page
  const isAdminRoute = router.pathname.startsWith('/admin')
  
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
  
  // Admin routes - no special layout wrapper
  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <Component {...pageProps} />
        <Toast />
      </ErrorBoundary>
    )
  }
  
  // Frontend routes
  return (
    <ErrorBoundary>
      <FrontendLayout>
        <Component {...pageProps} />
        <Toast />
      </FrontendLayout>
    </ErrorBoundary>
  )
}