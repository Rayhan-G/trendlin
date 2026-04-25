// src/components/category/wealth/WealthHero.js

import { useState, useEffect } from 'react'
// Removed: import { supabase } from '@/lib/supabase'
// Removed: import { formatNumber, formatRating } from '@/utils/formatters'

export default function WealthHero() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  // Removed: stats and loading state entirely

  // Wealth categories
  const wealthPillars = [
    { name: 'Make Money Online', icon: '💻', description: 'Freelancing, remote jobs & digital products', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { name: 'Investing', icon: '📈', description: 'Stocks, crypto & portfolio management', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { name: 'Side Hustles', icon: '⚡', description: 'Passive income & entrepreneurial ideas', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { name: 'Saving & Budgeting', icon: '💰', description: 'Financial planning & smart spending', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { name: 'Business & Entrepreneurship', icon: '🏢', description: 'Startups, case studies & growth', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    { name: 'Financial Freedom', icon: '🦅', description: 'Retirement, wealth building & independence', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' }
  ]

  const subCategories = [
    { name: "Shopping Guides", icon: '🛍️' },
    { name: "Product Deals", icon: '🏷️' },
    { name: "Affiliate Tips", icon: '🔗' },
    { name: "E-commerce", icon: '📦' },
    { name: "Remote Jobs", icon: '🏠' },
    { name: "Case Studies", icon: '📊' }
  ]

  // Detect dark mode only
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

  // Removed: fetchStats useEffect entirely

  return (
    <div className={`wealth-hero ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
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
            <span className="badge-icon">💰</span>
            <span className="badge-text">Complete Wealth & Finance Hub</span>
            <span className="badge-pulse"></span>
          </div>

          {/* Title */}
          <h1 className="hero-title">
            <span className="title-gradient">Build Wealth</span>
            <br />
            <span className="title-wave">Financial Freedom</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Everything you need for making money online, investing, side hustles, saving, and achieving financial independence.
          </p>

          {/* Stats Wrapper - COMPLETELY REMOVED */}
        </div>

        {/* Right Side - Categories */}
        <div className="hero-right">
          <div className="categories-visual">
            <div className="visual-header">
              <span className="visual-icon">🎯</span>
              <span className="visual-title">What We Cover</span>
            </div>

            <div className="pillars-grid">
              {wealthPillars.map((pillar, idx) => (
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
        .wealth-hero {
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

        /* Dark/Light Mode Variables */
        .wealth-hero {
          --bg-primary: #0a0a0a;
          --border-color: rgba(255,255,255,0.08);
          --text-primary: white;
          --text-secondary: rgba(255,255,255,0.65);
          --text-muted: rgba(255,255,255,0.4);
          --card-bg: rgba(255,255,255,0.03);
        }

        .wealth-hero.light-mode {
          --bg-primary: #f8f9fc;
          --border-color: rgba(0,0,0,0.06);
          --text-primary: #1a1a2e;
          --text-secondary: rgba(0,0,0,0.6);
          --text-muted: rgba(0,0,0,0.4);
          --card-bg: rgba(0,0,0,0.02);
        }

        .wealth-hero {
          background: var(--bg-primary);
        }

        /* Gradient Background */
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
          background: radial-gradient(circle, rgba(245,158,11,0.4), transparent);
          top: -300px;
          left: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.3), transparent);
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
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -40px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        /* Grid Overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(245,158,11,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Main Container */
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

        /* Hero Left */
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
          border: 1px solid rgba(245,158,11,0.3);
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
          background: #f59e0b;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .title-gradient {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .title-wave {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .hero-description {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        /* Stats Wrapper - REMOVED */

        /* Hero Right */
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
          background: #f59e0b;
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
          border-color: rgba(245,158,11,0.3);
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

        /* Scroll Indicator */
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
          background: #f59e0b;
          border-radius: 50%;
          animation: dotBounce 2s ease-in-out infinite;
        }

        @keyframes ringPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes dotBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Responsive */
        @media (max-width: 968px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem 1.5rem;
          }

          .hero-title {
            font-size: 2.5rem;
            text-align: center;
          }

          .hero-description {
            text-align: center;
          }

          .hero-badge {
            margin: 0 auto 2rem;
          }

          .hero-right {
            position: static;
          }

          .pillars-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .pillars-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .wealth-hero {
            margin-top: -56px;
            padding-top: 56px;
          }

          .hero-container {
            padding: 1.5rem 1rem;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .hero-description {
            font-size: 0.85rem;
          }

          .pillars-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}