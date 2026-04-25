// src/pages/terms.js

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
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Use</h1>
        <div className="w-10 h-0.5 bg-gray-900 dark:bg-white mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {currentDate}</p>
      </div>

      <div className="space-y-8">
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed pb-4 border-b border-gray-200 dark:border-gray-800">
          By using this site, you agree to these terms. 
          We're a trend discovery platform — we find and share what's happening around the world 
          so you can stay up to date. We are not original researchers, but we cite experts when available.
        </p>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we do</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We research trends by gathering information from publicly available online sources. 
            We then present this information in an easy-to-read format. When we reference insights 
            from qualified professionals, experts, or researchers, we attribute them by name and/or 
            provide links to their original work.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Our approach to sources</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Whenever possible, we provide source attribution through links or by naming the 
            original source — including qualified professionals, experts, researchers, and 
            industry specialists. We believe in giving credit where it's due. If you believe we've 
            missed a source or need to update attribution, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">What we are</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We are trend aggregators and curators. We gather, organize, and share trends from 
            across the internet. We may reference or quote qualified professionals, experts, 
            and researchers in our content — always with proper attribution. Our role is to 
            help you discover what experts and the broader online community are saying.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Expert opinions & attribution</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            When we share insights from qualified individuals (such as financial analysts, 
            medical professionals, researchers, or industry experts), we clearly attribute 
            these opinions to the original source. We do not claim their expertise as our own. 
            The views and advice shared by these experts belong to them — we simply help 
            surface their insights to our audience.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">No endorsement or replacement</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Referencing qualified professionals does not constitute an endorsement by us 
            of their specific advice or opinions. Additionally, our curated content is not 
            a replacement for direct, personalized advice from a qualified professional who 
            understands your specific situation. Always consult appropriate experts for 
            personalized guidance.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">How we write</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We do not write content from our own original research. Instead, we research online, 
            analyze public trends, and present what we find — including expert opinions when 
            available — in an accessible format. Our writing is a curation of existing information 
            and expert insights, properly attributed to original sources.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Content disclaimer</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Our content is for informational and trend-discovery purposes. 
            While we strive to accurately represent the information we find online, 
            trends change rapidly and information may become outdated. We do our best 
            to verify sources, but we encourage you to check original sources directly 
            before making important decisions.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Use of our site</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            You're welcome to read, share, and link to our content. Please don't scrape, 
            copy entire articles verbatim, or misuse our site. If you share our content, 
            we appreciate attribution. Be respectful of our work in curating these trends.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Intellectual property</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The trends themselves belong to the world. Expert opinions belong to the experts 
            who shared them (we claim no ownership). Our specific writing, curation, 
            and presentation belong to us. You may share excerpts with credit. 
            Don't claim our curated content as your own original work.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Limitation of liability</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We are not responsible for decisions you make based on our content or the 
            expert opinions we reference. Trends change, situations vary, and information 
            may become outdated. We do our best to share accurate information, but you 
            should always do your own research and verify information from original sources 
            before making decisions.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Accuracy of information</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We strive to be accurate in our curation and attribution. However, we are not 
            fact-checkers or journalists. We rely on online sources that may contain errors. 
            If you spot something incorrect or need source attribution updated, please let 
            us know and we'll review and update as needed.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Changes to these terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If these terms change, we'll update this page. Our philosophy stays the same: 
            transparent, straightforward, and focused on helping you discover trends.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Contact us</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If you have questions about these terms, want to request source attribution, 
            or believe something needs correction, please reach out.
          </p>
        </section>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Questions about these terms or source attribution?</p>
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