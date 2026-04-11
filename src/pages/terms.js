import Layout from '@/components/Layout'
import Link from 'next/link'

export default function TermsConditions() {
  return (
    <Layout>
      <div className="container">
        <div className="hero">
          <h1>Terms</h1>
          <div className="hero-line"></div>
          <p className="date">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="content">
          <p className="lead">
            By using this site, you agree to these simple terms. 
            We're here to share trends and news — nothing more.
          </p>

          <div className="section">
            <h2>Content</h2>
            <p>
              Our content is for informational purposes only. We share trends in technology, 
              markets, wellness, and culture. We're not financial advisors or medical professionals. 
              Use your own judgment.
            </p>
          </div>

          <div className="section">
            <h2>Use of site</h2>
            <p>
              You're welcome to read, share, and link to our content. Please don't scrape, 
              copy entire articles, or misuse the site. Be respectful.
            </p>
          </div>

          <div className="section">
            <h2>Intellectual property</h2>
            <p>
              The trends belong to the world. Our writing and analysis belong to us. 
              Share with credit. Don't claim our work as your own.
            </p>
          </div>

          <div className="section">
            <h2>Limitations</h2>
            <p>
              We're not liable for decisions you make based on our content. 
              Trends change. Information evolves. Do your own research.
            </p>
          </div>

          <div className="section">
            <h2>Changes</h2>
            <p>
              If these terms change, we'll update this page. Our philosophy stays the same: 
              simple, transparent, and focused on trends.
            </p>
          </div>

          <div className="contact">
            <p>Questions about these terms?</p>
            <Link href="/contact" className="contact-link">Contact us →</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 4rem 1.5rem 6rem;
        }
        
        .hero {
          margin-bottom: 3rem;
        }
        
        h1 {
          font-size: 2.5rem;
          font-weight: 500;
          margin-bottom: 1rem;
          color: #111827;
          letter-spacing: -0.02em;
        }
        
        :global(body.dark) h1 {
          color: #ffffff;
        }
        
        .hero-line {
          width: 40px;
          height: 2px;
          background: #111827;
          margin-bottom: 1.5rem;
        }
        
        :global(body.dark) .hero-line {
          background: #ffffff;
        }
        
        .date {
          font-size: 0.8rem;
          color: #6b7280;
        }
        
        :global(body.dark) .date {
          color: #9ca3af;
        }
        
        .content {
          color: #4b5563;
        }
        
        :global(body.dark) .content {
          color: #9ca3af;
        }
        
        .lead {
          font-size: 1.2rem;
          line-height: 1.5;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
        }
        
        :global(body.dark) .lead {
          color: #e5e7eb;
          border-bottom-color: #1f2937;
        }
        
        .section {
          margin-bottom: 2.5rem;
        }
        
        h2 {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
          color: #6b7280;
        }
        
        :global(body.dark) h2 {
          color: #9ca3af;
        }
        
        p {
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }
        
        .contact {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        
        :global(body.dark) .contact {
          border-top-color: #1f2937;
        }
        
        .contact p {
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
          color: #6b7280;
        }
        
        .contact-link {
          display: inline-block;
          font-size: 1rem;
          color: #111827;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border: 1px solid #111827;
          transition: all 0.2s;
        }
        
        :global(body.dark) .contact-link {
          color: #ffffff;
          border-color: #ffffff;
        }
        
        .contact-link:hover {
          background: #111827;
          color: white;
        }
        
        :global(body.dark) .contact-link:hover {
          background: #ffffff;
          color: #111827;
        }
        
        /* Tablet */
        @media (max-width: 768px) {
          .container {
            padding: 3rem 1.5rem 5rem;
          }
          
          h1 {
            font-size: 2.2rem;
          }
          
          .lead {
            font-size: 1.1rem;
          }
        }
        
        /* Mobile */
        @media (max-width: 640px) {
          .container {
            padding: 2rem 1rem 4rem;
          }
          
          h1 {
            font-size: 1.8rem;
          }
          
          .lead {
            font-size: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
          }
          
          .section {
            margin-bottom: 2rem;
          }
          
          h2 {
            font-size: 0.85rem;
          }
          
          p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </Layout>
  )
}