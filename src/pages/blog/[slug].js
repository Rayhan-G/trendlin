import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
          <img src={post.featured_image || '/images/placeholder.jpg'} alt={post.title} />
          <div className="hero-gradient"></div>
        </div>

        <div className="container">
          <div className="content">
            <div className="category">{post.category}</div>
            <h1>{post.title}</h1>
            <div className="meta">
              <span className="author">{post.author}</span>
              <span className="dot">•</span>
              <span className="date">{new Date(post.created_at || post.date).toLocaleDateString()}</span>
            </div>

            <div className="share-wrapper">
              <div className="share-label">
                <span>Share</span>
                <div className="share-line"></div>
              </div>
              <div className="share-icons">
                <button onClick={() => window.open(shareLinks.twitter, '_blank')} className="share-icon twitter">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg" alt="Twitter" />
                </button>
                <button onClick={() => window.open(shareLinks.facebook, '_blank')} className="share-icon facebook">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="Facebook" />
                </button>
                <button onClick={() => window.open(shareLinks.linkedin, '_blank')} className="share-icon linkedin">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" />
                </button>
                <button onClick={() => window.open(shareLinks.whatsapp, '_blank')} className="share-icon whatsapp">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg" alt="WhatsApp" />
                </button>
                <button onClick={() => window.open(shareLinks.telegram, '_blank')} className="share-icon telegram">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/telegram.svg" alt="Telegram" />
                </button>
                <button onClick={() => window.open(shareLinks.reddit, '_blank')} className="share-icon reddit">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/reddit.svg" alt="Reddit" />
                </button>
                <button onClick={() => window.location.href = shareLinks.email} className="share-icon email">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg" alt="Email" />
                </button>
                <button onClick={handleCopyLink} className={`share-icon copy ${copied ? 'copied' : ''}`}>
                  {copied ? (
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />
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
          gap: 1rem;
          margin-bottom: 2rem;
          font-size: 0.8rem;
          color: #6b7280;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        :global(body.dark) .meta {
          color: #9ca3af;
          border-bottom-color: #1f2937;
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
        
        .share-icon img {
          width: 20px;
          height: 20px;
          transition: filter 0.25s ease;
        }
        
        :global(body.dark) .share-icon img {
          filter: brightness(0) invert(1);
        }
        
        .share-icon svg {
          width: 20px;
          height: 20px;
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
        .share-icon.twitter:hover img { filter: brightness(0) invert(1); }
        .share-icon.facebook:hover { background: #1877f2; border-color: #1877f2; }
        .share-icon.facebook:hover img { filter: brightness(0) invert(1); }
        .share-icon.linkedin:hover { background: #0a66c2; border-color: #0a66c2; }
        .share-icon.whatsapp:hover { background: #25d366; border-color: #25d366; }
        .share-icon.telegram:hover { background: #26a5e4; border-color: #26a5e4; }
        .share-icon.reddit:hover { background: #ff4500; border-color: #ff4500; }
        .share-icon.email:hover { background: #ea4335; border-color: #ea4335; }
        .share-icon.copy:hover { background: #10b981; border-color: #10b981; }
        .share-icon.copy:hover svg { color: white; }
        .share-icon.copy.copied { background: #10b981; border-color: #10b981; }
        .share-icon.copy.copied svg { color: white; }
        
        /* Article Body - Enhanced Dark Mode */
        .article-body {
          font-size: 1rem;
          line-height: 1.75;
          color: #374151;
          transition: color 0.3s ease;
        }
        
        :global(body.dark) .article-body {
          color: #d1d5db;
        }
        
        /* Headings inside article */
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
          transition: color 0.3s ease;
        }
        
        .article-body h1 {
          font-size: 2rem;
          color: #111827;
        }
        
        :global(body.dark) .article-body h1 {
          color: #f3f4f6;
        }
        
        .article-body h2 {
          font-size: 1.5rem;
          color: #1f2937;
        }
        
        :global(body.dark) .article-body h2 {
          color: #e5e7eb;
        }
        
        .article-body h3 {
          font-size: 1.25rem;
          color: #374151;
        }
        
        :global(body.dark) .article-body h3 {
          color: #d1d5db;
        }
        
        /* Paragraphs */
        .article-body p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        
        /* Links */
        .article-body a {
          color: #6366f1;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
          transition: all 0.2s ease;
        }
        
        .article-body a:hover {
          color: #4f46e5;
          text-decoration-thickness: 3px;
        }
        
        :global(body.dark) .article-body a {
          color: #818cf8;
        }
        
        :global(body.dark) .article-body a:hover {
          color: #a5b4fc;
        }
        
        /* Lists */
        .article-body ul,
        .article-body ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .article-body li {
          margin-bottom: 0.5rem;
          line-height: 1.8;
        }
        
        /* Blockquotes */
        .article-body blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #6366f1;
          background: #f9fafb;
          font-style: italic;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        :global(body.dark) .article-body blockquote {
          background: #111827;
          border-left-color: #818cf8;
        }
        
        .article-body blockquote p {
          margin-bottom: 0;
        }
        
        /* Code blocks */
        .article-body pre {
          margin: 1.5rem 0;
          padding: 1rem;
          background: #1f2937;
          border-radius: 8px;
          overflow-x: auto;
        }
        
        .article-body code {
          padding: 0.2rem 0.4rem;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 0.875rem;
          font-family: monospace;
        }
        
        :global(body.dark) .article-body code {
          background: #1f2937;
          color: #e5e7eb;
        }
        
        .article-body pre code {
          background: transparent;
          padding: 0;
          color: #e5e7eb;
        }
        
        /* Images inside article */
        .article-body img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        :global(body.dark) .article-body img {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        
        /* Tables */
        .article-body table {
          width: 100%;
          margin: 1.5rem 0;
          border-collapse: collapse;
        }
        
        .article-body th,
        .article-body td {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          text-align: left;
        }
        
        :global(body.dark) .article-body th,
        :global(body.dark) .article-body td {
          border-color: #374151;
        }
        
        .article-body th {
          background: #f9fafb;
          font-weight: 600;
        }
        
        :global(body.dark) .article-body th {
          background: #111827;
        }
        
        /* Horizontal rule */
        .article-body hr {
          margin: 2rem 0;
          border: none;
          height: 1px;
          background: linear-gradient(90deg, #e5e7eb, transparent);
        }
        
        :global(body.dark) .article-body hr {
          background: linear-gradient(90deg, #374151, transparent);
        }
        
        .not-found {
          text-align: center;
          padding: 4rem 1.5rem;
        }
        
        /* Responsive */
        @media (min-width: 768px) {
          .hero { height: 60vh; }
          h1 { font-size: 2.5rem; }
          .share-icon { width: 48px; height: 48px; }
          .article-body { font-size: 1.1rem; }
          .article-body h1 { font-size: 2.2rem; }
          .article-body h2 { font-size: 1.8rem; }
          .article-body h3 { font-size: 1.5rem; }
        }
        
        @media (min-width: 1024px) {
          .hero { height: 65vh; }
          h1 { font-size: 3rem; }
          .share-wrapper { padding: 2rem; }
          .share-icon { width: 52px; height: 52px; }
        }
      `}</style>
    </Layout>
  )
}

export async function getStaticPaths() {
  if (!isSupabaseConfigured()) {
    return { paths: [], fallback: true }
  }
  
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
  
  const paths = posts?.map((post) => ({
    params: { slug: post.slug }
  })) || []
  
  return { paths, fallback: true }
}

export async function getStaticProps({ params }) {
  if (!isSupabaseConfigured()) {
    return { props: { notFound: true } }
  }
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .single()
  
  if (error || !post) {
    return { props: { notFound: true }, revalidate: 60 }
  }
  
  return {
    props: { post },
    revalidate: 3600
  }
}