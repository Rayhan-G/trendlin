// src/components/auth/ResetPassword.jsx (ALL DEVICES COMPATIBLE)

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!token) {
      setValidToken(false)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <div className="text-center text-red-600 text-sm sm:text-base break-words">
          Invalid or missing reset token. Please request a new password reset.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Reset Your Password</h2>
      
      {message && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-100 text-green-700 rounded text-sm sm:text-base break-words">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded text-sm sm:text-base break-words">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3 sm:mb-4">
          <label className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            disabled={loading}
            placeholder={!isMobile ? "Min 8 characters, 1 uppercase, 1 number" : "Min 8 chars"}
          />
        </div>
        
        <div className="mb-3 sm:mb-4">
          <label className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 sm:py-2.5 rounded hover:bg-purple-700 transition disabled:opacity-50 active:scale-98 text-sm sm:text-base"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}