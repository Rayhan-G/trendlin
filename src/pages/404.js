// src/pages/404.js (COMPLETE FILE - NO CHANGES NEEDED)

import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col p-5 text-center">
      <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200"
      >
        Go back home
      </Link>
    </div>
  )
}