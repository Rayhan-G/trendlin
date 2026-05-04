// pages/auth/callback.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Callback error:', error)
        router.push('/auth/error?message=Verification failed')
      } else {
        router.push('/dashboard')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Verifying your email...</p>
    </div>
  )
}