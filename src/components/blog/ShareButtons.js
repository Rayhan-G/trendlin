import { useState, useEffect } from 'react'
import {
  FacebookShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
  FacebookIcon,
  LinkedinIcon,
  PinterestIcon,
  RedditIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
} from 'react-share'
import { XLogo } from '@phosphor-icons/react'

// X (Twitter) Share Button
function XShareButton({ url, title, children }) {
  const handleClick = (e) => {
    e.preventDefault()
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    window.open(shareUrl, '_blank', 'width=550,height=420,noopener,noreferrer')
  }
  return (
    <button onClick={handleClick} className="x-share-btn">
      {children}
      <style jsx>{`
        .x-share-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .x-share-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </button>
  )
}

// Copy Link Button
function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copyLink} className="copy-btn" aria-label="Copy link">
      {copied ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
      <style jsx>{`
        .copy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
          color: #6c757d;
        }
        .copy-btn:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }
        :global(html.dark) .copy-btn:hover {
          background: #2c3e50;
        }
      `}</style>
    </button>
  )
}

export default function ShareButtons({ url, title, imageUrl }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      observer.disconnect()
    }
  }, [])

  const iconSize = isMobile ? 34 : 42

  return (
    <div className="share-buttons">
      <span className="share-label">Share this article</span>
      <div className="share-icons">
        <XShareButton url={url} title={title}>
          <XLogo size={iconSize} weight="fill" />
        </XShareButton>
        
        <FacebookShareButton url={url} quote={title}>
          <FacebookIcon size={iconSize} round />
        </FacebookShareButton>
        
        <LinkedinShareButton url={url} title={title}>
          <LinkedinIcon size={iconSize} round />
        </LinkedinShareButton>
        
        <PinterestShareButton url={url} media={imageUrl} description={title}>
          <PinterestIcon size={iconSize} round />
        </PinterestShareButton>
        
        <RedditShareButton url={url} title={title}>
          <RedditIcon size={iconSize} round />
        </RedditShareButton>
        
        <WhatsappShareButton url={url} title={title}>
          <WhatsappIcon size={iconSize} round />
        </WhatsappShareButton>
        
        <TelegramShareButton url={url} title={title}>
          <TelegramIcon size={iconSize} round />
        </TelegramShareButton>
        
        <EmailShareButton url={url} subject={title} body={`Check out this article: ${url}`}>
          <EmailIcon size={iconSize} round />
        </EmailShareButton>
        
        <CopyLinkButton url={url} />
      </div>

      <style jsx>{`
        .share-buttons {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        :global(html.dark) .share-buttons {
          border-bottom-color: #2c3e50;
        }
        .share-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .share-icons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .share-buttons {
            gap: 1rem;
          }
          .share-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}