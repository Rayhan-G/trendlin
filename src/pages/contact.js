// src/pages/contact.js (Multi-provider support)

import { useState } from 'react'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const email = "contact@trendlin.com"
  const subject = "Inquiry from Trendlin"
  const body = "Hello,\n\nI have a question about..."

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const yahooUrl = `https://mail.yahoo.com/d/compose?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact</h1>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white"></div>
      </div>

      <div className="space-y-8">
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          Have a trend to share? Found something interesting?<br />
          Just want to say hello? We'd love to hear from you.
        </p>

        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <a 
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Gmail
            </a>
            <a 
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Outlook
            </a>
            <a 
              href={yahooUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Yahoo
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <code className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
              {email}
            </code>
            <button
              onClick={copyEmail}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm hover:bg-gray-300 transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-3">
            Click any provider to compose an email, or copy our address.
          </p>
        </div>
      </div>
    </div>
  )
}