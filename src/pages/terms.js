// src/pages/terms.js (COMPLETE FILE - NO CHANGES NEEDED)

import Link from 'next/link'

export default function TermsConditions() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms</h1>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {currentDate}</p>
      </div>

      <div className="space-y-8">
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed pb-4 border-b border-gray-200 dark:border-gray-800">
          By using this site, you agree to these simple terms. 
          We're here to share trends and news — nothing more.
        </p>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Content</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Our content is for informational purposes only. We share trends in technology, 
            markets, wellness, and culture. We're not financial advisors or medical professionals. 
            Use your own judgment.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Use of site</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            You're welcome to read, share, and link to our content. Please don't scrape, 
            copy entire articles, or misuse the site. Be respectful.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Intellectual property</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The trends belong to the world. Our writing and analysis belong to us. 
            Share with credit. Don't claim our work as your own.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Limitations</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We're not liable for decisions you make based on our content. 
            Trends change. Information evolves. Do your own research.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Changes</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If these terms change, we'll update this page. Our philosophy stays the same: 
            simple, transparent, and focused on trends.
          </p>
        </section>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Questions about these terms?</p>
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