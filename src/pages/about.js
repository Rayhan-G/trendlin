// src/pages/about.js (COMPLETE FILE - NO CHANGES NEEDED)

import Link from 'next/link'

export default function AboutUs() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">About</h1>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white"></div>
      </div>

      <div className="space-y-8">
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          We track what's trending across technology, markets, wellness, and culture — 
          so you don't have to.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we do</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Every day, we scan emerging trends — from AI breakthroughs to market shifts, 
              wellness waves to global events. We filter the noise and share what matters.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Who it's for</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Curious minds. Professionals. Students. Anyone who wants to stay informed 
              about what's happening around the world.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we believe</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Information should be free. No paywalls. No data collection. No sponsored content. 
              Just honest trends and insights.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Our approach</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Simple. Direct. Useful. We don't overcomplicate things. We share what's trending 
              and why it might matter to you.
            </p>
          </div>
        </div>

        <div className="py-6 border-y border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-200 text-center text-lg">
            We're a small team based on a simple idea: staying updated shouldn't be hard. 
            No investors. No agenda. Just a genuine interest in what's next.
          </p>
        </div>

        <div className="text-center pt-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Questions or feedback?</p>
          <Link 
            href="/contact" 
            className="inline-block px-5 py-2 border border-gray-900 dark:border-white text-gray-900 dark:text-white rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-200"
          >
            Contact us →
          </Link>
        </div>
      </div>
    </div>
  )
}