// pages/newsletter/manage.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { useSubscription } from '../../hooks/useSubscription'

export default function NewsletterManagePage() {
  const router = useRouter()
  const { isSubscribed, subscriptionData, user, loading, refresh } = useSubscription()
  const [selectedCategories, setSelectedCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

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
    if (subscriptionData?.categories) {
      setSelectedCategories(subscriptionData.categories)
    }
  }, [subscriptionData])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/?auth=signup')
    }
  }, [user, loading, router])

  const updatePreferences = async () => {
    if (selectedCategories.length === 0) {
      setMessage('Select at least one category')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      await supabase
        .from('newsletter_preferences')
        .update({
          categories: selectedCategories,
          max_posts_per_week: selectedCategories.length,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      await refresh()
      setMessage('✓ Preferences updated!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error updating preferences')
    } finally {
      setSaving(false)
    }
  }

  const unsubscribe = async () => {
    if (!confirm('Unsubscribe from newsletter?')) return

    setSaving(true)

    try {
      await supabase
        .from('newsletter_preferences')
        .update({
          is_subscribed: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      await refresh()
      router.push('/')
    } catch (err) {
      setMessage('Error unsubscribing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="manage-page">
      <div className="container">
        <button onClick={() => router.back()} className="back-btn">← Back</button>
        
        <h1>Newsletter Settings</h1>
        
        {isSubscribed ? (
          <>
            <div className="status active">✓ Active Subscription</div>
            
            <div className="section">
              <h3>Your Categories</h3>
              <div className="categories-grid">
                {categories.map(cat => (
                  <label key={cat.id} className="category-chip">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => {
                        if (selectedCategories.includes(cat.id)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.id))
                        } else {
                          setSelectedCategories([...selectedCategories, cat.id])
                        }
                      }}
                    />
                    {cat.icon} {cat.name}
                  </label>
                ))}
              </div>
              
              <button onClick={updatePreferences} disabled={saving} className="save-btn">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <div className="section danger">
              <h3>Unsubscribe</h3>
              <p>You will no longer receive newsletter updates.</p>
              <button onClick={unsubscribe} disabled={saving} className="unsubscribe-btn">
                Unsubscribe
              </button>
            </div>
          </>
        ) : (
          <div className="not-subscribed">
            <p>You are not subscribed to the newsletter.</p>
            <button onClick={() => router.push('/')} className="subscribe-btn">
              Subscribe Now
            </button>
          </div>
        )}
        
        {message && <div className="message">{message}</div>}
      </div>

      <style jsx>{`
        .manage-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          padding: 2rem;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 2rem;
        }
        :global(.dark) .container {
          background: #1e293b;
          color: white;
        }
        .back-btn {
          background: none;
          border: none;
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 1rem;
          color: #06b6d4;
        }
        h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }
        .section {
          margin: 1.5rem 0;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
        }
        :global(.dark) .section {
          border-color: #334155;
        }
        .section.danger {
          border-color: #fecaca;
          background: #fef2f2;
        }
        :global(.dark) .section.danger {
          background: rgba(239,68,68,0.1);
          border-color: #ef4444;
        }
        .categories-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 20px;
          cursor: pointer;
        }
        :global(.dark) .category-chip {
          background: #334155;
        }
        .save-btn, .subscribe-btn {
          width: 100%;
          padding: 0.5rem;
          background: #06b6d4;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .unsubscribe-btn {
          width: 100%;
          padding: 0.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .message {
          margin-top: 1rem;
          text-align: center;
          padding: 0.5rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 8px;
        }
        .loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      `}</style>
    </div>
  )
}