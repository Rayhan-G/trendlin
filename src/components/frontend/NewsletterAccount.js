// src/components/frontend/NewsletterAccount.js
import { useState, useEffect } from 'react'

export default function NewsletterAccount({ user, onSubscribeChange }) {
  const [preferences, setPreferences] = useState(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPreferences, setShowPreferences] = useState(false)

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
    { id: 'tech', name: 'Technology', icon: '⚡' },
    { id: 'wealth', name: 'Wealth', icon: '💰' },
    { id: 'world', name: 'World News', icon: '🌍' }
  ]

  useEffect(() => {
    if (user?.newsletter) {
      setPreferences(user.newsletter)
      setIsSubscribed(user.newsletter.is_subscribed || false)
    }
  }, [user])

  const toggleSubscription = async () => {
    setLoading(true)
    const newStatus = !isSubscribed

    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_subscribed: newStatus })
    })

    if (res.ok) {
      setIsSubscribed(newStatus)
      setMessage(newStatus ? '✅ Subscribed to newsletter!' : '❌ Unsubscribed from newsletter')
      if (onSubscribeChange) onSubscribeChange(newStatus)
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('Failed to update. Please try again.')
    }

    setLoading(false)
  }

  const updatePreferences = async (updates) => {
    setLoading(true)

    const res = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (res.ok) {
      setPreferences({ ...preferences, ...updates })
      setMessage('✅ Preferences updated!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('Failed to update preferences')
    }

    setLoading(false)
  }

  return (
    <div className="newsletter-account">
      <div className="newsletter-header">
        <div className="newsletter-icon">📬</div>
        <div className="newsletter-info">
          <h3>Newsletter Subscription</h3>
          <p className="user-email">{user?.email}</p>
        </div>
        <button
          onClick={toggleSubscription}
          className={`subscribe-btn ${isSubscribed ? 'subscribed' : 'not-subscribed'}`}
          disabled={loading}
        >
          {loading ? '...' : isSubscribed ? '✓ Subscribed' : 'Subscribe →'}
        </button>
      </div>

      {isSubscribed && (
        <div className="newsletter-details">
          <button
            className="preferences-toggle"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            {showPreferences ? '▼' : '▶'} Customize delivery preferences
          </button>

          {showPreferences && (
            <div className="preferences-panel">
              <div className="pref-group">
                <label>📌 Categories you follow</label>
                <div className="category-chips">
                  {categories.map(cat => (
                    <label key={cat.id} className={`category-chip ${preferences?.categories?.includes(cat.id) ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={preferences?.categories?.includes(cat.id) || false}
                        onChange={() => {
                          const newCats = preferences?.categories?.includes(cat.id)
                            ? (preferences?.categories || []).filter(c => c !== cat.id)
                            : [...(preferences?.categories || []), cat.id]
                          updatePreferences({ categories: newCats })
                        }}
                      />
                      <span>{cat.icon} {cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pref-group">
                <label>⏰ How often?</label>
                <select
                  value={preferences?.delivery_frequency || 'weekly'}
                  onChange={(e) => updatePreferences({ delivery_frequency: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="pref-group">
                <label>📊 Max posts per week</label>
                <div className="volume-control">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences?.max_posts_per_week || 3}
                    onChange={(e) => updatePreferences({ max_posts_per_week: parseInt(e.target.value) })}
                  />
                  <span className="volume-value">{preferences?.max_posts_per_week || 3} posts/week</span>
                </div>
              </div>

              <div className="pref-group">
                <label>📄 Email format</label>
                <select
                  value={preferences?.post_format || 'summary'}
                  onChange={(e) => updatePreferences({ post_format: e.target.value })}
                >
                  <option value="summary">Summary (key points + links)</option>
                  <option value="digest">Digest (full previews)</option>
                  <option value="full">Full articles (complete posts)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {message && <p className="message">{message}</p>}

      <style jsx>{`
        .newsletter-account {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          border-radius: 24px;
          padding: 1.5rem;
          color: white;
        }
        :global(.dark) .newsletter-account {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .newsletter-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .newsletter-icon {
          font-size: 2rem;
        }
        .newsletter-info {
          flex: 1;
        }
        .newsletter-info h3 {
          margin: 0;
          font-size: 1.1rem;
          color: white;
        }
        .user-email {
          margin: 0;
          font-size: 0.75rem;
          opacity: 0.7;
          color: rgba(255,255,255,0.7);
        }
        .subscribe-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .subscribe-btn.subscribed {
          background: rgba(16,185,129,0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }
        .subscribe-btn.not-subscribed {
          background: #06b6d4;
          color: white;
        }
        .subscribe-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .newsletter-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .preferences-toggle {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
        }
        .preferences-toggle:hover {
          color: #06b6d4;
        }
        .preferences-panel {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
        }
        .pref-group {
          margin-bottom: 1rem;
        }
        .pref-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.7;
          color: rgba(255,255,255,0.7);
        }
        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.8rem;
          background: rgba(255,255,255,0.1);
          border-radius: 40px;
          cursor: pointer;
          font-size: 0.75rem;
          color: white;
        }
        .category-chip.active {
          background: rgba(6,182,212,0.3);
          border: 1px solid #06b6d4;
        }
        .category-chip input {
          position: absolute;
          opacity: 0;
        }
        select {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
        }
        select option {
          background: #1e293b;
          color: white;
        }
        .volume-control {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .volume-control input {
          flex: 1;
        }
        .volume-value {
          font-size: 0.8rem;
          min-width: 80px;
          color: rgba(255,255,255,0.8);
        }
        input[type="range"] {
          height: 4px;
          -webkit-appearance: none;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #06b6d4;
          border-radius: 50%;
          cursor: pointer;
        }
        .message {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.8rem;
          color: #10b981;
        }
      `}</style>
    </div>
  )
}