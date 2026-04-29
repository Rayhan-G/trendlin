// pages/_app.js
import '../styles/globals.css'
import { useRouter } from 'next/router'
import FrontendLayout from '../components/frontend/Layout'
import { useEffect, useState } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import Toast from '../components/ui/Toast'
import { SubscriptionProvider } from '../contexts/SubscriptionContext'

// IMPORTANT: Add this for styled-jsx to work
import 'styled-jsx/style'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  const isAdminRoute = router.pathname.startsWith('/admin')
  
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])
  
  if (!mounted) return null
  
  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <SubscriptionProvider>
          <Component {...pageProps} />
          <Toast />
        </SubscriptionProvider>
      </ErrorBoundary>
    )
  }
  
  return (
    <ErrorBoundary>
      <SubscriptionProvider>
        <FrontendLayout>
          <Component {...pageProps} />
          <Toast />
        </FrontendLayout>
      </SubscriptionProvider>
    </ErrorBoundary>
  )
}