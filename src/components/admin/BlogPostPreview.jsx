// src/components/admin/BlogPostPreview.jsx
import { useEffect, useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import RatingSection from '@/components/blog/RatingSection';
import ShareButtons from '@/components/blog/ShareButtons';
import RightBlock from '@/components/blog/RightBlock';
import RelatedPosts from '@/components/blog/RelatedPosts';

// Helper functions (exactly matching your blog post)
const getReadingTime = (content) => {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
};

const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function BlogPostPreview({ 
  title, 
  content, 
  excerpt,
  featuredImage,
  tags = [],
  category = 'Blog',
  readingTime: propReadingTime,
  author = 'Admin',
  publishedAt = new Date().toISOString()
}) {
  const [readingTime, setReadingTime] = useState(1);
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 100;
    setIsScrolled(scrolled);
    
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolledProgress = height > 0 ? (winScroll / height) * 100 : 0;
    setScrollProgress(scrolledProgress);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    setReadingTime(propReadingTime || getReadingTime(content));
    
    if (content) {
      const clean = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 
                       'ul', 'ol', 'li', 'a', 'img', 'span', 'div', 'blockquote', 
                       'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                       'iframe', 'figure', 'figcaption', 'hr'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 
                       'title', 'width', 'height', 'frameborder', 'allowfullscreen']
      });
      setSanitizedContent(clean);
    }
  }, [content, propReadingTime]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    window.addEventListener('scroll', handleScroll);
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [handleScroll]);

  if (!isMounted) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">T</div>
          <div className="loading-spinner"></div>
          <p>Loading preview...</p>
        </div>
        <style jsx>{`
          .loading-screen { padding: 4rem; text-align: center; }
          .loading-logo { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #0056b3, #00a6ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .loading-spinner { width: 30px; height: 30px; border: 2px solid #e9ecef; border-top-color: #0056b3; border-radius: 50%; animation: spin 0.6s linear infinite; margin: 1rem auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const postUrl = `https://trendlin.com/blog/preview-post`;
  const publishedDate = publishedAt;
  const postCategory = category?.toLowerCase() || 'general';
  const displayTags = Array.isArray(tags) ? tags : [];

  return (
    <div className={`blog-post-preview ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <div className="container">
        {/* Header Section */}
        <header className="header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/" onClick={(e) => e.preventDefault()}>Home</a>
            <span className="separator">/</span>
            <a href={`/category/${postCategory}`} onClick={(e) => e.preventDefault()}>{category}</a>
            <span className="separator">/</span>
            <span className="current" aria-current="page">{title || 'Preview'}</span>
          </nav>
          
          <div className="category-tag">
            <a href={`/category/${postCategory}`} onClick={(e) => e.preventDefault()} className="category-link">
              {category}
            </a>
          </div>
          
          <h1 className="post-title">{title || 'Untitled Post'}</h1>
          
          {excerpt && (
            <p className="post-excerpt">{excerpt}</p>
          )}
          
          <div className="post-meta">
            <div className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
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
              <span>0 views</span>
            </div>
            {author && (
              <>
                <div className="meta-divider"></div>
                <div className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{author}</span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage && (
          <div className="featured-image">
            <div className="image-wrapper">
              <img 
                src={featuredImage} 
                alt={title || 'Featured'}
                loading="eager"
                fetchpriority="high"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="content-grid">
          {/* Main Content */}
          <article className="main-content">
            <div className="content-wrapper">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: sanitizedContent || '<p class="empty-preview">Start writing to see your content preview exactly as it will appear on your blog...</p>' }}
              />
              
              {/* Post Footer */}
              <footer className="post-footer">
                {displayTags.length > 0 && (
                  <div className="post-tags">
                    <span className="tags-label">Tags:</span>
                    <div className="tags-list">
                      {displayTags.map((tag, index) => (
                        <a key={index} href={`/tag/${tag.toLowerCase()}`} onClick={(e) => e.preventDefault()} className="tag">
                          #{tag}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </footer>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sticky-sidebar">
              <ShareButtons url={postUrl} title={title || 'Preview Post'} imageUrl={featuredImage || postUrl} />
              <RightBlock postSlug="preview" />
            </div>
          </aside>
        </div>

        {/* Rating Section */}
        <RatingSection postSlug="preview" postTitle={title || 'Preview Post'} />

        {/* Related Posts */}
        <RelatedPosts 
          currentPostId="preview" 
          currentCategory={category}
        />
      </div>

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-top ${isScrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>

      <style jsx>{`
        .blog-post-preview {
          min-height: 100vh;
          background: #ffffff;
          transition: background 0.3s ease;
          width: 100%;
          overflow-x: hidden;
        }
        .blog-post-preview.dark {
          background: #0a0a0a;
        }

        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(0,0,0,0.05);
          z-index: 1001;
        }
        .blog-post-preview.dark .progress-bar {
          background: rgba(255,255,255,0.05);
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0056b3, #00a6ff);
          width: 0%;
          transition: width 0.3s ease-out;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem;
          width: 100%;
          overflow-x: hidden;
        }

        .header {
          text-align: left;
          margin-bottom: 3rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .breadcrumb a {
          color: #0056b3;
          text-decoration: none;
          cursor: pointer;
        }
        .blog-post-preview.dark .breadcrumb a {
          color: #66b0ff;
        }
        .breadcrumb a:hover {
          text-decoration: underline;
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
          letter-spacing: 0.5px;
          cursor: pointer;
        }
        .blog-post-preview.dark .category-link {
          background: rgba(102, 176, 255, 0.15);
          color: #66b0ff;
        }
        .category-link:hover {
          background: rgba(0, 86, 179, 0.2);
          transform: translateY(-1px);
        }

        .post-title {
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 800;
          margin-bottom: 1rem;
          color: #1a1a2e;
          line-height: 1.2;
          letter-spacing: -0.02em;
          word-wrap: break-word;
        }
        .blog-post-preview.dark .post-title {
          color: #ffffff;
        }

        .post-excerpt {
          font-size: 1.125rem;
          line-height: 1.6;
          color: #6c757d;
          margin-bottom: 1.5rem;
          max-width: 800px;
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
          font-size: 0.9rem;
          color: #6c757d;
        }
        .blog-post-preview.dark .meta-item {
          color: #a0a0a0;
        }
        .meta-item svg {
          stroke: currentColor;
        }
        .meta-divider {
          width: 4px;
          height: 4px;
          background: #6c757d;
          border-radius: 50%;
        }

        .featured-image {
          margin: 2rem 0 3rem;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .image-wrapper {
          position: relative;
          width: 100%;
          background: #f0f0f0;
        }
        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 3rem;
        }

        .article-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #2c3e50;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .blog-post-preview.dark .article-content {
          color: #d1d5db;
        }
        .article-content p {
          margin-bottom: 1.5rem;
        }
        .article-content h2 {
          font-size: clamp(1.5rem, 4vw, 2rem);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #1a1a2e;
        }
        .blog-post-preview.dark .article-content h2 {
          color: #ffffff;
        }
        .article-content h3 {
          font-size: clamp(1.2rem, 3.5vw, 1.5rem);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #1a1a2e;
        }
        .blog-post-preview.dark .article-content h3 {
          color: #ffffff;
        }
        .article-content a {
          color: #0056b3;
          text-decoration: underline;
          text-underline-offset: 4px;
          word-wrap: break-word;
        }
        .blog-post-preview.dark .article-content a {
          color: #66b0ff;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          margin: 2rem 0;
        }
        .article-content ul, .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.75rem;
        }
        .article-content li {
          margin: 0.5rem 0;
        }
        .article-content blockquote {
          border-left: 4px solid #0056b3;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6c757d;
        }
        .blog-post-preview.dark .article-content blockquote {
          border-left-color: #66b0ff;
          color: #a0a0a0;
        }
        .article-content code {
          background: #f0f0f0;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: monospace;
          word-wrap: break-word;
        }
        .blog-post-preview.dark .article-content code {
          background: #1a1a2e;
          color: #e9ecef;
        }
        .article-content pre {
          background: #1a1a2e;
          color: #e9ecef;
          padding: 1.5rem;
          border-radius: 16px;
          overflow-x: auto;
          margin: 2rem 0;
        }
        .article-content pre code {
          background: none;
          padding: 0;
        }

        .empty-preview {
          text-align: center;
          padding: 4rem;
          background: #f8f9fa;
          border-radius: 16px;
          color: #adb5bd;
          font-style: italic;
        }

        .post-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }
        .blog-post-preview.dark .post-footer {
          border-top-color: #2c3e50;
        }
        .post-tags {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .tags-label {
          font-size: 0.85rem;
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
          padding: 0.25rem 0.75rem;
          background: #f0f0f0;
          color: #495057;
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .blog-post-preview.dark .tag {
          background: #1a1a2e;
          color: #a0a0a0;
        }
        .tag:hover {
          background: #e0e0e0;
          transform: translateY(-1px);
        }

        .sidebar {
          position: relative;
        }
        .sticky-sidebar {
          position: sticky;
          top: 100px;
        }

        .scroll-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          color: #0056b3;
          border: 1px solid #e9ecef;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 100;
        }
        .blog-post-preview.dark .scroll-top {
          background: #1a1a2e;
          color: #66b0ff;
          border-color: #2c3e50;
        }
        .scroll-top.visible {
          opacity: 1;
          visibility: visible;
        }
        .scroll-top:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        /* Responsive Breakpoints - EXACTLY LIKE YOUR BLOG */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .sidebar {
            order: -1;
          }
          .sticky-sidebar {
            position: static;
          }
          .container {
            padding: 2rem 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 1.5rem 1rem;
          }
          .post-title {
            font-size: 1.75rem;
          }
          .post-excerpt {
            font-size: 1rem;
          }
          .article-content {
            font-size: 1rem;
          }
          .scroll-top {
            bottom: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
          }
          .breadcrumb {
            font-size: 0.75rem;
          }
          .meta-item {
            font-size: 0.75rem;
          }
          .meta-item svg {
            width: 12px;
            height: 12px;
          }
        }

        @media (max-width: 480px) {
          .post-meta {
            gap: 0.5rem;
          }
          .meta-item {
            font-size: 0.7rem;
          }
          .container {
            padding: 1rem 0.75rem;
          }
          .post-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}