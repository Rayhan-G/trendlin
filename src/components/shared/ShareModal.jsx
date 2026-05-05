// components/shared/ShareModal.jsx
import { useState, useEffect } from 'react'
import { 
  Twitter, Facebook, Linkedin, Copy, CheckCircle, 
  Link2, Send, MessageCircle, Mail, X, Share2
} from 'lucide-react'

export default function ShareModal({ isOpen, onClose, url, title, onShareTrack }) {
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    // Load share count when modal opens
    fetchShareCount()
  }, [isOpen, url])

  const fetchShareCount = async () => {
    try {
      // You can implement share count tracking here
      const response = await fetch(`/api/shares?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      setShareCount(data.count || 0)
    } catch (err) {
      console.error('Failed to fetch share count:', err)
    }
  }

  const handleShare = async (platform) => {
    let shareUrl = ''
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title || 'Check out this post on Trendlin')

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        if (onShareTrack) onShareTrack('copy')
        return
      default:
        if (navigator.share) {
          await navigator.share({ title, url })
        }
        return
    }

    // Open share window
    window.open(shareUrl, '_blank', 'width=550,height=420,left=300,top=100,noopener,noreferrer')
    
    // Track share
    if (onShareTrack) {
      await onShareTrack(platform)
      setShareCount(prev => prev + 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-modal-title">
            <Share2 size={20} />
            <span>Share this post</span>
          </div>
          <button onClick={onClose} className="share-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="share-modal-body">
          {/* Share Count */}
          {shareCount > 0 && (
            <div className="share-count-badge">
              <span className="share-count-number">{shareCount}</span>
              <span className="share-count-label">shares</span>
            </div>
          )}

          {/* URL Preview */}
          <div className="url-preview">
            <Link2 size={14} />
            <span className="url-text">{url}</span>
          </div>

          {/* Social Platforms */}
          <div className="share-platforms">
            <button onClick={() => handleShare('facebook')} className="share-platform facebook">
              <Facebook size={24} />
              <span>Facebook</span>
            </button>
            <button onClick={() => handleShare('twitter')} className="share-platform twitter">
              <Twitter size={24} />
              <span>Twitter</span>
            </button>
            <button onClick={() => handleShare('linkedin')} className="share-platform linkedin">
              <Linkedin size={24} />
              <span>LinkedIn</span>
            </button>
            <button onClick={() => handleShare('whatsapp')} className="share-platform whatsapp">
              <MessageCircle size={24} />
              <span>WhatsApp</span>
            </button>
            <button onClick={() => handleShare('telegram')} className="share-platform telegram">
              <Send size={24} />
              <span>Telegram</span>
            </button>
            <button onClick={() => handleShare('email')} className="share-platform email">
              <Mail size={24} />
              <span>Email</span>
            </button>
          </div>

          {/* Copy Link */}
          <div className="copy-link-section">
            <div className="copy-link-input">
              <input type="text" value={url} readOnly />
              <button onClick={() => handleShare('copy')} className="copy-btn">
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .share-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .share-modal-container {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .share-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #eef2f6;
        }

        .share-modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .share-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 0.25rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .share-modal-close:hover {
          background: #f1f5f9;
        }

        .share-modal-body {
          padding: 1.5rem;
        }

        .share-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 40px;
          margin-bottom: 1rem;
        }

        .share-count-number {
          font-size: 1rem;
          font-weight: 700;
          color: white;
        }

        .share-count-label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.9);
        }

        .url-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          color: #64748b;
          font-size: 0.75rem;
        }

        .url-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .share-platforms {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .share-platform {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: none;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .share-platform.facebook {
          color: #1877f2;
        }
        .share-platform.facebook:hover {
          background: #1877f210;
        }
        .share-platform.twitter {
          color: #1da1f2;
        }
        .share-platform.twitter:hover {
          background: #1da1f210;
        }
        .share-platform.linkedin {
          color: #0077b5;
        }
        .share-platform.linkedin:hover {
          background: #0077b510;
        }
        .share-platform.whatsapp {
          color: #25d366;
        }
        .share-platform.whatsapp:hover {
          background: #25d36610;
        }
        .share-platform.telegram {
          color: #26a5e4;
        }
        .share-platform.telegram:hover {
          background: #26a5e410;
        }
        .share-platform.email {
          color: #ea4335;
        }
        .share-platform.email:hover {
          background: #ea433510;
        }

        .copy-link-section {
          border-top: 1px solid #eef2f6;
          padding-top: 1rem;
        }

        .copy-link-input {
          display: flex;
          gap: 0.5rem;
        }

        .copy-link-input input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.8rem;
          background: #f8fafc;
          color: #1e293b;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: #7c3aed;
        }

        @media (prefers-color-scheme: dark) {
          .share-modal-container {
            background: #1e293b;
          }
          .share-modal-title {
            color: #f1f5f9;
          }
          .share-modal-header {
            border-bottom-color: #334155;
          }
          .share-modal-close:hover {
            background: #334155;
          }
          .url-preview {
            background: #0f172a;
            color: #94a3b8;
          }
          .copy-link-input input {
            background: #0f172a;
            border-color: #334155;
            color: #f1f5f9;
          }
          .copy-link-section {
            border-top-color: #334155;
          }
        }

        @media (max-width: 480px) {
          .share-platforms {
            grid-template-columns: repeat(2, 1fr);
          }
          .share-modal-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}