import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RightBlock({ postSlug }) {
  const [rightBlockData, setRightBlockData] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

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
          padding: 1.25rem 1.5rem;
          background: #f8f9fa;
          border-radius: 16px;
          text-align: center;
          min-width: 220px;
          margin-bottom: 2rem;
        }
        .right-block.dark {
          background: #1a2632;
        }
        .right-block-icon {
          font-size: 1.8rem;
          margin-bottom: 0.75rem;
        }
        h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #212529;
        }
        .right-block.dark h4 {
          color: #e9ecef;
        }
        p {
          font-size: 0.85rem;
          color: #6c757d;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        .right-block-link {
          font-size: 0.85rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
        }
        .right-block.dark .right-block-link {
          color: #66b0ff;
        }
        @media (max-width: 768px) {
          .right-block {
            min-width: auto;
            width: 100%;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}