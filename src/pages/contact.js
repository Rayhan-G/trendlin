import { useState } from 'react'
import Layout from '@/components/Layout'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setStatus(null), 5000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus(null), 5000)
      }
    } catch (error) {
      setStatus('error')
      setTimeout(() => setStatus(null), 5000)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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

          <div className="contact-wrapper">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  id="message"
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending' : 'Send message'}
              </button>

              {status === 'success' && (
                <div className="success-message">
                  Thank you. We'll respond within 24-48 hours.
                </div>
              )}
              
              {status === 'error' && (
                <div className="error-message">
                  Failed to send. Please email contact@trendlin.com
                </div>
              )}
            </form>

            <div className="info">
              <div className="info-item">
                <span className="info-label">Email</span>
                <a href="mailto:contact@trendlin.com" className="info-value">contact@trendlin.com</a>
              </div>
              <div className="info-item">
                <span className="info-label">Response</span>
                <span className="info-value">24-48 hours</span>
              </div>
            </div>
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
        
        .contact-wrapper {
          display: flex;
          gap: 4rem;
          align-items: flex-start;
        }
        
        .contact-form {
          flex: 2;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        input, textarea {
          width: 100%;
          padding: 0.75rem 0;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.95rem;
          background: transparent;
          transition: all 0.2s;
        }
        
        :global(body.dark) input,
        :global(body.dark) textarea {
          border-bottom-color: #1f2937;
          color: #f9fafb;
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-bottom-color: #111827;
        }
        
        :global(body.dark) input:focus,
        :global(body.dark) textarea:focus {
          border-bottom-color: #ffffff;
        }
        
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .submit-btn {
          margin-top: 0.5rem;
          padding: 0.6rem 1.5rem;
          background: transparent;
          color: #111827;
          border: 1px solid #111827;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        :global(body.dark) .submit-btn {
          color: #ffffff;
          border-color: #ffffff;
        }
        
        .submit-btn:hover {
          background: #111827;
          color: white;
        }
        
        :global(body.dark) .submit-btn:hover {
          background: #ffffff;
          color: #111827;
        }
        
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .success-message {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #10b981;
        }
        
        .error-message {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #ef4444;
        }
        
        .info {
          flex: 1;
          padding-top: 0.25rem;
        }
        
        .info-item {
          margin-bottom: 1.5rem;
        }
        
        .info-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }
        
        .info-value {
          font-size: 0.9rem;
          color: #111827;
          text-decoration: none;
        }
        
        :global(body.dark) .info-value {
          color: #e5e7eb;
        }
        
        .info-value:hover {
          text-decoration: underline;
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
          
          .contact-wrapper {
            flex-direction: column;
            gap: 2rem;
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
        }
      `}</style>
    </Layout>
  )
}