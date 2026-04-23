// pages/settings.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.authenticated) router.push('/')
      else setUser(data.user)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!user) return null

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>
      <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: 24 }}><label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label><input type="email" value={user.email} disabled style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, background: '#f5f5f5' }} /></div>
        <div style={{ marginBottom: 24 }}><label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Account Type</label><input value="Free Account" disabled style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, background: '#f5f5f5' }} /></div>
        <div style={{ marginBottom: 24 }}><label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Member Since</label><input value={new Date(user.created_at).toLocaleDateString()} disabled style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, background: '#f5f5f5' }} /></div>
        <Link href="/newsletter/manage" style={{ display: 'inline-block', padding: '10px 20px', background: '#06b6d4', color: 'white', textDecoration: 'none', borderRadius: 8 }}>Manage Newsletter Preferences →</Link>
      </div>
    </div>
  )
}