import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatNumber, formatRating } from '../../utils/formatters'

export default function UnifiedHero() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalSubscribers: 0,
    averageRating: 0,
    totalRatings: 0
  })
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDarkMode(isDark)
    }
    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkDarkMode)
    
    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', checkDarkMode)
    }
  }, [])

  // Fetch global stats from the view
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        
        let totalPosts = 0
        let totalSubscribers = 0
        let totalRatings = 0
        let weightedRatingSum = 0
        
        // First, try to get from category_stats_table directly (more reliable)
        const { data: categoryData, error: categoryError } = await supabase
          .from('category_stats_table')
          .select('total_posts, total_subscribers, average_rating, total_ratings')

        if (!categoryError && categoryData && categoryData.length > 0) {
          // Calculate totals from category_stats_table
          totalPosts = categoryData.reduce((sum, cat) => sum + (cat.total_posts || 0), 0)
          totalSubscribers = categoryData.reduce((sum, cat) => sum + (cat.total_subscribers || 0), 0)
          totalRatings = categoryData.reduce((sum, cat) => sum + (cat.total_ratings || 0), 0)
          
          categoryData.forEach(cat => {
            if (cat.average_rating && cat.total_ratings) {
              weightedRatingSum += cat.average_rating * cat.total_ratings
            }
          })
        } else {
          // Fallback: Calculate directly from posts table
          const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('category, average_rating, total_ratings')
            .eq('status', 'published')

          if (!postsError && posts && posts.length > 0) {
            // Group by category to avoid double counting
            const categoryMap = new Map()
            
            posts.forEach(post => {
              const cat = post.category
              if (!categoryMap.has(cat)) {
                categoryMap.set(cat, {
                  total_posts: 0,
                  total_ratings: 0,
                  weighted_rating: 0
                })
              }
              
              const stats = categoryMap.get(cat)
              stats.total_posts++
              if (post.total_ratings && post.total_ratings > 0) {
                stats.total_ratings += post.total_ratings
                stats.weighted_rating += (post.average_rating || 0) * post.total_ratings
              }
            })
            
            // Calculate totals
            totalPosts = posts.length
            totalRatings = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total_ratings, 0)
            weightedRatingSum = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.weighted_rating, 0)
            
            // Get subscriber count from newsletter_subscribers (only verified)
            const { count: subscribersCount } = await supabase
              .from('newsletter_subscribers')
              .select('*', { count: 'exact', head: true })
              .not('verified_at', 'is', null)
              .is('unsubscribed_at', null)
            
            totalSubscribers = subscribersCount || 0
          }
        }
        
        const averageRating = totalRatings > 0 ? weightedRatingSum / totalRatings : 0

        setStats({
          totalPosts: totalPosts,
          totalSubscribers: totalSubscribers,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalRatings: totalRatings
        })
        
      } catch (error) {
        console.error('Error fetching global stats:', error)
        setStats({
          totalPosts: 0,
          totalSubscribers: 0,
          averageRating: 0,
          totalRatings: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // All 7 category icons with click handlers
  const icons = [
    { icon: '🌿', top: '8%', left: '15%', delay: '0s', label: 'Health', slug: 'health' },
    { icon: '💰', top: '10%', right: '10%', delay: '0.3s', label: 'Wealth', slug: 'wealth' },
    { icon: '⚡', bottom: '15%', left: '5%', delay: '0.6s', label: 'Tech', slug: 'tech' },
    { icon: '🌱', bottom: '7%', right: '15%', delay: '0.9s', label: 'Growth', slug: 'growth' },
    { icon: '🎬', top: '45%', right: '20%', delay: '1.2s', label: 'Entertainment', slug: 'entertainment' },
    { icon: '🌍', bottom: '30%', left: '23%', delay: '1.5s', label: 'World', slug: 'world' },
    { icon: '✨', top: '22%', left: '39%', delay: '1.8s', label: 'Lifestyle', slug: 'lifestyle' },
  ]

  const handleIconClick = (slug) => {
    window.location.href = `/category/${slug}`
  }

  return (
    <div className={`hero ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="hero-bg">
        <div className="gradient-1"></div>
        <div className="gradient-2"></div>
        <div className="gradient-3"></div>
      </div>

      <div className="hero-content">
        <div className="container">
          <div className="left">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              <span>Curated intelligence</span>
            </div>

            <h1>
              What's trending<br />
              <span className="highlight">is what matters.</span>
            </h1>

            <p className="description">
              AI. Markets. Wellness. Money. — We track the signals across 7 categories, 
              so you stay ahead of what's next.
            </p>

            <div className="stat-group">
              <div className="stat-item">
                <div className="stat-number">{loading ? '...' : formatNumber(stats.totalPosts)}</div>
                <div className="stat-label">Articles</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">{loading ? '...' : formatNumber(stats.totalSubscribers)}</div>
                <div className="stat-label">Subscribers</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">{loading ? '...' : formatRating(stats.averageRating)}</div>
                <div className="stat-label">Rating</div>
                {stats.totalRatings > 0 && (
                  <div className="stat-note">from {formatNumber(stats.totalRatings)} reviews</div>
                )}
              </div>
            </div>
          </div>

          <div className="right">
            <div className="visual">
              <div className="orb"></div>
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
              <div className="icons">
                {icons.map((item, idx) => (
                  <span 
                    key={idx}
                    className={`icon-${idx + 1}`}
                    style={{
                      top: item.top,
                      left: item.left,
                      right: item.right,
                      bottom: item.bottom,
                      animationDelay: item.delay
                    }}
                    onClick={() => handleIconClick(item.slug)}
                    title={item.label}
                  >
                    {item.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          margin-top: -64px;
          padding-top: 64px;
          overflow: hidden;
          transition: background 0.3s ease;
        }

        .hero.dark {
          background: #0a0a0a;
        }

        .hero.light {
          background: #f5f5f5;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .gradient-1 {
          position: absolute;
          top: -20%;
          left: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(80px);
          animation: float1 20s ease infinite;
        }

        .hero.dark .gradient-1 {
          background: radial-gradient(circle, rgba(139,92,246,0.3), transparent);
        }

        .hero.light .gradient-1 {
          background: radial-gradient(circle, rgba(139,92,246,0.08), transparent);
        }

        .gradient-2 {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(80px);
          animation: float2 25s ease infinite;
        }

        .hero.dark .gradient-2 {
          background: radial-gradient(circle, rgba(236,72,153,0.25), transparent);
        }

        .hero.light .gradient-2 {
          background: radial-gradient(circle, rgba(236,72,153,0.06), transparent);
        }

        .gradient-3 {
          position: absolute;
          top: 40%;
          left: 40%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(80px);
          animation: float3 30s ease infinite;
        }

        .hero.dark .gradient-3 {
          background: radial-gradient(circle, rgba(6,182,212,0.2), transparent);
        }

        .hero.light .gradient-3 {
          background: radial-gradient(circle, rgba(6,182,212,0.05), transparent);
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, 20px) rotate(5deg); }
        }

        .hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .left {
          color: var(--text-primary);
        }

        .hero.dark .left {
          --text-primary: white;
        }

        .hero.light .left {
          --text-primary: #111827;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 40px;
          margin-bottom: 1.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .hero.dark .eyebrow {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
        }

        .hero.light .eyebrow {
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.08);
          color: rgba(0,0,0,0.6);
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        h1 {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .hero.dark h1 {
          color: white;
        }

        .hero.light h1 {
          color: #111827;
        }

        .highlight {
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .description {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 450px;
        }

        .hero.dark .description {
          color: rgba(255,255,255,0.6);
        }

        .hero.light .description {
          color: rgba(0,0,0,0.6);
        }

        .stat-group {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          text-align: left;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .hero.dark .stat-number {
          color: white;
        }

        .hero.light .stat-number {
          color: #111827;
        }

        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero.dark .stat-label {
          color: rgba(255,255,255,0.5);
        }

        .hero.light .stat-label {
          color: rgba(0,0,0,0.5);
        }

        .stat-note {
          font-size: 0.65rem;
          margin-top: 0.25rem;
        }

        .hero.dark .stat-note {
          color: rgba(255,255,255,0.3);
        }

        .hero.light .stat-note {
          color: rgba(0,0,0,0.3);
        }

        .stat-divider {
          width: 1px;
          height: 30px;
        }

        .hero.dark .stat-divider {
          background: rgba(255,255,255,0.1);
        }

        .hero.light .stat-divider {
          background: rgba(0,0,0,0.1);
        }

        .right {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .visual {
          position: relative;
          width: 450px;
          height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orb {
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #8b5cf6, #ec4899);
          border-radius: 50%;
          animation: pulse 3s ease infinite;
        }

        .hero.dark .orb {
          box-shadow: 0 0 70px rgba(139,92,246,0.5);
        }

        .hero.light .orb {
          box-shadow: 0 0 50px rgba(139,92,246,0.3);
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          animation: spin 20s linear infinite;
        }

        .hero.dark .ring {
          border: 1px solid rgba(139,92,246,0.3);
        }

        .hero.light .ring {
          border: 1px solid rgba(139,92,246,0.15);
        }

        .ring-1 {
          width: 220px;
          height: 220px;
          animation-duration: 15s;
        }

        .ring-2 {
          width: 320px;
          height: 320px;
          animation-duration: 25s;
          animation-direction: reverse;
        }

        .ring-3 {
          width: 420px;
          height: 420px;
          animation-duration: 35s;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .icons {
          position: absolute;
          inset: 0;
        }

        .icons span {
          position: absolute;
          font-size: 2.4rem;
          animation: float 5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .icons span:hover {
          transform: scale(1.2);
        }

        .hero.dark .icons span {
          text-shadow: 0 0 15px rgba(139,92,246,0.3);
        }

        .hero.light .icons span {
          text-shadow: 0 0 10px rgba(139,92,246,0.2);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.05); }
        }

        .scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .scroll-hint:hover {
          opacity: 1;
        }

        .scroll-hint span {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .hero.dark .scroll-hint span {
          color: white;
        }

        .hero.light .scroll-hint span {
          color: #111827;
        }

        .scroll-line {
          width: 1px;
          height: 30px;
          animation: scrollLine 2s ease infinite;
        }

        .hero.dark .scroll-line {
          background: linear-gradient(180deg, white, transparent);
        }

        .hero.light .scroll-line {
          background: linear-gradient(180deg, #111827, transparent);
        }

        @keyframes scrollLine {
          0% { transform: translateY(-10px); opacity: 0; }
          50% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        @media (max-width: 968px) {
          .container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .description {
            margin-left: auto;
            margin-right: auto;
          }

          .stat-group {
            justify-content: center;
          }

          .stat-item {
            text-align: center;
          }

          .right {
            display: none;
          }
        }

        @media (max-width: 640px) {
          h1 {
            font-size: 2.5rem;
          }

          .stat-group {
            gap: 1rem;
          }

          .stat-number {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  )
}