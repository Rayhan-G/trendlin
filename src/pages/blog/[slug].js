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
        }
        
        :global(body.dark) article {
          background: #000000;
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
          background: linear-gradient(to top, #000000, transparent);
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
        }
        
        h1 {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        :global(body.dark) h1 {
          color: #f9fafb;
        }
        
        .meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          font-size: 0.8rem;
          color: #6b7280;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        :global(body.dark) .meta {
          border-bottom-color: #1f2937;
        }
        
        .share-wrapper {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 24px;
        }
        
        :global(body.dark) .share-wrapper {
          background: #111827;
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
        }
        
        .share-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #e5e7eb, transparent);
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
        }
        
        .share-icon svg {
          width: 20px;
          height: 20px;
          color: #4b5563;
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
        
        .article-body {
          font-size: 1rem;
          line-height: 1.75;
          color: #374151;
        }
        
        :global(body.dark) .article-body {
          color: #d1d5db;
        }
        
        .not-found {
          text-align: center;
          padding: 4rem 1.5rem;
        }
        
        @media (min-width: 768px) {
          .hero { height: 60vh; }
          h1 { font-size: 2.5rem; }
          .share-icon { width: 48px; height: 48px; }
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