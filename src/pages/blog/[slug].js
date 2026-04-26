// src/pages/blog/[slug].js

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import ShareButtons from '@/components/blog/ShareButtons'
import RightBlock from '@/components/blog/RightBlock'
import RelatedPosts from '@/components/blog/RelatedPosts'

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
  const [imageError, setImageError] = useState(false)

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 100
    setIsScrolled(scrolled)
    
    const winScroll = document.documentElement.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrolledProgress = height > 0 ? (winScroll / height) * 100 : 0
    setScrollProgress(scrolledProgress)
  }, [])

  useEffect(() => {
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

  // Handle loading state
  if (router.isFallback) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
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
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e9ecef;
            border-top-color: #0056b3;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            margin: 1rem auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Handle error state
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
          .btn-primary, .btn-secondary {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 40px;
            text-decoration: none;
            font-weight: 600;
            margin: 0.5rem;
          }
          .btn-primary {
            background: white;
            color: #667eea;
          }
          .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
          }
        `}</style>
      </div>
    )
  }

  // Get featured image URL - check all possible fields
  const featuredImageUrl = post.featured_image || post.image_url || null
  const featuredImageAlt = post.featured_image_alt || post.title
  const featuredImageCaption = post.featured_image_caption || ''
  
  const postUrl = `https://trendlin.com/blog/${post.slug}`
  const publishedDate = post.published_at || post.created_at
  const postCategory = post.category?.toLowerCase() || 'general'

  return (
    <>
      <Head>
        <title>{post.seo_title || post.meta_title || `${post.title} | Trendlin`}</title>
        <meta name="description" content={post.seo_description || post.meta_description || post.excerpt || `Read ${post.title} on Trendlin`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || `Read ${post.title} on Trendlin`} />
        <meta property="og:image" content={featuredImageUrl} />
        <meta property="og:image:alt" content={featuredImageAlt} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Trendlin" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={featuredImageUrl} />
        <link rel="canonical" href={postUrl} />
      </Head>

      <div className={`blog-post ${isDarkMode ? 'dark' : 'light'}`}>
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <div className="container">
          {/* Header */}
          <header className="header">
            <div className="category-tag">
              <a href={`/category/${encodeURIComponent(postCategory)}`} className="category-link">
                {post.category}
              </a>
            </div>
            
            <h1 className="post-title">{post.title}</h1>
            
            {post.excerpt && (
              <p className="post-excerpt">{post.excerpt}</p>
            )}
            
            <div className="post-meta">
              <span className="meta-item">📅 {formatDate(publishedDate)}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">📖 {readingTime} min read</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">👁️ {post.views?.toLocaleString() || 0} views</span>
              {post.author && (
                <>
                  <span className="meta-divider">•</span>
                  <span className="meta-item">✍️ {post.author}</span>
                </>
              )}
            </div>
          </header>

          {/* Featured Image - Fixed Version */}
          {featuredImageUrl && !imageError && (
            <div className="featured-image-container">
              <div className="featured-image">
                <img 
                  src={featuredImageUrl} 
                  alt={featuredImageAlt}
                  title={post.featured_image_title || post.title}
                  className="featured-img"
                  onError={() => setImageError(true)}
                  loading="eager"
                />
                {featuredImageCaption && (
                  <div className="image-caption">{featuredImageCaption}</div>
                )}
              </div>
            </div>
          )}
          
          {/* Content Grid */}
          <div className="content-grid">
            <article className="main-content">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
              />
              
              {post.tags && post.tags.length > 0 && (
                <footer className="post-footer">
                  <div className="post-tags">
                    <span className="tags-label">Tags:</span>
                    <div className="tags-list">
                      {post.tags.map((tag, index) => (
                        <a key={index} href={`/tag/${encodeURIComponent(tag.toLowerCase())}`} className="tag">
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
                <ShareButtons url={postUrl} title={post.title} imageUrl={featuredImageUrl || postUrl} />
                <RightBlock postSlug={post.slug} />
              </div>
            </aside>
          </div>

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
          ↑
        </button>
      </div>

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
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0056b3, #00a6ff);
          width: 0%;
          transition: width 0.3s ease-out;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
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
        .blog-post.dark .category-link {
          background: rgba(102, 176, 255, 0.15);
          color: #66b0ff;
        }

        .post-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          margin: 1rem 0;
          color: #1a1a2e;
        }
        .blog-post.dark .post-title {
          color: #ffffff;
        }

        .post-excerpt {
          font-size: 1.125rem;
          line-height: 1.6;
          color: #6c757d;
          margin-bottom: 1.5rem;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          color: #6c757d;
          font-size: 0.9rem;
        }
        .blog-post.dark .post-meta {
          color: #a0a0a0;
        }

        .featured-image-container {
          margin: 2rem 0;
        }
        .featured-image {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .featured-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .image-caption {
          padding: 0.75rem;
          font-size: 0.85rem;
          color: #6c757d;
          text-align: center;
          background: #f8f9fa;
        }
        .blog-post.dark .image-caption {
          background: #1a1a2e;
          color: #a0a0a0;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 3rem;
          margin-top: 2rem;
        }

        .article-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #2c3e50;
        }
        .blog-post.dark .article-content {
          color: #d1d5db;
        }

        .post-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }
        .post-tags {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .tags-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .tag {
          padding: 0.25rem 0.75rem;
          background: #f0f0f0;
          color: #495057;
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.75rem;
        }
        .blog-post.dark .tag {
          background: #1a1a2e;
          color: #a0a0a0;
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
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          font-size: 1.5rem;
        }
        .scroll-top.visible {
          opacity: 1;
          visibility: visible;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          .content-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .sidebar {
            order: -1;
          }
        }
      `}</style>
    </>
  )
}

export async function getStaticPaths() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')
      .limit(100)
    
    if (error) {
      console.error('Error fetching paths:', error)
      return { paths: [], fallback: 'blocking' }
    }
    
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
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase timeout')), 10000)
    )
    
    const queryPromise = supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    
    const { data: post, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error) {
      console.error('Supabase error:', error)
      return { props: { error: 'Database error', post: null }, revalidate: 60 }
    }

    if (!post) {
      return { props: { error: 'Post not found', post: null }, revalidate: 60 }
    }

    // Increment view count asynchronously (don't wait for it)
    supabase
      .from('posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)
      .then()
      .catch(err => console.error('Error updating views:', err))

    return { 
      props: { 
        post, 
        error: null 
      }, 
      revalidate: 3600 // Revalidate every hour
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return { props: { error: 'Internal server error', post: null }, revalidate: 60 }
  }
}