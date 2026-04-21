// src/components/admin/RealTimePreview.js - WITH FULLSCREEN TOGGLE
import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
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
} from 'react-share';
import { XLogo } from '@phosphor-icons/react';
import { Maximize2, Minimize2, X } from 'lucide-react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// ============================================================
// X (Twitter) Share Button
// ============================================================
function XShareButton({ url, title, children }) {
  const handleClick = (e) => {
    e.preventDefault();
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420,noopener,noreferrer');
  };
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
  );
}

// ============================================================
// Copy Link Button
// ============================================================
function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
        .preview-dark .copy-btn:hover {
          background: #2c3e50;
        }
      `}</style>
    </button>
  );
}

// ============================================================
// Share Buttons Component
// ============================================================
function ShareButtons({ url, title, imageUrl, isFullscreen }) {
  const iconSize = isFullscreen ? 42 : 34;

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
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .preview-dark .share-buttons {
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
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Rating Section Component (Preview)
// ============================================================
function RatingPreview({ rating = 4.5, totalRatings = 128, isFullscreen }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const emojis = {
    1: { emoji: '😤', label: 'Hated It', stars: '★', color: '#ef4444' },
    2: { emoji: '😕', label: 'Off', stars: '★★', color: '#f59e0b' },
    3: { emoji: '😐', label: 'Meh', stars: '★★★', color: '#6b7280' },
    4: { emoji: '😊', label: 'Good', stars: '★★★★', color: '#10b981' },
    5: { emoji: '😍', label: 'Love It', stars: '★★★★★', color: '#ec4899' }
  };

  const handleRatingClick = (value) => {
    setSelectedRating(value);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rating-thanks">
        <div className="rating-stats">
          <span className="stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
          <span className="rating-number">{rating.toFixed(1)}</span>
          <span className="rating-count">({totalRatings} ratings)</span>
        </div>
        <p>Thanks for your feedback! ❤️</p>
        <style jsx>{`
          .rating-thanks {
            text-align: center;
            padding: 2rem;
            margin-top: 2rem;
            border-top: 1px solid #e9ecef;
          }
          .preview-dark .rating-thanks { border-top-color: #2c3e50; }
          .rating-stats { margin-bottom: 0.75rem; }
          .stars { color: #f59e0b; letter-spacing: 2px; font-size: 1.1rem; }
          .rating-number { font-weight: 600; margin-left: 0.5rem; color: #495057; }
          .rating-count { color: #6c757d; font-size: 0.85rem; margin-left: 0.5rem; }
          .preview-dark .rating-number { color: #e9ecef; }
          p { color: #6c757d; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rating-section">
      <div className="existing-ratings">
        <span className="stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
        <span className="rating-number">{rating.toFixed(1)}</span>
        <span className="rating-count">({totalRatings} ratings)</span>
      </div>

      <p className="rating-title">How did you feel about this article?</p>

      <div className="emojis">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`emoji-btn ${value === hoverRating ? 'hover' : ''}`}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingClick(value)}
            style={{ '--emoji-color': emojis[value].color }}
          >
            <span className="emoji">{emojis[value].emoji}</span>
            <span className="emoji-stars">{emojis[value].stars}</span>
            <span className="emoji-label">{emojis[value].label}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .rating-section {
          text-align: center;
          padding: ${isFullscreen ? '2.5rem' : '2rem'};
          background: #f8f9fa;
          border-radius: 20px;
          margin-top: 2rem;
        }
        .preview-dark .rating-section { background: #1a2632; }
        .existing-ratings {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .preview-dark .existing-ratings { border-bottom-color: #2c3e50; }
        .stars { color: #f59e0b; letter-spacing: 2px; font-size: 1.1rem; }
        .rating-number { font-weight: 600; margin-left: 0.5rem; color: #495057; }
        .rating-count { color: #6c757d; font-size: 0.85rem; margin-left: 0.5rem; }
        .preview-dark .rating-number { color: #e9ecef; }
        .rating-title {
          margin-bottom: 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          color: #495057;
        }
        .preview-dark .rating-title { color: #e9ecef; }
        .emojis {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
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
        .emoji-btn.hover {
          opacity: 1;
          background: rgba(0, 86, 179, 0.1);
          transform: scale(1.05);
        }
        .emoji-btn:hover {
          opacity: 1;
          transform: scale(1.05);
        }
        .emoji { font-size: ${isFullscreen ? '3rem' : '2.5rem'}; }
        .emoji-stars { font-size: 0.7rem; color: #f59e0b; letter-spacing: 1px; }
        .emoji-label { font-size: 0.7rem; font-weight: 500; color: #6c757d; }
        .preview-dark .emoji-label { color: #a0a0a0; }
        @media (max-width: 768px) {
          .rating-section { padding: 1.5rem; }
          .emoji { font-size: 1.8rem; }
          .emoji-label { font-size: 0.55rem; }
          .emoji-stars { font-size: 0.55rem; }
          .emoji-btn { padding: 0.5rem 0.6rem; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Related Posts Preview
// ============================================================
function RelatedPostsPreview({ category = 'Technology', currentTitle = 'Current Post', isFullscreen }) {
  const mockPosts = [
    { id: 1, title: 'The Future of AI in Content Creation', category, views: 15420, rating: 4.8, date: 'Mar 15, 2024', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400' },
    { id: 2, title: '10 SEO Strategies That Actually Work', category, views: 12350, rating: 4.6, date: 'Mar 10, 2024', image: 'https://images.unsplash.com/photo-1432888622747-f54472e4c5c3?w=400' },
    { id: 3, title: 'Mastering Content Marketing in 2024', category, views: 8920, rating: 4.5, date: 'Mar 5, 2024', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' },
    { id: 4, title: 'The Complete Guide to Blog Monetization', category, views: 21450, rating: 4.9, date: 'Feb 28, 2024', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400' },
  ];

  return (
    <div className="related-posts">
      <div className="related-header">
        <div className="header-left">
          <span className="header-icon">📚</span>
          <h3>More from {category}</h3>
        </div>
        <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>
          Browse all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </div>
      
      <div className={`related-grid ${isFullscreen ? 'fullscreen-grid' : ''}`}>
        {mockPosts.filter(p => p.title !== currentTitle).slice(0, isFullscreen ? 6 : 4).map((post, index) => (
          <a key={post.id} href="#" className="related-card" onClick={(e) => e.preventDefault()} style={{ animationDelay: `${index * 0.1}s` }}>
            {post.image && (
              <div className="related-img">
                <img src={post.image} alt={post.title} loading="lazy" />
                <div className="img-overlay"></div>
              </div>
            )}
            <div className="related-content">
              <div className="related-cat-wrapper">
                <span className="related-cat">{post.category}</span>
                {post.rating >= 4.5 && <span className="trending-badge">🔥 Trending</span>}
              </div>
              <h4>{post.title}</h4>
              <div className="related-meta">
                <div className="meta-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{post.date}</span>
                </div>
                <div className="meta-views">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{post.views?.toLocaleString()}</span>
                </div>
                <div className="meta-rating">
                  <span className="rating-stars">{'★'.repeat(Math.round(post.rating))}</span>
                  <span>{post.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="read-more">
                Read article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .related-posts {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
          position: relative;
        }
        .related-posts::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #0056b3, #00a6ff);
          border-radius: 3px;
        }
        .preview-dark .related-posts { border-top-color: #2c3e50; }
        .preview-dark .related-posts::before { background: linear-gradient(90deg, #66b0ff, #00a6ff); }

        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .header-icon { font-size: 1.5rem; }
        h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: #1a1a2e;
        }
        .preview-dark h3 { color: #ffffff; }
        .view-all {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 40px;
          background: rgba(0, 86, 179, 0.05);
        }
        .preview-dark .view-all { color: #66b0ff; background: rgba(102, 176, 255, 0.1); }
        .view-all:hover { background: rgba(0, 86, 179, 0.1); }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .fullscreen-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        .related-card {
          text-decoration: none;
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }
        .preview-dark .related-card { background: #1a2632; border-color: #2c3e50; }
        .related-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          border-color: #0056b3;
        }

        .related-img {
          width: 100px;
          height: 75px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #f0f0f0;
        }
        .related-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .related-card:hover .related-img img { transform: scale(1.05); }

        .related-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .related-cat-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .related-cat {
          font-size: 0.65rem;
          color: #0056b3;
          text-transform: uppercase;
          font-weight: 700;
          background: rgba(0, 86, 179, 0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }
        .trending-badge {
          font-size: 0.6rem;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 0.15rem 0.4rem;
          border-radius: 20px;
        }
        h4 {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .preview-dark h4 { color: #e9ecef; }

        .related-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .meta-date, .meta-views, .meta-rating {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.6rem;
          color: #6c757d;
        }
        .rating-stars { color: #f59e0b; letter-spacing: 1px; }

        .read-more {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.65rem;
          font-weight: 600;
          color: #0056b3;
          opacity: 0;
          transition: all 0.2s;
        }
        .related-card:hover .read-more { opacity: 1; }

        @media (max-width: 1024px) {
          .fullscreen-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .related-grid { grid-template-columns: 1fr; }
          .fullscreen-grid { grid-template-columns: 1fr; }
          h4 { font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Right Block Preview
// ============================================================
function RightBlockPreview() {
  return (
    <div className="right-block">
      <div className="right-block-icon">✨</div>
      <h4>Want to stay updated?</h4>
      <p>Subscribe to our newsletter for the latest insights and trends.</p>
      <a href="#" className="right-block-link" onClick={(e) => e.preventDefault()}>
        Subscribe now →
      </a>

      <style jsx>{`
        .right-block {
          padding: 1.25rem 1.5rem;
          background: #f8f9fa;
          border-radius: 16px;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .preview-dark .right-block { background: #1a2632; }
        .right-block-icon { font-size: 1.8rem; margin-bottom: 0.75rem; }
        h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #212529;
        }
        .preview-dark h4 { color: #e9ecef; }
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
        .preview-dark .right-block-link { color: #66b0ff; }
      `}</style>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT WITH FULLSCREEN
// ============================================================
export default function RealTimePreview({ 
  title, 
  content, 
  excerpt,
  featuredImage, 
  featuredVideo, 
  tags = [],
  category = 'Technology',
  readingTime: propReadingTime,
  wordCount,
  view = 'desktop' 
}) {
  const [htmlContent, setHtmlContent] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const previewRef = useRef(null);
  const contentRef = useRef(null);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (previewRef.current) {
        if (previewRef.current.requestFullscreen) {
          previewRef.current.requestFullscreen();
        } else if (previewRef.current.webkitRequestFullscreen) {
          previewRef.current.webkitRequestFullscreen();
        } else if (previewRef.current.msRequestFullscreen) {
          previewRef.current.msRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const winScroll = element.scrollTop;
        const height = element.scrollHeight - element.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        setScrollProgress(scrolled);
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const processContent = useCallback((rawContent) => {
    if (!rawContent) return '';
    
    if (typeof rawContent === 'string') {
      return DOMPurify.sanitize(rawContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img', 'span', 'div', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel']
      });
    }
    
    if (Array.isArray(rawContent)) {
      return blocksToHtml(rawContent);
    }
    
    if (rawContent.blocks && Array.isArray(rawContent.blocks)) {
      return blocksToHtml(rawContent.blocks);
    }
    
    return '';
  }, []);

  const blocksToHtml = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks.map(block => {
      switch (block.type) {
        case 'heading':
          return `<h${block.level || 1}>${block.content || block.text || ''}</h${block.level || 1}>`;
        case 'paragraph':
          return `<p>${block.content || block.text || ''}</p>`;
        case 'bulletList':
          return `<ul>${(block.children || block.items || []).map(item => `<li>${item.content || item.text || ''}</li>`).join('')}</ul>`;
        case 'numberedList':
          return `<ol>${(block.children || block.items || []).map(item => `<li>${item.content || item.text || ''}</li>`).join('')}</ol>`;
        case 'blockquote':
          return `<blockquote>${block.content || block.text || ''}</blockquote>`;
        case 'codeBlock':
          return `<pre><code>${block.content || block.text || ''}</code></pre>`;
        case 'image':
          return `<img src="${block.url || block.src || ''}" alt="${block.alt || ''}" />`;
        case 'video':
          return `<div class="video-embed"><iframe src="${block.url || ''}" frameborder="0" allowfullscreen></iframe></div>`;
        default:
          return `<p>${block.content || block.text || ''}</p>`;
      }
    }).join('');
  };

  useEffect(() => {
    if (content && isClient) {
      const processed = processContent(content);
      setHtmlContent(processed);
      setSanitizedContent(processed);
    }
  }, [content, isClient, processContent]);

  const getReadingTime = () => {
    if (propReadingTime) return propReadingTime;
    const text = htmlContent.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const postUrl = `https://trendlin.com/blog/preview-post`;
  const readingTime = getReadingTime();
  const displayCategory = category || tags[0] || 'Blog';

  return (
    <div 
      ref={previewRef}
      className={`preview-wrapper ${isDarkMode ? 'preview-dark' : 'preview-light'} view-${view} ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Fullscreen Toggle Button */}
      <button 
        className="fullscreen-toggle"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      {/* Exit Fullscreen Button (only visible in fullscreen) */}
      {isFullscreen && (
        <button 
          className="exit-fullscreen-btn"
          onClick={toggleFullscreen}
          title="Exit Fullscreen"
        >
          <X size={24} />
        </button>
      )}

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <div className="preview-content" ref={contentRef}>
        {/* Header */}
        <header className="preview-header">
          <nav className="breadcrumb">
            <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
            <span className="separator">/</span>
            <a href="#" onClick={(e) => e.preventDefault()}>{displayCategory}</a>
            <span className="separator">/</span>
            <span className="current">{title?.slice(0, 30) || 'Post'}</span>
          </nav>
          
          <div className="category-tag">
            <a href="#" onClick={(e) => e.preventDefault()} className="category-link">
              {displayCategory}
            </a>
          </div>
          
          <h1 className="post-title">{title || 'Untitled Post'}</h1>
          
          {excerpt && <p className="post-excerpt">{excerpt}</p>}
          
          <div className="post-meta">
            <div className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <time>{formatDate()}</time>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12v8H4v-8M12 2v8m0 0-3-3m3 3 3-3"/>
              </svg>
              <span>{readingTime} min read</span>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{wordCount?.toLocaleString() || 0} views</span>
            </div>
          </div>
        </header>

        {/* Featured Image/Video */}
        {featuredVideo?.url && isClient && (
          <div className="featured-video">
            <ReactPlayer url={featuredVideo.url} width="100%" height="100%" controls light={featuredVideo.thumbnailUrl} />
          </div>
        )}
        
        {featuredImage && !featuredVideo?.url && (
          <div className="featured-image">
            <img src={typeof featuredImage === 'string' ? featuredImage : featuredImage?.url} alt={title || 'Featured'} />
          </div>
        )}

        {/* Content Grid */}
        <div className={`content-grid ${isFullscreen ? 'fullscreen-grid' : ''}`}>
          {/* Main Content */}
          <article className="main-content">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizedContent || '<p class="empty-preview">Start writing to see your content preview...</p>' }} 
            />
            
            {tags.length > 0 && (
              <footer className="post-footer">
                <div className="post-tags">
                  <span className="tags-label">Tags:</span>
                  <div className="tags-list">
                    {tags.map((tag, index) => (
                      <a key={index} href="#" onClick={(e) => e.preventDefault()} className="tag">
                        #{tag}
                      </a>
                    ))}
                  </div>
                </div>
              </footer>
            )}
          </article>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sticky-sidebar">
              <ShareButtons url={postUrl} title={title || 'Check out this post'} imageUrl={featuredImage} isFullscreen={isFullscreen} />
              <RightBlockPreview />
            </div>
          </aside>
        </div>

        {/* Rating Section */}
        <RatingPreview isFullscreen={isFullscreen} />

        {/* Related Posts */}
        <RelatedPostsPreview category={displayCategory} currentTitle={title} isFullscreen={isFullscreen} />
      </div>

      <style jsx>{`
        .preview-wrapper {
          position: relative;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-height: calc(100vh - 120px);
        }
        .preview-wrapper.fullscreen {
          max-height: 100vh;
          border-radius: 0;
        }
        .preview-wrapper.preview-dark {
          background: #0a0a0a;
        }
        .view-mobile {
          max-width: 375px;
          margin: 0 auto;
          border-radius: 36px;
        }
        .view-tablet {
          max-width: 768px;
          margin: 0 auto;
        }

        .fullscreen-toggle {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e9ecef;
          border-radius: 12px;
          cursor: pointer;
          color: #1a1a2e;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .preview-dark .fullscreen-toggle {
          background: rgba(26, 38, 50, 0.9);
          border-color: #2c3e50;
          color: #e9ecef;
        }
        .fullscreen-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }
        .fullscreen .fullscreen-toggle {
          top: 20px;
          right: 20px;
        }

        .exit-fullscreen-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: white;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .exit-fullscreen-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }

        .progress-bar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(0,0,0,0.05);
          z-index: 10;
        }
        .preview-dark .progress-bar {
          background: rgba(255,255,255,0.05);
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0056b3, #00a6ff);
          width: 0%;
          transition: width 0.1s ease;
        }

        .preview-content {
          padding: 2.5rem 2rem;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }
        .fullscreen .preview-content {
          max-height: 100vh;
          padding: 3rem 3rem;
        }
        .view-mobile .preview-content {
          padding: 1.5rem 1rem;
        }

        .preview-header {
          margin-bottom: 2rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .breadcrumb a {
          color: #0056b3;
          text-decoration: none;
        }
        .preview-dark .breadcrumb a {
          color: #66b0ff;
        }
        .breadcrumb .separator {
          color: #6c757d;
        }
        .breadcrumb .current {
          color: #6c757d;
        }

        .category-tag {
          margin-bottom: 1rem;
        }
        .category-link {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 86, 179, 0.1);
          color: #0056b3;
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .preview-dark .category-link {
          background: rgba(102, 176, 255, 0.15);
          color: #66b0ff;
        }

        .post-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
          color: #1a1a2e;
          line-height: 1.2;
        }
        .fullscreen .post-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
        }
        .preview-dark .post-title {
          color: #ffffff;
        }

        .post-excerpt {
          font-size: 1rem;
          line-height: 1.6;
          color: #6c757d;
          margin-bottom: 1.5rem;
        }
        .fullscreen .post-excerpt {
          font-size: 1.2rem;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #6c757d;
        }
        .preview-dark .meta-item {
          color: #a0a0a0;
        }
        .meta-divider {
          width: 4px;
          height: 4px;
          background: #6c757d;
          border-radius: 50%;
        }

        .featured-image {
          margin: 1.5rem 0 2rem;
          border-radius: 20px;
          overflow: hidden;
        }
        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        .featured-video {
          aspect-ratio: 16/9;
          margin: 1.5rem 0 2rem;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2rem;
        }
        .fullscreen-grid {
          grid-template-columns: 1fr 320px;
          gap: 3rem;
        }
        .view-mobile .content-grid {
          grid-template-columns: 1fr;
        }
        .view-tablet .content-grid {
          grid-template-columns: 1fr 250px;
        }

        .article-content {
          font-size: 1rem;
          line-height: 1.7;
          color: #2c3e50;
        }
        .fullscreen .article-content {
          font-size: 1.125rem;
        }
        .preview-dark .article-content {
          color: #d1d5db;
        }
        .article-content p {
          margin-bottom: 1.25rem;
        }
        .article-content h2 {
          font-size: 1.6rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #1a1a2e;
        }
        .fullscreen .article-content h2 {
          font-size: 2rem;
        }
        .preview-dark .article-content h2 {
          color: #ffffff;
        }
        .article-content h3 {
          font-size: 1.3rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #1a1a2e;
        }
        .preview-dark .article-content h3 {
          color: #ffffff;
        }
        .article-content a {
          color: #0056b3;
          text-decoration: underline;
        }
        .preview-dark .article-content a {
          color: #66b0ff;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
        }
        .article-content ul, .article-content ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }
        .article-content blockquote {
          border-left: 4px solid #0056b3;
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6c757d;
        }
        .preview-dark .article-content blockquote {
          border-left-color: #66b0ff;
          color: #a0a0a0;
        }
        .article-content pre {
          background: #1a1a2e;
          color: #e9ecef;
          padding: 1.25rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .post-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
        }
        .preview-dark .post-footer {
          border-top-color: #2c3e50;
        }
        .post-tags {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .tags-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6c757d;
        }
        .tags-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .tag {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          background: #f0f0f0;
          color: #495057;
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.7rem;
        }
        .preview-dark .tag {
          background: #1a1a2e;
          color: #a0a0a0;
        }

        .sidebar {
          position: relative;
        }
        .sticky-sidebar {
          position: sticky;
          top: 20px;
        }

        .empty-preview {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .preview-content {
            padding: 1.5rem 1rem;
          }
          .fullscreen .preview-content {
            padding: 2rem 1.5rem;
          }
          .post-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}