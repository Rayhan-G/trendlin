// src/types/user.ts

export interface User {
  id: string
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  user_id: string
  bio: string | null
  website: string | null
  twitter: string | null
  github: string | null
  location: string | null
  occupation: string | null
  interests: string[]
  notification_preferences: NotificationPreferences
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  new_post_alerts: boolean
  comment_replies: boolean
  weekly_digest: boolean
}

export interface UserSession {
  user: User
  session_token: string
  expires_at: string
}

export interface AuthState {
  user: User | null
  session: UserSession | null
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  username?: string
  full_name?: string
}

export interface PasswordResetData {
  email: string
}

export interface PasswordUpdateData {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface ProfileUpdateData {
  full_name?: string
  username?: string
  bio?: string
  website?: string
  twitter?: string
  github?: string
  location?: string
  occupation?: string
  interests?: string[]
}

export type UserRole = 'admin' | 'editor' | 'author' | 'subscriber'

// Admin Session (separate from auth)
export interface AdminSession {
  token: string
  expiresAt: number
  isLoggedIn: boolean
}

export interface AdminLoginData {
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  token?: string
  expiresIn?: number
  error?: string
}

// Permission types
export type Permission = 
  | 'view_posts'
  | 'create_posts'
  | 'edit_posts'
  | 'delete_posts'
  | 'publish_posts'
  | 'view_analytics'
  | 'manage_users'
  | 'manage_affiliates'
  | 'manage_ads'
  | 'manage_settings'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_posts', 'create_posts', 'edit_posts', 'delete_posts', 'publish_posts',
    'view_analytics', 'manage_users', 'manage_affiliates', 'manage_ads', 'manage_settings'
  ],
  editor: [
    'view_posts', 'create_posts', 'edit_posts', 'publish_posts', 'view_analytics',
    'manage_affiliates', 'manage_ads'
  ],
  author: [
    'view_posts', 'create_posts', 'edit_posts'
  ],
  subscriber: [
    'view_posts'
  ]
}

// Helper function to check if user has permission
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false
  const permissions = ROLE_PERMISSIONS[user.role] || []
  return permissions.includes(permission)
}

// Helper function to check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin'
}

// Helper function to check if user is editor or above
export const isEditor = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'editor'
}