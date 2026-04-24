import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailExists, setEmailExists] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setEmailExists(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailExists(data.exists)
        setMessage(data.message)
        if (data.exists) {
          setEmail('')
        }
      } else if (response.status === 404) {
        setEmailExists(false)
        setError(data.error)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {message && (
          <div className={`rounded-md p-4 ${emailExists === true ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div className={`text-sm ${emailExists === true ? 'text-green-700' : 'text-blue-700'}`}>
              {message}
            </div>
            {process.env.NODE_ENV === 'development' && emailExists === true && (
              <div className="mt-2 text-xs text-gray-500 break-all">
                Check your terminal console for the reset link
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
            {error === 'No account found with this email address' && (
              <div className="mt-2 text-sm">
                <Link href="/signup" className="text-purple-600 hover:text-purple-500 font-medium">
                  Create a new account →
                </Link>
              </div>
            )}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                error && error.includes('No account found') 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm`}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <div>
            <Link href="/login" className="text-sm text-purple-600 hover:text-purple-500">
              Back to sign in
            </Link>
          </div>
          <div>
            <Link href="/signup" className="text-xs text-gray-500 hover:text-gray-700">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}