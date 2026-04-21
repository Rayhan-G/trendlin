// src/pages/_error.js (COMPLETE FILE - ENHANCED)

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Custom error page for Next.js Pages Router
 * Handles 404 (Not Found) and other server/client errors
 * 
 * @param {Object} props - Component props
 * @param {number} props.statusCode - HTTP status code (404, 500, etc.)
 * @param {string} props.errorMessage - Optional custom error message
 */
function Error({ statusCode, errorMessage }) {
  // Log error to console in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Error Page] Status: ${statusCode}, Message: ${errorMessage || getDefaultMessage(statusCode)}`)
    }
  }, [statusCode, errorMessage])

  const getDefaultMessage = (code) => {
    switch (code) {
      case 400:
        return 'Bad request. Please check your input and try again.'
      case 401:
        return 'You are not authorized to view this page. Please log in.'
      case 403:
        return 'Access forbidden. You don\'t have permission to view this page.'
      case 404:
        return 'The page you are looking for does not exist or has been moved.'
      case 500:
        return 'An unexpected server error occurred. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please check back soon.'
      default:
        return 'An unexpected error occurred.'
    }
  }

  const getTitle = (code) => {
    switch (code) {
      case 404:
        return 'Page Not Found'
      case 401:
        return 'Unauthorized'
      case 403:
        return 'Forbidden'
      default:
        return 'Something Went Wrong'
    }
  }

  const displayMessage = errorMessage || getDefaultMessage(statusCode)
  const displayTitle = getTitle(statusCode)

  return (
    <div className="min-h-screen flex items-center justify-center flex-col px-5 text-center bg-gradient-to-br from-gray-50 to-white">
      {/* Status Code */}
      <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent m-0">
        {statusCode || '500'}
      </h1>
      
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mt-4 mb-2">
        {displayTitle}
      </h2>
      
      {/* Message */}
      <p className="text-gray-500 max-w-md mb-6">
        {displayMessage}
      </p>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all cursor-pointer"
        >
          ← Go Back
        </button>
        
        <Link href="/" passHref>
          <a className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">
            🏠 Back to Home
          </a>
        </Link>
      </div>
      
      {/* Help text */}
      {(statusCode === 500 || statusCode === 503) && (
        <p className="text-xs text-gray-400 mt-8">
          If this issue persists, please contact support@trendlin.com
        </p>
      )}
    </div>
  )
}

/**
 * Get initial props for the error page
 * Runs on both server and client
 */
Error.getInitialProps = ({ res, err, asPath }) => {
  // Determine status code
  let statusCode = 404 // Default to 404
  let errorMessage = null
  
  if (res) {
    // Server-side: use response status
    statusCode = res.statusCode
  } else if (err) {
    // Client-side: use error status or 500
    statusCode = err.statusCode || 500
    errorMessage = err.message
  }
  
  // Log to console for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Error.getInitialProps] Path: ${asPath}, Status: ${statusCode}`)
    if (err) {
      console.error('[Error.getInitialProps] Error details:', err)
    }
  }
  
  return { 
    statusCode,
    errorMessage: errorMessage || null
  }
}

export default Error