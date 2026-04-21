// src/contexts/AdminContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const AdminContext = createContext({})

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminSession, setAdminSession] = useState(null)
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminStats, setAdminStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalRevenue: 0,
    affiliateClicks: 0
  })

  // Check admin session on mount
  useEffect(() => {
    const checkAdminSession = () => {
      const sessionToken = localStorage.getItem('admin_session_token')
      const sessionExpiry = localStorage.getItem('admin_session_expiry')
      
      if (sessionToken && sessionExpiry) {
        const now = Date.now()
        if (now < parseInt(sessionExpiry)) {
          setIsAdminLoggedIn(true)
          setAdminSession({ token: sessionToken, expiresAt: parseInt(sessionExpiry) })
        } else {
          localStorage.removeItem('admin_session_token')
          localStorage.removeItem('admin_session_expiry')
          setIsAdminLoggedIn(false)
          setAdminSession(null)
        }
      }
      setAdminLoading(false)
    }
    
    checkAdminSession()
  }, [])

  const adminLogin = useCallback(async (password) => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (data.success) {
        const expiry = Date.now() + (24 * 60 * 60 * 1000)
        localStorage.setItem('admin_session_token', data.token)
        localStorage.setItem('admin_session_expiry', expiry.toString())
        setIsAdminLoggedIn(true)
        setAdminSession({ token: data.token, expiresAt: expiry })
        return { success: true }
      } else {
        return { success: false, error: 'Invalid password' }
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  const adminLogout = useCallback(() => {
    localStorage.removeItem('admin_session_token')
    localStorage.removeItem('admin_session_expiry')
    setIsAdminLoggedIn(false)
    setAdminSession(null)
  }, [])

  const fetchAdminStats = useCallback(async () => {
    try {
      // Fetch posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
      
      // Fetch total views
      const { data: viewsData } = await supabase
        .from('posts')
        .select('views')
      const totalViews = viewsData?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
      
      // Fetch affiliate stats
      const { data: affiliateData } = await supabase
        .from('affiliate_links')
        .select('clicks, revenue')
      const affiliateClicks = affiliateData?.reduce((sum, l) => sum + (l.clicks || 0), 0) || 0
      const totalRevenue = affiliateData?.reduce((sum, l) => sum + (l.revenue || 0), 0) || 0
      
      setAdminStats({
        totalPosts: postsCount || 0,
        totalViews,
        totalRevenue,
        affiliateClicks
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }, [])

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminStats()
    }
  }, [isAdminLoggedIn, fetchAdminStats])

  const value = {
    isAdminLoggedIn,
    adminSession,
    adminLoading,
    adminStats,
    adminLogin,
    adminLogout,
    fetchAdminStats
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export default AdminContext