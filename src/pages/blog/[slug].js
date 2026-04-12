import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase, isSupabaseConfigured, getPostBySlug } from '@/lib/supabase'

export default function BlogPost({ post, notFound }) {
  const [copied, setCopied] = useState(false)

  if (notFound || !post) {
    return (
      <Layout>
        <div className="not-found">
          <h1>Post not found</h1>
          <p>The article you're looking for doesn't exist.</p>
        </div>
      </Layout>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = encodeURIComponent(post.title)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
    reddit: `https://reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,
    email: `mailto:?subject=${shareTitle}&body=${shareUrl}`,
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <article>
        <div className="hero">
          <img 
            src={post.featured_image || post.image_url || 'https://via.placeholder.com/1200x600?text=No+Image'} 
            alt={post.title} 
          />
          <div className="hero-gradient"></div>
        </div>

        <div className="container">
          <div className="content">
            <div className="category">{post.category || 'General'}</div>
            <h1>{post.title}</h1>
            <div className="meta">
              <span className="author">{post.author || 'Admin'}</span>
              <span className="dot">•</span>
              <span className="date">
                {new Date(post.created_at || post.date || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {post.read_time && (
                <>
                  <span className="dot">•</span>
                  <span className="read-time">{post.read_time}</span>
                </>
              )}
              {post.views !== undefined && (
                <>
                  <span className="dot">•</span>
                  <span className="views">👁️ {post.views.toLocaleString()} views</span>
                </>
              )}
            </div>

            <div className="share-wrapper">
              <div className="share-label">
                <span>Share this article</span>
                <div className="share-line"></div>
              </div>
              <div className="share-icons">
                <button onClick={() => window.open(shareLinks.twitter, '_blank')} className="share-icon twitter">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button onClick={() => window.open(shareLinks.facebook, '_blank')} className="share-icon facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button onClick={() => window.open(shareLinks.linkedin, '_blank')} className="share-icon linkedin">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                  </svg>
                </button>
                <button onClick={() => window.open(shareLinks.whatsapp, '_blank')} className="share-icon whatsapp">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12.032 2.016c-5.52 0-10 4.48-10 10 0 1.876.518 3.63 1.422 5.14l-1.51 4.834 4.976-1.478c1.478.888 3.186 1.392 5.112 1.392 5.52 0 10-4.48 10-10s-4.48-10-10-10zm0 18.24c-1.574 0-3.038-.428-4.314-1.168l-.31-.184-2.953.876.94-2.888-.2-.324c-.856-1.366-1.35-2.95-1.35-4.636 0-4.708 3.832-8.54 8.54-8.54s8.54 3.832 8.54 8.54-3.832 8.54-8.54 8.54zM16.634 14.06c-.18-.09-1.062-.524-1.226-.584-.164-.06-.284-.09-.404.09-.12.18-.466.584-.572.704-.106.12-.212.134-.392.045-.18-.09-.76-.28-1.448-.892-.536-.478-.898-1.068-1.002-1.248-.106-.18-.012-.278.08-.368.082-.082.18-.212.27-.318.09-.106.12-.18.18-.3.06-.12.03-.224-.015-.314-.045-.09-.404-.974-.554-1.334-.146-.35-.294-.302-.404-.308-.106-.006-.226-.006-.346-.006-.12 0-.314.045-.48.224-.166.18-.634.618-.634 1.506 0 .888.646 1.746.736 1.866.09.12 1.272 1.942 3.082 2.722.43.186.766.296 1.028.38.432.138.826.118 1.136.072.346-.052 1.062-.434 1.212-.852.15-.418.15-.776.106-.85-.044-.074-.164-.12-.344-.21z"/>
                  </svg>
                </button>
                <button onClick={() => window.open(shareLinks.telegram, '_blank')} className="share-icon telegram">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.66-.35-1.02.22-1.61.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.1-.2-.11-.06-.26-.04-.37-.02-.16.03-2.64 1.68-4.45 2.94-.42.29-.8.43-1.14.42-.38-.01-1.1-.21-1.64-.39-.66-.21-1.19-.32-1.14-.68.03-.19.29-.38.78-.58 3.05-1.33 5.09-2.2 6.1-2.62 2.91-1.19 3.51-1.4 3.91-1.4.09 0 .29.02.42.12.11.08.14.2.15.31.01.12.02.28-.03.44z"/>
                  </svg>
                </button>
                <button onClick={() => window.open(shareLinks.reddit, '_blank')} className="share-icon reddit">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.858 13.995c.083.28.128.577.128.884 0 1.78-1.666 3.225-3.721 3.225-1.161 0-2.202-.46-2.98-1.2-.788.74-1.83 1.2-2.99 1.2-2.055 0-3.721-1.445-3.721-3.225 0-.307.045-.604.128-.884-1.039-.402-1.77-1.265-1.77-2.28 0-1.383 1.319-2.505 2.944-2.505.236 0 .467.03.691.085.501-.828 1.277-1.49 2.212-1.945l.75-1.567c.13-.271.4-.424.683-.389l2.354.355c.17-.269.454-.443.78-.443.53 0 .96.43.96.96 0 .53-.43.96-.96.96-.53 0-.96-.43-.96-.96l-2.175-.328-.675 1.41c.866.441 1.581 1.07 2.07 1.842.257-.08.536-.125.83-.125 1.625 0 2.944 1.122 2.944 2.505 0 1.015-.731 1.878-1.77 2.28z"/>
                  </svg>
                </button>
                <button onClick={() => window.location.href = shareLinks.email} className="share-icon email">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </button>
                <button onClick={handleCopyLink} className={`share-icon copy ${copied ? 'copied' : ''}`}>
                  {copied ? (
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div 
              className="article-body" 
              dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '<p>Content coming soon...</p>' }} 
            />
          </div>
        </div>
      </article>

      <style jsx>{`
        article {
          background: #ffffff;
          min-height: 100vh;
          transition: background 0.3s ease;
        }
        
        :global(body.dark) article {
          background: #0a0a0a;
        }
        
        .hero {
          position: relative;
          height: 55vh;
          min-height: 400px;
          overflow: hidden;
        }
        
        .hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .hero-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to top, #ffffff, transparent);
        }
        
        :global(body.dark) .hero-gradient {
          background: linear-gradient(to top, #0a0a0a, transparent);
        }
        
        .container {
          max-width: 750px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }
        
        .content {
          margin-top: -2rem;
          position: relative;
          z-index: 2;
        }
        
        .category {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #6366f1;
          margin-bottom: 1rem;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) .category {
          color: #818cf8;
        }
        
        h1 {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 1rem;
          color: #111827;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) h1 {
          color: #f3f4f6;
        }
        
        .meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 0.85rem;
          color: #6b7280;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        :global(body.dark) .meta {
          color: #9ca3af;
          border-bottom-color: #1f2937;
        }
        
        .author {
          font-weight: 600;
          color: #374151;
        }
        
        :global(body.dark) .author {
          color: #e5e7eb;
        }
        
        .dot {
          color: #d1d5db;
        }
        
        .share-wrapper {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        
        :global(body.dark) .share-wrapper {
          background: #111827;
          border: 1px solid #1f2937;
        }
        
        .share-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        
        .share-label span {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #6b7280;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) .share-label span {
          color: #9ca3af;
        }
        
        .share-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #e5e7eb, transparent);
          transition: all 0.3s ease;
        }
        
        :global(body.dark) .share-line {
          background: linear-gradient(90deg, #374151, transparent);
        }
        
        .share-icons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        
        .share-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        
        :global(body.dark) .share-icon {
          background: #1f2937;
          border-color: #374151;
        }
        
        .share-icon svg {
          color: #4b5563;
          transition: color 0.25s ease;
        }
        
        :global(body.dark) .share-icon svg {
          color: #9ca3af;
        }
        
        .share-icon:hover {
          transform: translateY(-3px);
        }
        
        .share-icon.twitter:hover { background: #000000; border-color: #000000; }
        .share-icon.twitter:hover svg { color: white; }
        .share-icon.facebook:hover { background: #1877f2; border-color: #1877f2; }
        .share-icon.facebook:hover svg { color: white; }
        .share-icon.linkedin:hover { background: #0a66c2; border-color: #0a66c2; }
        .share-icon.linkedin:hover svg { color: white; }
        .share-icon.whatsapp:hover { background: #25d366; border-color: #25d366; }
        .share-icon.whatsapp:hover svg { color: white; }
        .share-icon.telegram:hover { background: #26a5e4; border-color: #26a5e4; }
        .share-icon.telegram:hover svg { color: white; }
        .share-icon.reddit:hover { background: #ff4500; border-color: #ff4500; }
        .share-icon.reddit:hover svg { color: white; }
        .share-icon.email:hover { background: #ea4335; border-color: #ea4335; }
        .share-icon.email:hover svg { color: white; }
        .share-icon.copy:hover { background: #10b981; border-color: #10b981; }
        .share-icon.copy:hover svg { color: white; }
        .share-icon.copy.copied { background: #10b981; border-color: #10b981; }
        .share-icon.copy.copied svg { color: white; }
        
        .article-body {
          font-size: 1rem;
          line-height: 1.75;
          color: #374151;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) .article-body {
          color: #d1d5db;
        }
        
        .article-body h1,
        .article-body h2,
        .article-body h3,
        .article-body h4,
        .article-body h5,
        .article-body h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.3;
        }
        
        .article-body h1 { font-size: 2rem; color: #111827; }
        .article-body h2 { font-size: 1.5rem; color: #1f2937; }
        .article-body h3 { font-size: 1.25rem; color: #374151; }
        
        :global(body.dark) .article-body h1 { color: #f3f4f6; }
        :global(body.dark) .article-body h2 { color: #e5e7eb; }
        :global(body.dark) .article-body h3 { color: #d1d5db; }
        
        .article-body p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        
        .article-body a {
          color: #6366f1;
          text-decoration: underline;
          transition: all 0.2s ease;
        }
        
        .article-body a:hover {
          color: #4f46e5;
        }
        
        :global(body.dark) .article-body a {
          color: #818cf8;
        }
        
        .article-body ul,
        .article-body ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .article-body li {
          margin-bottom: 0.5rem;
        }
        
        .article-body blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #6366f1;
          background: #f9fafb;
          font-style: italic;
          border-radius: 8px;
        }
        
        :global(body.dark) .article-body blockquote {
          background: #111827;
        }
        
        .article-body img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .not-found {
          text-align: center;
          padding: 4rem 1.5rem;
        }
        
        @media (min-width: 768px) {
          .hero { height: 60vh; }
          h1 { font-size: 2.5rem; }
          .share-icon { width: 48px; height: 48px; }
          .article-body { font-size: 1.1rem; }
        }
        
        @media (min-width: 1024px) {
          .hero { height: 65vh; }
          h1 { font-size: 3rem; }
        }
      `}</style>
    </Layout>
  )
}

// Generate static paths for all posts
export async function getStaticPaths() {
  if (!isSupabaseConfigured()) {
    return { paths: [], fallback: true }
  }
  
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
  
  const paths = posts?.filter(post => post.slug).map((post) => ({
    params: { slug: post.slug }
  })) || []
  
  return { 
    paths, 
    fallback: 'blocking' // Use 'blocking' for better SEO
  }
}

// Get post data for static generation
export async function getStaticProps({ params }) {
  if (!isSupabaseConfigured()) {
    return { props: { notFound: true } }
  }
  
  const post = await getPostBySlug(params.slug)
  
  if (!post) {
    return { 
      props: { notFound: true }, 
      revalidate: 60 
    }
  }
  
  return {
    props: { post },
    revalidate: 3600 // Revalidate every hour
  }
}