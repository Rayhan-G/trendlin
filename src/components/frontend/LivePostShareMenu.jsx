import { useState, useRef, useEffect } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

// Custom icon components
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z"/>
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/>
    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"/>
    <path d="M9.5 13.5c.8 1.2 2 2 3.5 2s2.7-.8 3.5-2"/>
  </svg>
)

export default function ShareMenu({ postId, onShare, shareCount }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) &&
          menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleShare = async (platform) => {
    const url = `${window.location.origin}/live-posts/${postId}`
    const title = encodeURIComponent('Check out this post')
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onShare?.(postId, 'copy')
      setIsOpen(false)
      return
    }
    
    let shareUrl = ''
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(url)}`
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    } else if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${title}%20${encodeURIComponent(url)}`
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      onShare?.(postId, platform)
    }
    
    setIsOpen(false)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num?.toString() || '0'
  }

  return (
    <div className="share-wrapper">
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="share-btn"
        aria-label="Share post"
      >
        <Share2 size={22} />
        <span>{formatNumber(shareCount)}</span>
      </button>
      
      {isOpen && (
        <div ref={menuRef} className="share-menu">
          <button onClick={() => handleShare('copy')} className="share-item">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
          <button onClick={() => handleShare('twitter')} className="share-item">
            <TwitterIcon />
            <span>X (Twitter)</span>
          </button>
          <button onClick={() => handleShare('facebook')} className="share-item">
            <FacebookIcon />
            <span>Facebook</span>
          </button>
          <button onClick={() => handleShare('linkedin')} className="share-item">
            <LinkedInIcon />
            <span>LinkedIn</span>
          </button>
          <button onClick={() => handleShare('whatsapp')} className="share-item">
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </button>
        </div>
      )}
      
      <style jsx>{`
        .share-wrapper {
          position: relative;
          margin-left: auto;
        }
        
        .share-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 8px 12px;
          border-radius: 40px;
          transition: all 0.2s;
        }
        
        .share-btn:hover {
          background: var(--hover-bg);
          transform: scale(1.02);
        }
        
        .share-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          background: var(--dropdown-bg);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 8px;
          min-width: 150px;
          z-index: 100;
          border: 1px solid var(--border-color);
          animation: fadeIn 0.2s ease;
        }
        
        .share-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
          transition: background 0.2s;
        }
        
        .share-item:hover {
          background: var(--hover-bg);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 640px) {
          .share-btn span {
            display: none;
          }
          
          .share-btn {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  )
}