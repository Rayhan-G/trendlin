// src/components/admin/RealTimePreview.js - ALL DEVICES COMPATIBLE

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
        .x-share-btn:active {
          transform: scale(0.95);
        }
        @media (hover: hover) {
          .x-share-btn:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </button>
  );
}

function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const copyLink = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={copyLink} className="copy-btn" aria-label="Copy link">
      {copied ? (
        <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width={isMobile ? 20 : 24} height={isMobile ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          padding: 6px;
          border-radius: 50%;
          transition: all 0.2s ease;
          color: #6c757d;
        }
        .copy-btn:active {
          transform: scale(0.95);
        }
        @media (min-width: 768px) {
          .copy-btn {
            padding: 8px;
          }
        }
        @media (hover: hover) {
          .copy-btn:hover {
            background: #e9ecef;
            transform: translateY(-2px);
          }
          .preview-dark .copy-btn:hover {
            background: #2c3e50;
          }
        }
      `}</style>
    </button>
  );
}

function ShareButtons({ url, title, imageUrl, isFullscreen }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  let iconSize = 32;
  if (isFullscreen && !isMobile) iconSize = 42;
  else if (isMobile) iconSize = 28;
  else if (isTablet) iconSize = 32;
  else iconSize = 34;

  return (
    <div className="share-buttons">
      <span className="share-label">Share</span>
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
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }
        .preview-dark .share-buttons {
          border-bottom-color: #2c3e50;
        }
        .share-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        @media (min-width: 768px) {
          .share-label {
            font-size: 0.85rem;
          }
          .share-buttons {
            gap: 1.5rem;
          }
        }
        .share-icons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (min-width: 768px) {
          .share-icons {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

function RatingPreview({ rating = 4.5, totalRatings = 128, isFullscreen }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

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
            padding: 1.5rem;
            margin-top: 2rem;
            border-top: 1px solid #e9ecef;
          }
          @media (min-width: 768px) {
            .rating-thanks {
              padding: 2rem;
            }
          }
          .preview-dark .rating-thanks { border-top-color: #2c3e50; }
          .rating-stats { margin-bottom: 0.75rem; }
          .stars { color: #f59e0b; letter-spacing: 2px; font-size: 1rem; }
          .rating-number { font-weight: 600; margin-left: 0.5rem; color: #495057; }
          .rating-count { color: #6c757d; font-size: 0.75rem; margin-left: 0.5rem; }
          .preview-dark .rating-number { color: #e9ecef; }
          p { color: #6c757d; font-size: 0.85rem; }
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

      <p className="rating-title">Rate this article?</p>

      <div className="emojis">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`emoji-btn ${value === hoverRating ? 'hover' : ''}`}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingClick(value)}
          >
            <span className="emoji">{emojis[value].emoji}</span>
            <span className="emoji-stars">{emojis[value].stars}</span>
            {!isMobile && <span className="emoji-label">{emojis[value].label}</span>}
          </button>
        ))}
      </div>

      <style jsx>{`
        .rating-section {
          text-align: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 20px;
          margin-top: 2rem;
        }
        @media (min-width: 768px) {
          .rating-section {
            padding: ${isFullscreen ? '2.5rem' : '2rem'};
          }
        }
        .preview-dark .rating-section { background: #1a2632; }
        .existing-ratings {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }
        @media (min-width: 768px) {
          .existing-ratings {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
          }
        }
        .preview-dark .existing-ratings { border-bottom-color: #2c3e50; }
        .stars { color: #f59e0b; letter-spacing: 2px; font-size: 1rem; }
        .rating-number { font-weight: 600; margin-left: 0.5rem; color: #495057; }
        .rating-count { color: #6c757d; font-size: 0.75rem; margin-left: 0.5rem; }
        .preview-dark .rating-number { color: #e9ecef; }
        .rating-title {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #495057;
        }
        @media (min-width: 768px) {
          .rating-title {
            margin-bottom: 1.5rem;
            font-size: 1rem;
          }
        }
        .preview-dark .rating-title { color: #e9ecef; }
        .emojis {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (min-width: 768px) {
          .emojis {
            gap: 1rem;
          }
        }
        .emoji-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          opacity: 0.6;
        }
        @media (min-width: 768px) {
          .emoji-btn {
            padding: 0.75rem 1rem;
            gap: 0.3rem;
            border-radius: 16px;
          }
        }
        .emoji-btn:active {
          transform: scale(0.95);
        }
        .emoji-btn.hover {
          opacity: 1;
          background: rgba(0, 86, 179, 0.1);
          transform: scale(1.05);
        }
        .emoji { font-size: 1.5rem; }
        @media (min-width: 768px) {
          .emoji { font-size: ${isFullscreen ? '3rem' : '2.5rem'}; }
        }
        .emoji-stars { font-size: 0.55rem; color: #f59e0b; letter-spacing: 1px; }
        @media (min-width: 768px) {
          .emoji-stars { font-size: 0.7rem; }
        }
        .emoji-label { font-size: 0.6rem; font-weight: 500; color: #6c757d; }
        @media (min-width: 768px) {
          .emoji-label { font-size: 0.7rem; }
        }
        .preview-dark .emoji-label { color: #a0a0a0; }
      `}</style>
    </div>
  );
}

function RelatedPostsPreview({ category = 'Technology', currentTitle = 'Current Post', isFullscreen }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const mockPosts = [
    { id: 1, title: 'The Future of AI in Content Creation', category, views: 15420, rating: 4.8, date: 'Mar 15, 2024', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400' },
    { id: 2, title: '10 SEO Strategies That Actually Work', category, views: 12350, rating: 4.6, date: 'Mar 10, 2024', image: 'https://images.unsplash.com/photo-1432888622747-f54472e4c5c3?w=400' },
    { id: 3, title: 'Mastering Content Marketing in 2024', category, views: 8920, rating: 4.5, date: 'Mar 5, 2024', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400' },
    { id: 4, title: 'The Complete Guide to Blog Monetization', category, views: 21450, rating: 4.9, date: 'Feb 28, 2024', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400' },
  ];

  let displayCount = 4;
  if (isMobile) displayCount = 2;
  else if (isFullscreen && !isMobile && !isTablet) displayCount = 6;
  else if (isTablet) displayCount = 3;

  return (
    <div className="related-posts">
      <div className="related-header">
        <div className="header-left">
          <span className="header-icon">📚</span>
          <h3>More from {category}</h3>
        </div>
        <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>
          Browse all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </div>
      
      <div className="related-grid">
        {mockPosts.filter(p => p.title !== currentTitle).slice(0, displayCount).map((post, index) => (
          <a key={post.id} href="#" className="related-card" onClick={(e) => e.preventDefault()}>
            {post.image && (
              <div className="related-img">
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>
            )}
            <div className="related-content">
              <div className="related-cat-wrapper">
                <span className="related-cat">{post.category}</span>
                {post.rating >= 4.5 && <span className="trending-badge">🔥</span>}
              </div>
              <h4>{post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title}</h4>
              <div className="related-meta">
                <div className="meta-date">{post.date}</div>
                <div className="meta-views">{post.views?.toLocaleString()}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .related-posts {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
        }
        @media (min-width: 768px) {
          .related-posts {
            margin-top: 3rem;
            padding-top: 2rem;
          }
        }
        .preview-dark .related-posts { border-top-color: #2c3e50; }

        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .related-header {
            margin-bottom: 1.5rem;
          }
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .header-icon { font-size: 1.2rem; }
        h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          color: #1a1a2e;
        }
        @media (min-width: 768px) {
          h3 { font-size: 1.25rem; }
        }
        .preview-dark h3 { color: #ffffff; }
        .view-all {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          background: rgba(0, 86, 179, 0.05);
        }
        @media (min-width: 768px) {
          .view-all {
            gap: 0.5rem;
            font-size: 0.85rem;
            padding: 0.5rem 1rem;
          }
        }
        .preview-dark .view-all { color: #66b0ff; background: rgba(102, 176, 255, 0.1); }

        .related-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 640px) {
          .related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
        @media (min-width: 1024px) and (min-width: 1024px) {
          .related-grid {
            grid-template-columns: repeat(${isFullscreen ? 3 : 2}, 1fr);
            gap: 1.25rem;
          }
        }
        
        .related-card {
          text-decoration: none;
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }
        @media (min-width: 768px) {
          .related-card {
            gap: 1rem;
            padding: 1rem;
            border-radius: 16px;
          }
        }
        .related-card:active {
          transform: scale(0.98);
        }
        .preview-dark .related-card { background: #1a2632; border-color: #2c3e50; }

        .related-img {
          width: 70px;
          height: 60px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 8px;
          background: #f0f0f0;
        }
        @media (min-width: 768px) {
          .related-img {
            width: 100px;
            height: 75px;
            border-radius: 12px;
          }
        }
        .related-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .related-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .related-cat-wrapper {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .related-cat {
          font-size: 0.6rem;
          color: #0056b3;
          text-transform: uppercase;
          font-weight: 700;
          background: rgba(0, 86, 179, 0.1);
          padding: 0.1rem 0.4rem;
          border-radius: 12px;
        }
        .trending-badge {
          font-size: 0.6rem;
        }
        h4 {
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
          line-height: 1.3;
        }
        @media (min-width: 768px) {
          h4 { font-size: 0.85rem; }
        }
        .preview-dark h4 { color: #e9ecef; }

        .related-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .meta-date, .meta-views {
          font-size: 0.55rem;
          color: #6c757d;
        }
        @media (min-width: 768px) {
          .meta-date, .meta-views {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}

function RightBlockPreview() {
  return (
    <div className="right-block">
      <div className="right-block-icon">✨</div>
      <h4>Stay updated</h4>
      <p>Subscribe for latest insights</p>
      <a href="#" className="right-block-link" onClick={(e) => e.preventDefault()}>
        Subscribe →
      </a>

      <style jsx>{`
        .right-block {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .right-block {
            padding: 1.25rem 1.5rem;
            border-radius: 16px;
            margin-bottom: 1.5rem;
          }
        }
        .preview-dark .right-block { background: #1a2632; }
        .right-block-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        h4 {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: #212529;
        }
        p {
          font-size: 0.7rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }
        .right-block-link {
          font-size: 0.75rem;
          color: #0056b3;
          text-decoration: none;
          font-weight: 500;
        }
        .preview-dark .right-block-link { color: #66b0ff; }
      `}</style>
    </div>
  );
}

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
  const [isMobile, setIsMobile] = useState(false);
  
  const previewRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (previewRef.current) {
        if (previewRef.current.requestFullscreen) {
          previewRef.current.requestFullscreen();
        } else if (previewRef.current.webkitRequestFullscreen) {
          previewRef.current.webkitRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

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
      return rawContent.map(block => {
        switch (block.type) {
          case 'heading': return `<h${block.level || 1}>${block.content || ''}</h${block.level || 1}>`;
          case 'paragraph': return `<p>${block.content || ''}</p>`;
          default: return `<p>${block.content || ''}</p>`;
        }
      }).join('');
    }
    
    return '';
  }, []);

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
      <button 
        className="fullscreen-toggle"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={isMobile ? 16 : 20} /> : <Maximize2 size={isMobile ? 16 : 20} />}
      </button>

      {isFullscreen && (
        <button className="exit-fullscreen-btn" onClick={toggleFullscreen}>
          <X size={isMobile ? 20 : 24} />
        </button>
      )}

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <div className="preview-content" ref={contentRef}>
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
              <svg width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <time>{formatDate()}</time>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-item">
              <svg width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12v8H4v-8M12 2v8m0 0-3-3m3 3 3-3"/>
              </svg>
              <span>{readingTime} min read</span>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-item">
              <svg width={isMobile ? 12 : 16} height={isMobile ? 12 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{wordCount?.toLocaleString() || 0} views</span>
            </div>
          </div>
        </header>

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

        <div className={`content-grid ${isFullscreen ? 'fullscreen-grid' : ''}`}>
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
                    {tags.slice(0, isMobile ? 3 : 5).map((tag, index) => (
                      <a key={index} href="#" onClick={(e) => e.preventDefault()} className="tag">
                        #{tag}
                      </a>
                    ))}
                  </div>
                </div>
              </footer>
            )}
          </article>

          <aside className="sidebar">
            <div className="sticky-sidebar">
              <ShareButtons url={postUrl} title={title || 'Check out this post'} imageUrl={featuredImage} isFullscreen={isFullscreen} />
              <RightBlockPreview />
            </div>
          </aside>
        </div>

        <RatingPreview isFullscreen={isFullscreen} />
        <RelatedPostsPreview category={displayCategory} currentTitle={title} isFullscreen={isFullscreen} />
      </div>

      <style jsx>{`
        .preview-wrapper {
          position: relative;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-height: calc(100vh - 100px);
        }
        @media (min-width: 768px) {
          .preview-wrapper {
            border-radius: 24px;
            max-height: calc(100vh - 120px);
          }
        }
        .preview-wrapper.fullscreen {
          max-height: 100vh;
          border-radius: 0;
        }
        .preview-wrapper.preview-dark {
          background: #0a0a0a;
        }
        .view-mobile {
          max-width: 100%;
          margin: 0 auto;
          border-radius: 0;
        }
        @media (min-width: 640px) {
          .view-mobile {
            max-width: 375px;
            border-radius: 36px;
          }
        }
        .view-tablet {
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .view-tablet {
            max-width: 768px;
            margin: 0 auto;
          }
        }

        .fullscreen-toggle {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          color: #1a1a2e;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        @media (min-width: 768px) {
          .fullscreen-toggle {
            top: 12px;
            right: 12px;
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
        }
        .fullscreen-toggle:active {
          transform: scale(0.95);
        }
        .preview-dark .fullscreen-toggle {
          background: rgba(26, 38, 50, 0.9);
          border-color: #2c3e50;
          color: #e9ecef;
        }

        .exit-fullscreen-btn {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: white;
          backdrop-filter: blur(8px);
        }
        @media (min-width: 768px) {
          .exit-fullscreen-btn {
            top: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
          }
        }
        .exit-fullscreen-btn:active {
          transform: scale(0.95);
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
          padding: 1rem;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (min-width: 768px) {
          .preview-content {
            padding: 2rem;
            max-height: calc(100vh - 120px);
          }
        }
        .fullscreen .preview-content {
          max-height: 100vh;
          padding: 1rem;
        }
        @media (min-width: 768px) {
          .fullscreen .preview-content {
            padding: 2rem;
          }
        }
        .view-mobile .preview-content {
          padding: 0.75rem;
        }

        .preview-header {
          margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
          .preview-header {
            margin-bottom: 2rem;
          }
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        @media (min-width: 768px) {
          .breadcrumb {
            font-size: 0.85rem;
            margin-bottom: 1.5rem;
          }
        }
        .breadcrumb a {
          color: #0056b3;
          text-decoration: none;
        }
        .preview-dark .breadcrumb a {
          color: #66b0ff;
        }

        .category-tag {
          margin-bottom: 0.75rem;
        }
        .category-link {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          background: rgba(0, 86, 179, 0.1);
          color: #0056b3;
          text-decoration: none;
          border-radius: 16px;
          font-size: 0.65rem;
          font-weight: 600;
        }
        @media (min-width: 768px) {
          .category-link {
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            border-radius: 20px;
          }
        }

        .post-title {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          color: #1a1a2e;
          line-height: 1.2;
        }
        @media (min-width: 768px) {
          .post-title {
            font-size: clamp(1.8rem, 4vw, 2.5rem);
            margin-bottom: 1rem;
          }
        }
        .preview-dark .post-title {
          color: #ffffff;
        }

        .post-excerpt {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #6c757d;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .post-excerpt {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        @media (min-width: 768px) {
          .post-meta {
            gap: 1rem;
          }
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: #6c757d;
        }
        @media (min-width: 768px) {
          .meta-item {
            gap: 0.5rem;
            font-size: 0.85rem;
          }
        }
        .preview-dark .meta-item {
          color: #a0a0a0;
        }
        .meta-divider {
          width: 3px;
          height: 3px;
          background: #6c757d;
          border-radius: 50%;
        }
        @media (min-width: 768px) {
          .meta-divider {
            width: 4px;
            height: 4px;
          }
        }

        .featured-image {
          margin: 1rem 0 1.5rem;
          border-radius: 16px;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .featured-image {
            margin: 1.5rem 0 2rem;
            border-radius: 20px;
          }
        }
        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        .featured-video {
          aspect-ratio: 16/9;
          margin: 1rem 0 1.5rem;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
        }
        @media (min-width: 768px) {
          .featured-video {
            margin: 1.5rem 0 2rem;
            border-radius: 20px;
          }
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr 280px;
            gap: 2rem;
          }
        }

        .article-content {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #2c3e50;
        }
        @media (min-width: 768px) {
          .article-content {
            font-size: 1rem;
            line-height: 1.7;
          }
        }
        .preview-dark .article-content {
          color: #d1d5db;
        }
        .article-content p {
          margin-bottom: 1rem;
        }
        .article-content h2 {
          font-size: 1.2rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        @media (min-width: 768px) {
          .article-content h2 {
            font-size: 1.6rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1rem 0;
        }

        .post-footer {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }
        @media (min-width: 768px) {
          .post-footer {
            margin-top: 2rem;
            padding-top: 1.5rem;
          }
        }
        .post-tags {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .tags-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #6c757d;
        }
        .tag {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          background: #f0f0f0;
          color: #495057;
          text-decoration: none;
          border-radius: 16px;
          font-size: 0.6rem;
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
          padding: 2rem;
          color: #94a3b8;
          font-style: italic;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}