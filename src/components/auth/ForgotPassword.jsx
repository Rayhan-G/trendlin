// src/components/auth/ForgotPassword.jsx (ALL DEVICES COMPATIBLE)

import { useState, useEffect } from 'react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Check your email for reset instructions')
        setEmail('')
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Forgot Password?</h2>
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
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
          <label className="block text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}