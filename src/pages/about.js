import Layout from '@/components/Layout'
import Link from 'next/link'

export default function AboutUs() {
  return (
    <Layout>
      <div className="container">
        <div className="hero">
          <h1>About</h1>
          <div className="hero-line"></div>
        </div>

        <div className="content">
          <p className="lead">
            We track what's trending across technology, markets, wellness, and culture — 
            so you don't have to.
          </p>

          <div className="grid">
            <div className="grid-item">
              <h3>What we do</h3>
              <p>
                Every day, we scan emerging trends — from AI breakthroughs to market shifts, 
                wellness waves to global events. We filter the noise and share what matters.
              </p>
            </div>
            <div className="grid-item">
              <h3>Who it's for</h3>
              <p>
                Curious minds. Professionals. Students. Anyone who wants to stay informed 
                about what's happening around the world.
              </p>
            </div>
            <div className="grid-item">
              <h3>What we believe</h3>
              <p>
                Information should be free. No paywalls. No data collection. No sponsored content. 
                Just honest trends and insights.
              </p>
            </div>
            <div className="grid-item">
              <h3>Our approach</h3>
              <p>
                Simple. Direct. Useful. We don't overcomplicate things. We share what's trending 
                and why it might matter to you.
              </p>
            </div>
          </div>

          <div className="mission">
            <p>
              We're a small team based on a simple idea: staying updated shouldn't be hard. 
              No investors. No agenda. Just a genuine interest in what's next.
            </p>
          </div>

          <div className="contact">
            <p>Questions or feedback?</p>
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
          font-size: 1.2rem;
          line-height: 1.5;
          margin-bottom: 3rem;
          color: #111827;
        }
        
        :global(body.dark) .lead {
          color: #e5e7eb;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .grid-item h3 {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.75rem;
          color: #6b7280;
        }
        
        :global(body.dark) .grid-item h3 {
          color: #9ca3af;
        }
        
        .grid-item p {
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }
        
        .mission {
          padding: 2rem 0;
          margin-bottom: 2rem;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        :global(body.dark) .mission {
          border-color: #1f2937;
        }
        
        .mission p {
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
          color: #111827;
        }
        
        :global(body.dark) .mission p {
          color: #e5e7eb;
        }
        
        .contact {
          text-align: center;
          padding-top: 1rem;
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
          }
          
          .grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .grid-item p {
            font-size: 0.9rem;
          }
          
          .mission {
            padding: 1.5rem 0;
          }
          
          .mission p {
            font-size: 0.9rem;
          }
          
          .contact-link {
            font-size: 0.9rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </Layout>
  )
}