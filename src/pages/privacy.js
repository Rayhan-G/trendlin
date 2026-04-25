// src/pages/privacy.js

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
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {currentDate}</p>
      </div>

      <div className="space-y-8">
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed pb-4 border-b border-gray-200 dark:border-gray-800">
          We're a trend and news platform. Our only goal is to keep you informed.
          We respect your privacy and are transparent about what information we collect.
        </p>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Information we collect</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">For all visitors:</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We collect basic analytics to understand which articles are popular, 
                and your dark/light mode preference. We don't track you across the web.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">For newsletter subscribers:</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                When you subscribe to our newsletter, we collect your email address and category preferences 
                (which topics you're interested in). This allows us to send you relevant updates. 
                You can unsubscribe at any time using the link in every email.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">For registered account users:</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you create an account, we collect your email address and a secure password 
                (encrypted, never stored in plain text). Your account allows you to bookmark 
                posts and manage your newsletter preferences.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400 leading-relaxed">
            <li>Send you newsletter updates based on your selected categories</li>
            <li>Manage your account and saved bookmarks</li>
            <li>Improve our content based on anonymous analytics</li>
            <li>Respond to your inquiries when you contact us</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we don't collect</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We don't collect your name, phone number, physical address, financial information, 
            or precise location. We don't track your activity outside our website.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Cookies</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We use minimal cookies — just enough to remember your dark/light mode preference 
            and keep you logged into your account if you choose to stay signed in. 
            No tracking cookies. No advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Data storage & security</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your email and account information is stored securely in our database. 
            Passwords are encrypted. We use industry-standard security measures to protect your data.
            Our hosting provider follows strict security protocols.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Third parties</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We don't sell, rent, or share your personal information with third parties for marketing purposes.
            Our hosting provider and email service provider have access only as necessary to deliver 
            our services — they are contractually bound to protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Your rights</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
            Depending on your location (e.g., EU, UK, California), you may have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400 leading-relaxed">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (account deletion)</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
            To exercise these rights, contact us using the link below.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Account deletion</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If you have an account and wish to delete it, you can do so from your account settings 
            or by contacting us. We'll remove your personal information from our active databases 
            within 30 days (backups may retain data for up to 90 days for technical reasons).
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Children's privacy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Our website is not directed to children under 13. We don't knowingly collect 
            personal information from children. If you believe a child has provided us with 
            personal information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Changes to this policy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We may update this privacy policy from time to time. We'll notify you of any 
            material changes by posting the new policy on this page with an updated date.
          </p>
        </section>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Questions about privacy or want to delete your data?</p>
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