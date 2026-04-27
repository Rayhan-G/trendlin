// src/components/frontend/Footer.js
import Link from 'next/link'
import { useState, useEffect } from 'react'
import NewsletterSubscribe from './NewsletterSubscribe'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is subscribed to newsletter on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        
        if (data.authenticated && data.newsletter?.is_subscribed === true) {
          setIsSubscribed(true)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkSubscription()
  }, [])

  // Listen for subscription changes
  useEffect(() => {
    const handleSubscriptionChange = (event) => {
      setIsSubscribed(event.detail.isSubscribed)
    }
    
    window.addEventListener('subscriptionChange', handleSubscriptionChange)
    
    return () => {
      window.removeEventListener('subscriptionChange', handleSubscriptionChange)
    }
  }, [])

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const socialLinks = [
    { name: 'X', href: 'https://x.com/trendlinsocial', brandClass: 'x' },
    { name: 'Facebook', href: 'https://www.facebook.com/trendlinsocial', brandClass: 'facebook' },
    { name: 'Instagram', href: 'https://www.instagram.com/trendlinsocial/', brandClass: 'instagram' },
  ]

  // Don't show loading state - just hide the section until we know
  if (loading) {
    // Return footer without newsletter section while checking
    return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-about">
              <Link href="/" className="footer-logo">
                <span className="logo-text">trendlin</span>
                <span className="logo-dot">.</span>
              </Link>
              <p className="about-text">
                Curating the latest trends and insights to help you stay ahead.
              </p>
            </div>
            <div className="footer-legal">
              <h3>Legal</h3>
              <div className="footer-links">
                {legalLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="footer-social-col">
              <h3>Follow Us</h3>
              <div className="footer-social">
                {socialLinks.map((social) => (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className={`social-link ${social.brandClass}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      {/* SVG paths */}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-copyright">
            <p>© {currentYear} trendlin. All rights reserved.</p>
          </div>
        </div>
        <style jsx>{`
          .footer {
            background: #fafafa;
            border-top: 1px solid #e5e7eb;
            margin-top: 4rem;
          }
          :global(html.dark) .footer {
            background: #0f0f13;
            border-top-color: #1f1f2a;
          }
          .footer-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 3rem 2rem 2rem;
          }
          @media (max-width: 768px) {
            .footer-container { padding: 2rem 1.5rem 1.5rem; }
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }
          @media (max-width: 768px) {
            .footer-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
              text-align: center;
            }
          }
          .footer-logo {
            display: inline-flex;
            align-items: baseline;
            text-decoration: none;
            margin-bottom: 1rem;
          }
          .logo-text {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #1a1a1a 0%, #404040 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .logo-dot {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          :global(html.dark) .logo-text {
            background: linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .about-text {
            font-size: 0.85rem;
            line-height: 1.5;
            color: #6b7280;
            max-width: 280px;
          }
          @media (max-width: 768px) {
            .about-text { max-width: 100%; margin: 0 auto; }
          }
          :global(html.dark) .about-text { color: #9ca3af; }
          .footer-legal h3, .footer-social-col h3 {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            color: #9ca3af;
          }
          .footer-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          @media (max-width: 768px) {
            .footer-links { align-items: center; }
          }
          .footer-link {
            font-size: 0.85rem;
            color: #6b7280;
            text-decoration: none;
            transition: color 0.2s;
          }
          .footer-link:hover {
            color: #111827;
            text-decoration: underline;
          }
          :global(html.dark) .footer-link { color: #9ca3af; }
          :global(html.dark) .footer-link:hover { color: #f1f5f9; }
          .footer-social {
            display: flex;
            gap: 0.75rem;
          }
          @media (max-width: 768px) {
            .footer-social { justify-content: center; }
          }
          .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #f3f4f6;
            color: #4b5563;
            transition: all 0.2s;
          }
          :global(html.dark) .social-link {
            background: #1f1f2a;
            color: #9ca3af;
          }
          .social-link:hover { transform: translateY(-2px); }
          .social-link.x:hover { background: #000000; color: white; }
          .social-link.facebook:hover { background: #1877f2; color: white; }
          .social-link.instagram:hover {
            background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
            color: white;
          }
          .footer-copyright {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
          }
          :global(html.dark) .footer-copyright { border-top-color: #1f1f2a; }
          .footer-copyright p {
            font-size: 0.75rem;
            color: #9ca3af;
          }
        `}</style>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Newsletter Section - Only show if NOT subscribed */}
        {!isSubscribed && (
          <div className="footer-newsletter">
            <NewsletterSubscribe 
              variant="footer" 
              onSubscriptionChange={(subscribed) => {
                setIsSubscribed(subscribed)
                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('subscriptionChange', { 
                  detail: { isSubscribed: subscribed }
                }))
              }}
            />
          </div>
        )}

        <div className="footer-grid">
          <div className="footer-about">
            <Link href="/" className="footer-logo">
              <span className="logo-text">trendlin</span>
              <span className="logo-dot">.</span>
            </Link>
            <p className="about-text">
              Curating the latest trends and insights to help you stay ahead in a fast-changing world.
            </p>
          </div>

          <div className="footer-legal">
            <h3>Legal</h3>
            <div className="footer-links">
              {legalLinks.map((link) => (
                <Link key={link.name} href={link.href} className="footer-link">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-social-col">
            <h3>Follow Us</h3>
            <div className="footer-social">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className={`social-link ${social.brandClass}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    {social.name === 'X' && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
                    {social.name === 'Facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>}
                    {social.name === 'Instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-copyright">
          <p>© {currentYear} trendlin. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #fafafa;
          border-top: 1px solid #e5e7eb;
          margin-top: 4rem;
        }
        
        :global(html.dark) .footer {
          background: #0f0f13;
          border-top-color: #1f1f2a;
        }
        
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
        }
        
        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1.5rem 1.5rem;
          }
        }
        
        .footer-newsletter {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        :global(html.dark) .footer-newsletter {
          border-bottom-color: #1f1f2a;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: center;
          }
        }
        
        .footer-logo {
          display: inline-flex;
          align-items: baseline;
          text-decoration: none;
          margin-bottom: 1rem;
        }
        
        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1a1a1a 0%, #404040 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .logo-dot {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        :global(html.dark) .logo-text {
          background: linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .about-text {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #6b7280;
          max-width: 280px;
        }
        
        :global(html.dark) .about-text {
          color: #9ca3af;
        }
        
        @media (max-width: 768px) {
          .about-text {
            max-width: 100%;
            margin: 0 auto;
          }
        }
        
        .footer-legal h3,
        .footer-social-col h3 {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
          color: #9ca3af;
        }
        
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .footer-links {
            align-items: center;
          }
        }
        
        .footer-link {
          font-size: 0.85rem;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .footer-link:hover {
          color: #111827;
          text-decoration: underline;
        }
        
        :global(html.dark) .footer-link {
          color: #9ca3af;
        }
        
        :global(html.dark) .footer-link:hover {
          color: #f1f5f9;
        }
        
        .footer-social {
          display: flex;
          gap: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .footer-social {
            justify-content: center;
          }
        }
        
        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #4b5563;
          transition: all 0.2s;
        }
        
        :global(html.dark) .social-link {
          background: #1f1f2a;
          color: #9ca3af;
        }
        
        .social-link svg {
          width: 18px;
          height: 18px;
        }
        
        .social-link:hover {
          transform: translateY(-2px);
        }
        
        .social-link.x:hover {
          background: #000000;
          color: white;
        }
        
        .social-link.facebook:hover {
          background: #1877f2;
          color: white;
        }
        
        .social-link.instagram:hover {
          background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
          color: white;
        }
        
        :global(html.dark) .social-link.x:hover {
          background: #000000;
        }
        
        :global(html.dark) .social-link.facebook:hover {
          background: #1877f2;
        }
        
        .footer-copyright {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }
        
        :global(html.dark) .footer-copyright {
          border-top-color: #1f1f2a;
        }
        
        .footer-copyright p {
          font-size: 0.75rem;
          color: #9ca3af;
        }
      `}</style>
    </footer>
  )
}