// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated
  } = useSupabase()

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user has admin role
    const checkAdminStatus = async () => {
      if (user) {
        const userEmail = user.email
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
        setIsAdmin(adminEmails.includes(userEmail))
      } else {
        setIsAdmin(false)
      }
    }
    checkAdminStatus()
  }, [user])

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext