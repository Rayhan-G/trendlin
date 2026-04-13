import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { supabase, getPostBySlug } from '@/lib/supabase';
import { optimizeImage } from '@/lib/cloudinary';
import Link from 'next/link';

export default function BlogPost({ post, notFound }) {
  const [copied, setCopied] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [headings, setHeadings] = useState([]);
  const articleRef = useRef(null);

  useEffect(() => {
    if (!post) return;

    const text = post.content?.replace(/<[^>]*>/g, '') || '';
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    setEstimatedTime(Math.ceil(wordCount / 200));

    // Extract headings for TOC
    const headingMatches = post.content?.match(/<h2[^>]*>(.*?)<\/h2>/g) || [];
    const extractedHeadings = headingMatches.slice(0, 6).map((heading, idx) => ({
      text: heading.replace(/<[^>]*>/g, ''),
      id: `heading-${idx}`
    }));
    setHeadings(extractedHeadings);

    fetchRelatedPosts();

    // Scroll progress tracking
    const handleScroll = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (winScroll / height) * 100;
      setProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const fetchRelatedPosts = async () => {
    if (!post) return;

    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, image_url, created_at')
      .eq('category', post.category)
      .eq('status', 'published')
      .neq('id', post.id)
      .limit(3);

    setRelatedPosts(data || []);
  };

  if (notFound || !post) {
    return (
      <Layout>
        <div className="not-found">
          <div className="not-found-content">
            <span className="not-found-emoji">🔍</span>
            <h1>Post not found</h1>
            <p>The article you're looking for doesn't exist or has been moved.</p>
            <Link href="/blog" className="back-home-btn">Browse articles →</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = encodeURIComponent(post.title);
  const shareDescription = encodeURIComponent(post.excerpt?.substring(0, 150) || '');
  const shareImage = encodeURIComponent(post.featured_image || post.image_url || '');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
    reddit: `https://reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,
    email: `mailto:?subject=${shareTitle}&body=${shareUrl}`,
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processContent = (content) => {
    if (!content) return '<p>Content coming soon...</p>';
    let processed = content.replace(
      /https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^\s"']+/g,
      (match) => optimizeImage(match)
    );
    processed = processed.replace(/<img /g, '<img loading="lazy" ');
    // Add responsive wrapper for images
    processed = processed.replace(/<img([^>]+)>/g, '<div class="responsive-image"><img$1></div>');
    return processed;
  };

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsTocOpen(false);
    }
  };

  return (
    <Layout>
      <div className="blog-post">
        {/* Reading Progress Bar */}
        <div className="progress-bar" style={{ width: `${progress}%` }} />

        {/* Hero Section - Mobile First */}
        <div className="hero-section">
          <div className="hero-image-container">
            <div className="hero-image">
              <img
                src={optimizeImage(post.featured_image || post.image_url || 'https://via.placeholder.com/1200x600?text=No+Image')}
                alt={post.title}
                loading="eager"
              />
            </div>
            <div className="hero-overlay" />
          </div>
          <div className="hero-content">
            <div className="hero-meta">
              <span className="hero-category">{post.category || 'General'}</span>
            </div>
            <h1 className="hero-title">{post.title}</h1>
            <div className="hero-stats">
              <div className="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{estimatedTime} min read</span>
              </div>
              <div className="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>{post.views?.toLocaleString() || 0} views</span>
              </div>
              <div className="stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{new Date(post.created_at || post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
            <div className="hero-author">
              <div className="author-avatar">
                <span>{post.author?.charAt(0) || 'A'}</span>
              </div>
              <div className="author-details">
                <span className="author-name">{post.author || 'Admin'}</span>
                <span className="author-title">Writer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fab-container">
          <button className="fab share-fab" onClick={() => setShowShareSheet(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
          {headings.length > 0 && (
            <button className="fab toc-fab" onClick={() => setIsTocOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Share Bottom Sheet */}
        {showShareSheet && (
          <div className="modal-overlay" onClick={() => setShowShareSheet(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bottom-sheet-handle" />
              <h3>Share this article</h3>
              <div className="share-grid">
                <button onClick={() => window.open(shareLinks.twitter, '_blank')} className="share-sheet-btn twitter">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
                <button onClick={() => window.open(shareLinks.facebook, '_blank')} className="share-sheet-btn facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
                <button onClick={() => window.open(shareLinks.whatsapp, '_blank')} className="share-sheet-btn whatsapp">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.032 2.016c-5.52 0-10 4.48-10 10 0 1.876.518 3.63 1.422 5.14l-1.51 4.834 4.976-1.478c1.478.888 3.186 1.392 5.112 1.392 5.52 0 10-4.48 10-10s-4.48-10-10-10z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button onClick={() => window.open(shareLinks.telegram, '_blank')} className="share-sheet-btn telegram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                  <span>Telegram</span>
                </button>
                <button onClick={handleCopyLink} className="share-sheet-btn copy">
                  {copied ? (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOC Bottom Sheet */}
        {isTocOpen && headings.length > 0 && (
          <div className="modal-overlay" onClick={() => setIsTocOpen(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bottom-sheet-handle" />
              <h3>Table of Contents</h3>
              <div className="toc-list">
                {headings.map((heading, index) => (
                  <button
                    key={index}
                    className="toc-sheet-link"
                    onClick={() => scrollToHeading(heading.id)}
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="content-container">
          <div className="article-wrapper" ref={articleRef}>
            {/* Author Card - Mobile Optimized */}
            <div className="author-card">
              <div className="author-card-avatar">
                <span>{post.author?.charAt(0) || 'A'}</span>
              </div>
              <div className="author-card-info">
                <h4>{post.author || 'Admin'}</h4>
                <p>Content creator passionate about sharing insights that help readers stay ahead.</p>
              </div>
            </div>

            {/* Article Body */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: processContent(post.content || post.excerpt) }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="tags-section">
                <div className="tags-list">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="related-posts">
                <div className="related-header">
                  <span className="related-icon">✨</span>
                  <h3>Recommended for you</h3>
                </div>
                <div className="related-list">
                  {relatedPosts.map(related => (
                    <Link key={related.id} href={`/blog/${related.slug}`} className="related-item">
                      {related.image_url && (
                        <div className="related-item-image">
                          <img src={optimizeImage(related.image_url)} alt={related.title} />
                        </div>
                      )}
                      <div className="related-item-content">
                        <h4>{related.title}</h4>
                        <span>{new Date(related.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .blog-post {
            background: #ffffff;
            min-height: 100vh;
            position: relative;
          }

          :global(body.dark) .blog-post {
            background: #0a0a0a;
          }

          /* Progress Bar */
          .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            z-index: 1000;
            transition: width 0.1s ease;
          }

          /* Hero Section - Mobile First */
          .hero-section {
            position: relative;
            min-height: 85vh;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
          }

          .hero-image-container {
            position: absolute;
            inset: 0;
          }

          .hero-image {
            width: 100%;
            height: 100%;
          }

          .hero-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%);
          }

          .hero-content {
            position: relative;
            z-index: 2;
            padding: 2rem 1.5rem 2.5rem;
            width: 100%;
          }

          .hero-meta {
            margin-bottom: 1rem;
          }

          .hero-category {
            display: inline-block;
            padding: 0.3rem 1rem;
            background: rgba(102, 126, 234, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            font-size: 0.7rem;
            font-weight: 600;
            color: white;
            letter-spacing: 0.5px;
          }

          .hero-title {
            font-size: 2rem;
            font-weight: 800;
            color: white;
            margin-bottom: 1rem;
            line-height: 1.3;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }

          .hero-stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }

          .stat {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            color: rgba(255,255,255,0.85);
            font-size: 0.7rem;
            background: rgba(0,0,0,0.3);
            padding: 0.25rem 0.6rem;
            border-radius: 20px;
            backdrop-filter: blur(5px);
          }

          .hero-author {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(5px);
            padding: 0.5rem 1rem;
            border-radius: 50px;
            width: fit-content;
          }

          .author-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
            color: white;
          }

          .author-details {
            display: flex;
            flex-direction: column;
          }

          .author-name {
            font-weight: 600;
            color: white;
            font-size: 0.85rem;
          }

          .author-title {
            font-size: 0.65rem;
            color: rgba(255,255,255,0.7);
          }

          /* Floating Action Buttons */
          .fab-container {
            position: fixed;
            bottom: 80px;
            right: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 100;
          }

          .fab {
            width: 48px;
            height: 48px;
            border-radius: 24px;
            background: #ffffff;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #667eea;
          }

          :global(body.dark) .fab {
            background: #1e293b;
            color: #667eea;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }

          .fab:active {
            transform: scale(0.95);
          }

          /* Bottom Sheet */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex;
            align-items: flex-end;
            justify-content: center;
          }

          .bottom-sheet {
            background: #ffffff;
            border-radius: 24px 24px 0 0;
            width: 100%;
            max-width: 500px;
            padding: 1rem 1.5rem 2rem;
            animation: slideUp 0.3s ease;
          }

          :global(body.dark) .bottom-sheet {
            background: #1e293b;
          }

          .bottom-sheet-handle {
            width: 40px;
            height: 4px;
            background: #cbd5e1;
            border-radius: 2px;
            margin: 0 auto 1.5rem;
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }

          .bottom-sheet h3 {
            font-size: 1.2rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .share-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .share-sheet-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem;
            background: #f1f5f9;
            border: none;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          :global(body.dark) .share-sheet-btn {
            background: #334155;
            color: #e2e8f0;
          }

          .share-sheet-btn:active {
            transform: scale(0.98);
          }

          .share-sheet-btn.twitter { color: #000; }
          .share-sheet-btn.facebook { color: #1877f2; }
          .share-sheet-btn.whatsapp { color: #25d366; }
          .share-sheet-btn.telegram { color: #26a5e4; }
          .share-sheet-btn.copy { color: #10b981; }

          .toc-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .toc-sheet-link {
            padding: 0.75rem 0;
            background: none;
            border: none;
            text-align: left;
            font-size: 0.95rem;
            color: #334155;
            border-bottom: 1px solid #e2e8f0;
            cursor: pointer;
          }

          :global(body.dark) .toc-sheet-link {
            color: #cbd5e1;
            border-bottom-color: #334155;
          }

          /* Content Container */
          .content-container {
            max-width: 800px;
            margin: -2rem auto 0;
            padding: 0 1rem;
            position: relative;
            z-index: 3;
          }

          .article-wrapper {
            background: white;
            border-radius: 24px;
            padding: 1.5rem;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
          }

          :global(body.dark) .article-wrapper {
            background: #1e293b;
          }

          /* Author Card */
          .author-card {
            display: flex;
            gap: 1rem;
            align-items: center;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 1rem;
            border-radius: 16px;
            margin-bottom: 2rem;
          }

          :global(body.dark) .author-card {
            background: linear-gradient(135deg, #0f172a, #1e293b);
          }

          .author-card-avatar {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.2rem;
            color: white;
            flex-shrink: 0;
          }

          .author-card-info h4 {
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
          }

          .author-card-info p {
            font-size: 0.75rem;
            color: #64748b;
            line-height: 1.4;
          }

          :global(body.dark) .author-card-info p {
            color: #94a3b8;
          }

          /* Article Body */
          .article-body {
            font-size: 1rem;
            line-height: 1.75;
            color: #334155;
          }

          :global(body.dark) .article-body {
            color: #cbd5e1;
          }

          .article-body :global(h1),
          .article-body :global(h2),
          .article-body :global(h3) {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 700;
            scroll-margin-top: 80px;
          }

          .article-body :global(h2) {
            font-size: 1.35rem;
          }
          .article-body :global(h3) {
            font-size: 1.15rem;
          }

          .article-body :global(p) {
            margin-bottom: 1.25rem;
          }

          .article-body :global(.responsive-image) {
            margin: 1.5rem -1.5rem;
          }

          .article-body :global(img) {
            width: 100%;
            border-radius: 16px;
          }

          .article-body :global(blockquote) {
            border-left: 3px solid #667eea;
            margin: 1.5rem 0;
            padding: 0.75rem 1rem;
            background: #f8fafc;
            font-style: italic;
            border-radius: 12px;
            font-size: 0.95rem;
          }

          :global(body.dark) .article-body :global(blockquote) {
            background: #0f172a;
          }

          .article-body :global(pre) {
            background: #1e293b;
            padding: 1rem;
            border-radius: 12px;
            overflow-x: auto;
            margin: 1.5rem 0;
          }

          .article-body :global(code) {
            background: #f1f5f9;
            padding: 0.2rem 0.4rem;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.85rem;
          }

          :global(body.dark) .article-body :global(code) {
            background: #334155;
          }

          /* Tags */
          .tags-section {
            margin: 2rem 0;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
          }

          .tags-list {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .tag {
            font-size: 0.7rem;
            padding: 0.3rem 0.8rem;
            background: #f1f5f9;
            border-radius: 20px;
            color: #475569;
          }

          :global(body.dark) .tag {
            background: #334155;
            color: #94a3b8;
          }

          /* Related Posts */
          .related-posts {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
          }

          .related-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .related-icon {
            font-size: 1.2rem;
          }

          .related-posts h3 {
            font-size: 1rem;
          }

          .related-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .related-item {
            display: flex;
            gap: 1rem;
            background: #f8fafc;
            border-radius: 16px;
            overflow: hidden;
            text-decoration: none;
            transition: all 0.2s;
          }

          .related-item:active {
            transform: scale(0.98);
          }

          :global(body.dark) .related-item {
            background: #0f172a;
          }

          .related-item-image {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
          }

          .related-item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .related-item-content {
            padding: 0.75rem 0.75rem 0.75rem 0;
            flex: 1;
          }

          .related-item-content h4 {
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            color: #0f172a;
            line-height: 1.3;
          }

          :global(body.dark) .related-item-content h4 {
            color: #f1f5f9;
          }

          .related-item-content span {
            font-size: 0.65rem;
            color: #64748b;
          }

          /* Not Found */
          .not-found {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .not-found-content {
            text-align: center;
          }

          .not-found-emoji {
            font-size: 4rem;
            display: block;
            margin-bottom: 1rem;
          }

          .not-found-content h1 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }

          .not-found-content p {
            color: #64748b;
            margin-bottom: 1.5rem;
          }

          .back-home-btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 500;
          }

          /* Tablet and Desktop */
          @media (min-width: 768px) {
            .hero-section {
              min-height: 70vh;
            }

            .hero-content {
              padding: 2rem 2rem 3rem;
              max-width: 800px;
              margin: 0 auto;
            }

            .hero-title {
              font-size: 3rem;
            }

            .hero-stats {
              justify-content: center;
            }

            .hero-author {
              margin: 0 auto;
            }

            .fab-container {
              bottom: 40px;
              right: 24px;
            }

            .fab {
              width: 52px;
              height: 52px;
            }

            .fab:hover {
              transform: scale(1.05);
            }

            .content-container {
              padding: 0 1.5rem;
            }

            .article-wrapper {
              padding: 2rem;
            }

            .article-body :global(.responsive-image) {
              margin: 2rem 0;
            }

            .related-list {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
            }

            .related-item {
              flex-direction: column;
            }

            .related-item-image {
              width: 100%;
              height: 120px;
            }

            .related-item-content {
              padding: 0.75rem;
            }
          }

          @media (min-width: 1024px) {
            .hero-title {
              font-size: 3.5rem;
            }

            .article-wrapper {
              padding: 2.5rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published');

  const paths = posts?.filter(post => post.slug).map((post) => ({
    params: { slug: post.slug }
  })) || [];

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { props: { notFound: true }, revalidate: 60 };
  }

  return {
    props: { post },
    revalidate: 3600
  };
}