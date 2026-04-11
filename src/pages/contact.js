import Layout from '@/components/Layout'

export default function Contact() {
  return (
    <Layout>
      <div className="container">
        <div className="hero">
          <h1>Contact</h1>
          <div className="hero-line"></div>
        </div>

        <div className="content">
          <p className="lead">
            Have a trend to share? Found something interesting?<br />
            Just want to say hello? We'd love to hear from you.
          </p>

          <div className="contact-card">
            <a href="mailto:contact@trendlin.com" className="email-link">
              contact@trendlin.com
            </a>
            <p className="response-note">We typically respond within 24-48 hours.</p>
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
        }
        
        :global(body.dark) .hero-line {
          background: #ffffff;
        }
        
        .content {
          color: #4b5563;
        }
        
        :global(body.dark) .content {
          color: #9ca3af;
        }
        
        .lead {
          font-size: 1.1rem;
          line-height: 1.5;
          margin-bottom: 3rem;
          color: #6b7280;
        }
        
        :global(body.dark) .lead {
          color: #9ca3af;
        }
        
        .contact-card {
          text-align: center;
          padding: 3rem;
          background: #f9fafb;
          border-radius: 16px;
        }
        
        :global(body.dark) .contact-card {
          background: #111827;
        }
        
        .email-link {
          display: inline-block;
          font-size: 1.5rem;
          font-weight: 500;
          color: #111827;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-bottom: 2px solid #e5e7eb;
          transition: all 0.2s;
        }
        
        :global(body.dark) .email-link {
          color: #ffffff;
          border-bottom-color: #1f2937;
        }
        
        .email-link:hover {
          border-bottom-color: #111827;
          transform: translateY(-2px);
        }
        
        :global(body.dark) .email-link:hover {
          border-bottom-color: #ffffff;
        }
        
        .response-note {
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 3rem 1.5rem 5rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .lead {
            font-size: 1rem;
          }
          
          .email-link {
            font-size: 1.2rem;
          }
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 2rem 1rem 4rem;
          }
          
          h1 {
            font-size: 1.8rem;
          }
          
          .lead br {
            display: none;
          }
          
          .contact-card {
            padding: 2rem;
          }
          
          .email-link {
            font-size: 1rem;
            word-break: break-all;
          }
        }
      `}</style>
    </Layout>
  )
}