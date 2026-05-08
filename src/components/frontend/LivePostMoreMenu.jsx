import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Flag, Ban, Copy, Link2 } from 'lucide-react'

export default function MoreMenu({ postId }) {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleReport = () => {
    console.log('Report post:', postId)
    setIsOpen(false)
    // Implement report modal/dialog
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/live-posts/${postId}`
    await navigator.clipboard.writeText(url)
    setIsOpen(false)
    // Show success toast
  }

  return (
    <div className="more-menu-wrapper">
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="more-btn"
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreHorizontal size={20} />
      </button>
      
      {isOpen && (
        <div ref={menuRef} className="more-menu" role="menu">
          <button onClick={handleCopyLink} className="more-item" role="menuitem">
            <Copy size={14} />
            Copy link
          </button>
          <button onClick={handleReport} className="more-item" role="menuitem">
            <Flag size={14} />
            Report
          </button>
          <button onClick={() => {}} className="more-item" role="menuitem">
            <Ban size={14} />
            Hide
          </button>
        </div>
      )}
      
      <style jsx>{`
        .more-menu-wrapper {
          position: relative;
        }
        
        .more-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(8px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        
        .more-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }
        
        .more-menu {
          position: absolute;
          top: 48px;
          right: 0;
          background: var(--dropdown-bg);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          padding: 8px;
          min-width: 140px;
          z-index: 100;
          border: 1px solid var(--border-color);
          animation: fadeIn 0.2s ease;
        }
        
        .more-item {
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
        
        .more-item:hover {
          background: var(--hover-bg);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}