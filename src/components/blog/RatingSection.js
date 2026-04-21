import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RatingSection({ postSlug, postTitle }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [averageRating, setAverageRating] = useState(null)
  const [totalRatings, setTotalRatings] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const emojis = {
    1: { emoji: '😤', label: 'Hated It', stars: '★', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', required: true },
    2: { emoji: '😕', label: 'Off', stars: '★★', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', required: true },
    3: { emoji: '😐', label: 'Meh', stars: '★★★', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', required: true },
    4: { emoji: '😊', label: 'Good', stars: '★★★★', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', required: true },
    5: { emoji: '😍', label: 'Love It', stars: '★★★★★', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', required: false }
  }

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const rated = localStorage.getItem(`rated_${postSlug}`)
    setHasRated(!!rated)
  }, [postSlug])

  useEffect(() => {
    async function fetchRating() {
      const { data } = await supabase
        .from('posts')
        .select('average_rating, total_ratings')
        .eq('slug', postSlug)
        .single()
      if (data) {
        setAverageRating(data.average_rating || 0)
        setTotalRatings(data.total_ratings || 0)
      }
    }
    fetchRating()
  }, [postSlug, submitted])

  const submitRating = async () => {
    if (rating === 0) {
      alert('Please select an emoji')
      return
    }
    if (emojis[rating].required && !feedback.trim()) {
      alert(`Please share your feedback for "${emojis[rating].label}"`)
      return
    }

    setLoading(true)
    try {
      await supabase.from('post_ratings').insert({
        post_slug: postSlug,
        post_title: postTitle,
        rating: rating,
        feedback: feedback || null,
        created_at: new Date().toISOString()
      })

      const { data: allRatings } = await supabase
        .from('post_ratings')
        .select('rating')
        .eq('post_slug', postSlug)

      if (allRatings && allRatings.length > 0) {
        const total = allRatings.length
        const sum = allRatings.reduce((a, b) => a + b.rating, 0)
        const avg = sum / total

        await supabase
          .from('posts')
          .update({
            average_rating: parseFloat(avg.toFixed(1)),
            total_ratings: total
          })
          .eq('slug', postSlug)

        setAverageRating(parseFloat(avg.toFixed(1)))
        setTotalRatings(total)
      }

      localStorage.setItem(`rated_${postSlug}`, 'true')
      setHasRated(true)
      setSubmitted(true)
      alert('Thank you for your rating!')
    } catch (err) {
      console.error('Error:', err)
      alert('Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  if (hasRated || submitted) {
    return (
      <div className={`rating-thanks ${isDarkMode ? 'dark' : 'light'}`}>
        {averageRating > 0 && (
          <div className="rating-stats">
            <span className="stars">
              {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
            </span>
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <span className="rating-count">({totalRatings} ratings)</span>
          </div>
        )}
        <p>Thanks for your feedback! ❤️</p>
        <style jsx>{`
          .rating-thanks {
            text-align: center;
            padding: 2rem;
            margin-top: 3rem;
            border-top: 1px solid #e9ecef;
          }
          .rating-thanks.dark { border-top-color: #2c3e50; }
          .rating-stats { margin-bottom: 0.75rem; }
          .stars { color: #f59e0b; letter-spacing: 2px; font-size: 1.1rem; }
          .rating-number { font-weight: 600; margin-left: 0.5rem; color: #495057; }
          .rating-count { color: #6c757d; font-size: 0.85rem; margin-left: 0.5rem; }
          .rating-thanks.dark .rating-number { color: #e9ecef; }
          p { color: #6c757d; }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`rating-section ${isDarkMode ? 'dark' : 'light'}`}>
      {averageRating > 0 && totalRatings > 0 && (
        <div className="existing-ratings">
          <span className="stars">
            {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
          </span>
          <span className="rating-number">{averageRating.toFixed(1)}</span>
          <span className="rating-count">({totalRatings} ratings)</span>
        </div>
      )}

      <p className="rating-title">How did you feel about this article?</p>

      <div className="emojis">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`emoji-btn ${value === rating ? 'active' : ''}`}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => { setRating(value); setFeedback(''); }}
            style={{ '--emoji-color': emojis[value].color, '--emoji-bg': emojis[value].bg }}
          >
            <span className="emoji">{emojis[value].emoji}</span>
            <span className="emoji-stars">{emojis[value].stars}</span>
            <span className="emoji-label">{emojis[value].label}</span>
          </button>
        ))}
      </div>

      {rating > 0 && (
        <>
          <textarea
            className="feedback-input"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={emojis[rating].required 
              ? `Please tell us why you selected "${emojis[rating].label}" (Required)`
              : `Share your thoughts (Optional)`}
            rows={3}
          />
          <button 
            className="submit-btn" 
            onClick={submitRating} 
            disabled={loading || (emojis[rating].required && !feedback.trim())}
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </>
      )}

      <style jsx>{`
        .rating-section {
          text-align: center;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 20px;
          margin-top: 3rem;
        }
        .rating-section.dark { background: #1a2632; }
        .existing-ratings {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .rating-section.dark .existing-ratings { border-bottom-color: #2c3e50; }
        .stars { color: #f59e0b; letter-spacing: 2px; font-size: 1.1rem; }
        .rating-number { font-weight: 600; margin-left: 0.5rem; color: #495057; }
        .rating-count { color: #6c757d; font-size: 0.85rem; margin-left: 0.5rem; }
        .rating-section.dark .rating-number { color: #e9ecef; }
        .rating-title {
          margin-bottom: 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          color: #495057;
        }
        .rating-section.dark .rating-title { color: #e9ecef; }
        .emojis {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .emoji-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          transition: all 0.2s ease;
          opacity: 0.6;
        }
        .emoji-btn.active {
          opacity: 1;
          background: var(--emoji-bg);
          transform: scale(1.05);
        }
        .emoji-btn:hover {
          opacity: 1;
          transform: scale(1.05);
          background: var(--emoji-bg);
        }
        .emoji { font-size: 2.5rem; }
        .emoji-stars { font-size: 0.7rem; color: #f59e0b; letter-spacing: 1px; }
        .emoji-label { font-size: 0.7rem; font-weight: 500; color: #6c757d; }
        .rating-section.dark .emoji-label { color: #a0a0a0; }
        .emoji-btn.active .emoji-label { color: var(--emoji-color); }
        .feedback-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 12px;
          font-size: 0.95rem;
          resize: vertical;
          font-family: inherit;
          margin-bottom: 1rem;
          background: white;
        }
        .rating-section.dark .feedback-input {
          background: #2c3e50;
          border-color: #4a627a;
          color: #e9ecef;
        }
        .submit-btn {
          padding: 0.75rem 2rem;
          background: #0056b3;
          border: none;
          border-radius: 40px;
          color: white;
          font-size: 0.95rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: #004494;
          transform: translateY(-2px);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .rating-section { padding: 1.5rem; }
          .emoji { font-size: 1.8rem; }
          .emoji-label { font-size: 0.55rem; }
          .emoji-stars { font-size: 0.55rem; }
          .emoji-btn { padding: 0.5rem 0.6rem; }
        }
      `}</style>
    </div>
  )
}