// src/services/authService.js
import { supabase } from '@/lib/supabase'

export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  },

  // Sign in with OAuth provider
  async signInWithProvider(provider, redirectTo = null) {
    try {
      const options = {}
      if (redirectTo) {
        options.redirectTo = redirectTo
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return { success: false, error: error.message }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { success: true, session: data.session }
    } catch (error) {
      console.error('Get session error:', error)
      return { success: false, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Get user error:', error)
      return { success: false, error: error.message }
    }
  },

  // Update user email
  async updateEmail(newEmail) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update email error:', error)
      return { success: false, error: error.message }
    }
  },

  // Update user password
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message }
    }
  },

  // Update user metadata
  async updateUserMetadata(metadata) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Update metadata error:', error)
      return { success: false, error: error.message }
    }
  },

  // Reset password (send reset email)
  async resetPassword(email, redirectTo = null) {
    try {
      const options = {}
      if (redirectTo) {
        options.redirectTo = redirectTo
      }
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, options)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.message }
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const { success, session } = await this.getSession()
    return success && !!session
  },

  // Get user role (admin check)
  async isAdmin() {
    const { success, user } = await this.getCurrentUser()
    if (!success || !user) return false
    
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
    return adminEmails.includes(user.email)
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default authService