import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RightBlock({ postSlug }) {
  const [rightBlockData, setRightBlockData] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    async function fetchRightBlock() {
      try {
        const { data, error } = await supabase
          .from('post_right_blocks')
          .select('*')
          .eq('post_slug', postSlug)
          .eq('is_active', true)
          .maybeSingle()
        if (!error && data) setRightBlockData(data)
      } catch (err) {
        console.error('Error fetching right block:', err)
      }
    }
    if (postSlug) fetchRightBlock()
  }, [postSlug])

  if (!rightBlockData) return null

  return (
    <div className={`right-block ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="right-block-icon">{rightBlockData.icon || '✨'}</div>
      <h4>{rightBlockData.title}</h4>
      <p>{rightBlockData.message}</p>
      {rightBlockData.link && (
        <a 
          href={rightBlockData.link} 
          target={rightBlockData.link_target || '_self'}
          className="right-block-link"
        >
          {rightBlockData.link_text || 'Learn more'} →
        </a>
      )}

      <style jsx>{`
        .right-block {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          text-align: center;
          width: 100%;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
          .right-block {
            padding: 1.25rem 1.5rem;
            border-radius: 16px;
            min-width: 220px;
            margin-bottom: 2rem;
          }
        }
        .right-block.dark {
          background: #1a2632;
        }
        .right-block-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        @media (min-width: 768px) {
          .right-block-icon {
            font-size: 1.8rem;
            margin-bottom: 0.75rem;
          }
        }
        h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: #212529;
        }
        @media (min-width: 768px) {
          h4 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }
        }
        .right-block.dark h4 {
          color: #e9ecef;
        }
        p {
          font-size: 0.75rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        @media (min-width: 768px) {
          p {
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
            line-height: 1.5;
          }
        }
        .right-block-link {
          font-size: 0.75rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
        }
        .right-block-link:active {
          transform: scale(0.95);
        }
        @media (min-width: 768px) {
          .right-block-link {
            font-size: 0.85rem;
          }
        }
        .right-block.dark .right-block-link {
          color: #66b0ff;
        }
      `}</style>
    </div>
  )
}