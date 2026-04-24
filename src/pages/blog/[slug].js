// src/pages/blog/[slug].js

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import RatingSection from '@/components/blog/RatingSection'
import ShareButtons from '@/components/blog/ShareButtons'
import RightBlock from '@/components/blog/RightBlock'
import RelatedPosts from '@/components/blog/RelatedPosts'
// Removed: import BookmarkButton from '@/components/frontend/BookmarkButton'

// Helper functions
const getReadingTime = (content) => {
  if (!content) return 1
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(words / 200))
}

const formatDate = (dateString) => {
  if (!dateString) return 'Recent'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function BlogPost({ post, error }) {
  const router = useRouter()
  const [readingTime, setReadingTime] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 100
    setIsScrolled(scrolled)
    
    const winScroll = document.documentElement.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrolledProgress = height > 0 ? (winScroll / height) * 100 : 0
    setScrollProgress(scrolledProgress)
  }, [])

  useEffect(() => {
    setIsMounted(true)
    if (post?.content) setReadingTime(getReadingTime(post.content))
    
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    window.addEventListener('scroll', handleScroll)
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [post?.content, handleScroll])

  if (router.isFallback || !isMounted) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">T</div>
          <div className="loading-spinner"></div>
          <p>Loading article...</p>
        </div>
        <style jsx>{`
          .loading-screen {
            position: fixed;
            inset: 0;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .loading-content {
            text-align: center;
          }
          .loading-logo {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, #0056b3, #00a6ff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 1rem;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e9ecef;
            border-top-color: #0056b3;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            margin: 1rem auto;
          }
          .loading-content p {
            color: #6c757d;
            font-size: 0.875rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="error-page">
        <div className="error-content">
          <div className="error-code">404</div>
          <h1>Article Not Found</h1>
          <p>The article you're looking for doesn't exist or has been moved.</p>
          <div className="error-actions">
            <a href="/" className="btn-primary">← Back to Home</a>
            <a href="/blog" className="btn-secondary">Browse All Articles</a>
          </div>
        </div>
        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
          }
          .error-content {
            text-align: center;
            color: white;
            max-width: 500px;
          }
          .error-code {
            font-size: 8rem;
            font-weight: 800;
            line-height: 1;
            opacity: 0.3;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          p {
            opacity: 0.9;
            margin-bottom: 2rem;
          }
          .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn-primary, .btn-secondary {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 40px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
          }
          .btn-primary {
            background: white;
            color: #667eea;
          }
          .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
            backdrop-filter: blur(10px);
          }
          .btn-primary:hover, .btn-secondary:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    )
  }

  const postUrl = `https://trendlin.com/blog/${post.slug}`
  const publishedDate = post.published_at || post.created_at
  const postCategory = post.category?.toLowerCase() || 'general'
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image_url,
    "datePublished": publishedDate,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author || "Trendlin Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Trendlin",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trendlin.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    }
  }

  return (
    <div className={`blog-post ${isDarkMode ? 'dark' : 'light'}`}>
      <Head>
        <title>{post.seo_title || `${post.title} | Trendlin`}</title>
        <meta name="description" content={post.seo_description || post.excerpt || `Read ${post.title} on Trendlin`} />
        <meta name="keywords" content={post.tags?.join(', ') || post.category} />
        <meta name="author" content={post.author || "Trendlin Team"} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || `Read ${post.title} on Trendlin`} />
        <meta property="og:image" content={post.image_url || post.featured_image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Trendlin" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || `Read ${post.title} on Trendlin`} />
        <meta name="twitter:image" content={post.image_url || post.featured_image} />
        <link rel="canonical" href={postUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      <div className="container">
        {/* Header Section */}
        <header className="header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span className="separator">/</span>
            <a href={`/category/${postCategory}`}>{post.category}</a>
            <span className="separator">/</span>
            <span className="current" aria-current="page">{post.title}</span>
          </nav>
          
          <div className="category-tag">
            <a href={`/category/${postCategory}`} className="category-link">
              {post.category}
            </a>
          </div>
          
          <h1 className="post-title">{post.title}</h1>
          
          {post.excerpt && (
            <p className="post-excerpt">{post.excerpt}</p>
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
              <span>{post.views?.toLocaleString() || 0} views</span>
            </div>
            {post.author && (
              <>
                <div className="meta-divider"></div>
                <div className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{post.author}</span>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Featured Image - Bookmark button removed */}
        {post.image_url && (
          <div className="featured-image-container">
            <div className="featured-image">
              <div className="image-wrapper">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  loading="eager"
                  fetchpriority="high"
                />
              </div>
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
                dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
              />
              
              {/* Post Footer */}
              <footer className="post-footer">
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    <span className="tags-label">Tags:</span>
                    <div className="tags-list">
                      {post.tags.map((tag, index) => (
                        <a key={index} href={`/tag/${tag.toLowerCase()}`} className="tag">
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
              <ShareButtons url={postUrl} title={post.title} imageUrl={post.image_url || postUrl} />
              <RightBlock postSlug={post.slug} />
            </div>
          </aside>
        </div>

        {/* Rating Section */}
        <RatingSection postSlug={post.slug} postTitle={post.title} />

        {/* Related Posts */}
        <RelatedPosts 
          currentPostId={post.id} 
          currentCategory={post.category}
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
        .blog-post {
          min-height: 100vh;
          background: #ffffff;
          transition: background 0.3s ease;
        }
        .blog-post.dark {
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
        .blog-post.dark .progress-bar {
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
          transition: color 0.2s;
        }
        .blog-post.dark .breadcrumb a {
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
          transition: all 0.2s;
        }
        .blog-post.dark .category-link {
          background: rgba(102, 176, 255, 0.15);
          color: #66b0ff;
        }
        .category-link:hover {
          background: rgba(0, 86, 179, 0.2);
          transform: translateY(-1px);
        }

        .post-title {
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          font-weight: 800;
          margin-bottom: 1rem;
          color: #1a1a2e;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .blog-post.dark .post-title {
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
        .blog-post.dark .meta-item {
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

        .featured-image-container {
          margin: 2rem 0 3rem;
        }
        .featured-image {
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
        }
        .blog-post.dark .article-content {
          color: #d1d5db;
        }
        .article-content p {
          margin-bottom: 1.5rem;
        }
        .article-content h2 {
          font-size: clamp(1.6rem, 4vw, 2rem);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #1a1a2e;
        }
        .blog-post.dark .article-content h2 {
          color: #ffffff;
        }
        .article-content h3 {
          font-size: clamp(1.3rem, 3.5vw, 1.5rem);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #1a1a2e;
        }
        .blog-post.dark .article-content h3 {
          color: #ffffff;
        }
        .article-content a {
          color: #0056b3;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .blog-post.dark .article-content a {
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
        .blog-post.dark .article-content blockquote {
          border-left-color: #66b0ff;
          color: #a0a0a0;
        }
        .article-content code {
          background: #f0f0f0;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: monospace;
        }
        .blog-post.dark .article-content code {
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

        .post-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }
        .blog-post.dark .post-footer {
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
          transition: all 0.2s;
        }
        .blog-post.dark .tag {
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
        .blog-post.dark .scroll-top {
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
        }

        @media (max-width: 480px) {
          .post-meta {
            gap: 0.5rem;
          }
          .meta-item {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export async function getStaticPaths() {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')
      .limit(100)
    
    const paths = posts?.map(post => ({ params: { slug: post.slug } })) || []
    return { paths, fallback: 'blocking' }
  } catch (error) {
    console.error('Error in getStaticPaths:', error)
    return { paths: [], fallback: 'blocking' }
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  
  try {
    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (!post) {
      return { props: { error: 'Post not found', post: null }, revalidate: 60 }
    }

    // Increment view count asynchronously
    supabase
      .from('posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)
      .then()

    return { props: { post, error: null }, revalidate: 3600 }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return { props: { error: 'Internal error', post: null }, revalidate: 60 }
  }
}