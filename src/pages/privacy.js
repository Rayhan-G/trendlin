// src/pages/privacy.js (COMPLETE FILE - NO CHANGES NEEDED)

import Link from 'next/link'

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy</h1>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {currentDate}</p>
      </div>

      <div className="space-y-8">
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed pb-4 border-b border-gray-200 dark:border-gray-800">
          We're a trend and news platform. Our only goal is to keep you informed.
          We don't collect your data. We don't track you. We don't sell anything.
        </p>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we collect</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Almost nothing. Just basic analytics to understand which articles are popular, 
            and your dark/light mode preference. That's it.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we don't collect</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your name, email address, phone number, location, or any personal identifiable information. 
            Unless you voluntarily contact us, we have no idea who you are.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Cookies</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We use minimal cookies — just enough to remember your dark/light mode preference. 
            No tracking cookies. No advertising cookies. Nothing that follows you around.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Third parties</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We don't sell your data. We don't share your data. We don't have data to share. 
            Our hosting provider serves this page — that's the extent of it.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Your rights</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Since we don't collect personal data, there's nothing to delete or export. 
            If you have questions, reach out anytime.
          </p>
        </section>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Questions about privacy?</p>
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