// src/components/category/growth/GrowthHero.js

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatNumber, formatRating } from '@/utils/formatters'

export default function GrowthHero() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalSubscribers: 0,
    averageRating: 0,
    totalRatings: 0
  })
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Growth categories
  const growthPillars = [
    { name: 'Study Methods', icon: '📚', description: 'Learning techniques, memory & focus', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { name: 'Productivity', icon: '⚡', description: 'Habits, time management & deep work', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { name: 'Skill Learning', icon: '💻', description: 'Coding, design, languages & more', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { name: 'Career Growth', icon: '📈', description: 'Skills development & personal branding', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { name: 'Mindset', icon: '🧠', description: 'Motivation, discipline & goal setting', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
    { name: 'Planning', icon: '🎯', description: 'Goal setting & strategic planning', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' }
  ]

  const subCategories = [
    { name: "Online Courses", icon: '💻' },
    { name: "Habit Building", icon: '✅' },
    { name: "Time Management", icon: '⏰' },
    { name: "Focus Techniques", icon: '🎯' },
    { name: "Personal Branding", icon: '🌟' },
    { name: "Learning Hacks", icon: '🧠' }
  ]

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

  // Fetch stats from category_stats_table
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        
        // Get category stats from category_stats_table
        const { data, error } = await supabase
          .from('category_stats_table')
          .select('total_posts, total_subscribers, average_rating, total_ratings')
          .eq('category', 'growth')
          .maybeSingle()

        if (error || !data) {
          // Fallback: Calculate from posts table
          const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('average_rating, total_ratings')
            .eq('category', 'growth')
            .eq('status', 'published')

          if (!postsError && posts) {
            let totalWeightedRating = 0
            let totalRatingsCount = 0
            
            posts.forEach(post => {
              if (post.total_ratings && post.total_ratings > 0) {
                totalWeightedRating += (post.average_rating || 0) * post.total_ratings
                totalRatingsCount += post.total_ratings
              }
            })
            
            const averageRating = totalRatingsCount > 0 ? totalWeightedRating / totalRatingsCount : 0

            // Get ONLY verified subscribers
            const { count: subscribersCount } = await supabase
              .from('newsletter_subscribers')
              .select('*', { count: 'exact', head: true })
              .contains('categories', ['growth'])
              .not('verified_at', 'is', null)
              .is('unsubscribed_at', null)

            setStats({
              totalPosts: posts.length,
              totalSubscribers: subscribersCount || 0,
              averageRating: parseFloat(averageRating.toFixed(1)),
              totalRatings: totalRatingsCount
            })
          }
        } else {
          setStats({
            totalPosts: data.total_posts || 0,
            totalSubscribers: data.total_subscribers || 0,
            averageRating: data.average_rating || 0,
            totalRatings: data.total_ratings || 0
          })
        }
        
      } catch (error) {
        console.error('Error fetching growth stats:', error)
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

  return (
    <div className={`growth-hero ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Animated Gradient Background */}
      <div className="gradient-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
      </div>

      {/* Grid Overlay */}
      <div className="grid-overlay"></div>

      {/* Main Container */}
      <div className="hero-container">
        <div className="hero-left">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-icon">🌱</span>
            <span className="badge-text">Complete Growth & Development Hub</span>
            <span className="badge-pulse"></span>
          </div>

          {/* Title */}
          <h1 className="hero-title">
            <span className="title-gradient">Your Growth</span>
            <br />
            <span className="title-wave">Unlock Your Potential</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Everything you need for personal development — from study methods and productivity to career skills and mindset mastery.
          </p>

          {/* Category-Specific STATS */}
          <div className="stats-wrapper">
            <div className="stat-block">
              <div className="stat-number">{loading ? '...' : formatNumber(stats.totalPosts)}</div>
              <div className="stat-label">Growth posts</div>
            </div>

            <div className="stat-block">
              <div className="stat-number">{loading ? '...' : formatNumber(stats.totalSubscribers)}</div>
              <div className="stat-label">Growth subscribers</div>
              {stats.totalSubscribers === 0 && !loading && (
                <div className="stat-note">Subscribe to get updates</div>
              )}
            </div>

            <div className="stat-block">
              <div className="stat-number">{loading ? '...' : formatRating(stats.averageRating)}</div>
              <div className="stat-label">Growth rating</div>
              {stats.totalRatings > 0 && (
                <div className="stat-note">from {formatNumber(stats.totalRatings)} reviews</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Categories */}
        <div className="hero-right">
          <div className="categories-visual">
            <div className="visual-header">
              <span className="visual-icon">🎯</span>
              <span className="visual-title">What We Cover</span>
            </div>

            <div className="pillars-grid">
              {growthPillars.map((pillar, idx) => (
                <div key={idx} className="pillar-card">
                  <div className="pillar-icon" style={{ background: pillar.gradient }}>
                    <span>{pillar.icon}</span>
                  </div>
                  <div className="pillar-info">
                    <div className="pillar-name">{pillar.name}</div>
                    <div className="pillar-desc">{pillar.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="additional-categories">
              <div className="additional-label">
                <span className="label-dot"></span>
                <span>Also covering</span>
              </div>
              <div className="chips-grid">
                {subCategories.map((cat, idx) => (
                  <div key={idx} className="category-chip">
                    <span className="chip-icon">{cat.icon}</span>
                    <span className="chip-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-ring">
          <div className="scroll-dot"></div>
        </div>
      </div>

      <style jsx>{`
        .growth-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-top: -64px;
          padding-top: 64px;
        }

        .growth-hero {
          --bg-primary: #0a0a0a;
          --border-color: rgba(255,255,255,0.08);
          --text-primary: white;
          --text-secondary: rgba(255,255,255,0.65);
          --text-muted: rgba(255,255,255,0.4);
          --card-bg: rgba(255,255,255,0.03);
        }

        .growth-hero.light-mode {
          --bg-primary: #f8f9fc;
          --border-color: rgba(0,0,0,0.06);
          --text-primary: #1a1a2e;
          --text-secondary: rgba(0,0,0,0.6);
          --text-muted: rgba(0,0,0,0.4);
          --card-bg: rgba(0,0,0,0.02);
        }

        .growth-hero {
          background: var(--bg-primary);
        }

        .gradient-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.3;
          animation: floatOrb 25s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16,185,129,0.4), transparent);
          top: -300px;
          left: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(245,158,11,0.3), transparent);
          bottom: -250px;
          right: -150px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.3), transparent);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        .orb-4 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(139,92,246,0.2), transparent);
          bottom: 10%;
          left: 20%;
          animation-delay: 15s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .hero-container {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 4rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .hero-left {
          color: var(--text-primary);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1.25rem;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border-radius: 40px;
          margin-bottom: 2rem;
          border: 1px solid rgba(16,185,129,0.3);
          position: relative;
        }

        .badge-icon {
          font-size: 1rem;
          animation: pulse 2s infinite;
        }

        .badge-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-pulse {
          position: absolute;
          right: -4px;
          top: -4px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .title-gradient {
          background: linear-gradient(135deg, #10b981, #34d399);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .title-wave {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .hero-description {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .stats-wrapper {
          display: flex;
          gap: 2rem;
          padding: 1.5rem 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
        }

        .stat-block {
          text-align: left;
          flex: 1;
          min-width: 0;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .stat-note {
          font-size: 0.65rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-right {
          position: sticky;
          top: 100px;
        }

        .categories-visual {
          background: var(--card-bg);
          border-radius: 24px;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          backdrop-filter: blur(10px);
        }

        .visual-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .visual-icon {
          font-size: 1.5rem;
        }

        .visual-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.5px;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .pillar-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: var(--card-bg);
          border-radius: 14px;
          border: 1px solid var(--border-color);
          transition: transform 0.2s ease;
        }

        .pillar-card:hover {
          transform: translateY(-2px);
        }

        .pillar-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.5rem;
        }

        .pillar-info {
          flex: 1;
        }

        .pillar-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .pillar-desc {
          font-size: 0.65rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .additional-categories {
          margin-bottom: 0;
        }

        .additional-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .label-dot {
          width: 4px;
          height: 4px;
          background: #10b981;
          border-radius: 50%;
        }

        .chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .category-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          background: var(--card-bg);
          border-radius: 20px;
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .category-chip:hover {
          border-color: rgba(16,185,129,0.3);
          transform: translateY(-1px);
        }

        .chip-icon {
          font-size: 0.8rem;
        }

        .chip-name {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .scroll-ring {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ringPulse 2s ease-in-out infinite;
        }

        .scroll-dot {
          width: 5px;
          height: 5px;
          background: #10b981;
          border-radius: 50%;
          animation: dotBounce 2s ease-in-out infinite;
        }

        @keyframes ringPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes dotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @media (max-width: 968px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem 1.5rem;
          }
          .hero-title { font-size: 2.5rem; text-align: center; }
          .hero-description { text-align: center; }
          .hero-badge { margin: 0 auto 2rem; }
          .stats-wrapper { justify-content: center; max-width: 100%; margin: 0 auto; gap: 1.5rem; }
          .hero-right { position: static; }
          .pillars-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .stats-wrapper { gap: 1rem; }
          .stat-number { font-size: 1.5rem; }
          .stat-label { font-size: 0.6rem; }
        }

        @media (max-width: 640px) {
          .growth-hero { margin-top: -56px; padding-top: 56px; }
          .hero-container { padding: 1.5rem 1rem; }
          .hero-title { font-size: 1.75rem; }
          .hero-description { font-size: 0.85rem; }
          .stats-wrapper { gap: 0.75rem; padding: 1rem 0; }
          .stat-number { font-size: 1.25rem; }
          .stat-label { font-size: 0.55rem; }
          .pillars-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .stats-wrapper { gap: 0.5rem; }
          .stat-number { font-size: 1rem; }
          .stat-label { font-size: 0.5rem; }
        }
      `}</style>
    </div>
  )
}