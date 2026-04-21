// src/pages/api/preview.js
export default async function handler(req, res) {
  const { title, content, excerpt, image, tags, category, readingTime } = req.query;
  
  const parsedTags = tags ? JSON.parse(tags) : [];
  const currentDate = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title) || 'Preview'} | Trendlin</title>
  <meta name="description" content="${escapeHtml(excerpt) || 'Preview of your post'}">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #1a1a2e;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }
    
    /* Progress Bar */
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
    
    /* Header */
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
    }
    
    .post-title {
      font-size: clamp(2.5rem, 5vw, 3.8rem);
      font-weight: 800;
      margin-bottom: 1rem;
      color: #1a1a2e;
      line-height: 1.2;
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
    
    .meta-divider {
      width: 4px;
      height: 4px;
      background: #6c757d;
      border-radius: 50%;
    }
    
    /* Featured Image */
    .featured-image {
      margin: 2rem 0 3rem;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    .featured-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    /* Content Grid */
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
    
    .article-content p {
      margin-bottom: 1.5rem;
    }
    
    .article-content h2 {
      font-size: 1.8rem;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
      color: #1a1a2e;
    }
    
    .article-content h3 {
      font-size: 1.4rem;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #1a1a2e;
    }
    
    .article-content img {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      margin: 2rem 0;
    }
    
    .article-content blockquote {
      border-left: 4px solid #0056b3;
      padding-left: 1.5rem;
      margin: 2rem 0;
      font-style: italic;
      color: #6c757d;
    }
    
    .article-content ul, .article-content ol {
      margin: 1.5rem 0;
      padding-left: 1.75rem;
    }
    
    .article-content li {
      margin: 0.5rem 0;
    }
    
    .article-content code {
      background: #f0f0f0;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    .article-content pre {
      background: #1a1a2e;
      color: #e9ecef;
      padding: 1.5rem;
      border-radius: 16px;
      overflow-x: auto;
      margin: 2rem 0;
    }
    
    /* Empty Preview */
    .empty-preview {
      text-align: center;
      padding: 4rem;
      background: #f8f9fa;
      border-radius: 16px;
      color: #adb5bd;
      font-style: italic;
    }
    
    /* Post Footer */
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
    }
    
    /* Sidebar */
    .sidebar {
      position: relative;
    }
    
    .sticky-sidebar {
      position: sticky;
      top: 100px;
    }
    
    .share-placeholder, .newsletter-placeholder {
      background: #f8f9fa;
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .share-placeholder span, .newsletter-placeholder span {
      font-size: 0.85rem;
      font-weight: 600;
      color: #6c757d;
    }
    
    /* Rating Placeholder */
    .rating-placeholder {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 20px;
      margin-top: 2rem;
    }
    
    .rating-placeholder .stars {
      color: #f59e0b;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    /* Related Posts Placeholder */
    .related-placeholder {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }
    
    .related-placeholder h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .related-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    
    .related-card {
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      text-align: center;
      color: #6c757d;
    }
    
    /* Scroll to Top */
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
    
    .scroll-top.visible {
      opacity: 1;
      visibility: visible;
    }
    
    /* Responsive */
    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .sidebar {
        order: -1;
      }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 1.5rem 1rem;
      }
      .post-title {
        font-size: 1.75rem;
      }
      .related-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
  
  <script>
    // Scroll progress
    window.addEventListener('scroll', function() {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) progressBar.style.width = scrolled + '%';
      
      const scrollTopBtn = document.querySelector('.scroll-top');
      if (scrollTopBtn) {
        if (window.scrollY > 100) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      }
    });
    
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  </script>
</head>
<body>
  <div class="progress-bar">
    <div class="progress-fill"></div>
  </div>
  
  <div class="container">
    <header class="header">
      <nav class="breadcrumb">
        <a href="/">Home</a>
        <span class="separator">/</span>
        <a href="/category/${escapeHtml((category || 'Blog').toLowerCase())}">${escapeHtml(category || 'Blog')}</a>
        <span class="separator">/</span>
        <span class="current">${escapeHtml(title) || 'Preview'}</span>
      </nav>
      
      <div class="category-tag">
        <a href="/category/${escapeHtml((category || 'Blog').toLowerCase())}" class="category-link">
          ${escapeHtml(category || 'Blog')}
        </a>
      </div>
      
      <h1 class="post-title">${escapeHtml(title) || 'Untitled Post'}</h1>
      
      ${excerpt ? `<p class="post-excerpt">${escapeHtml(excerpt)}</p>` : ''}
      
      <div class="post-meta">
        <div class="meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <time>${formattedDate}</time>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 12v8H4v-8M12 2v8m0 0-3-3m3 3 3-3"/>
          </svg>
          <span>${readingTime || 1} min read</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>0 views</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Admin</span>
        </div>
      </div>
    </header>
    
    ${image ? `
      <div class="featured-image">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(title) || 'Featured'}">
      </div>
    ` : ''}
    
    <div class="content-grid">
      <article class="main-content">
        <div class="article-content">
          ${content ? content : '<p class="empty-preview">Start writing to see your content preview exactly as it will appear on your blog...</p>'}
        </div>
        
        ${parsedTags.length > 0 ? `
          <footer class="post-footer">
            <div class="post-tags">
              <span class="tags-label">Tags:</span>
              <div class="tags-list">
                ${parsedTags.map(tag => `<a href="/tag/${tag.toLowerCase()}" class="tag">#${escapeHtml(tag)}</a>`).join('')}
              </div>
            </div>
          </footer>
        ` : ''}
      </article>
      
      <aside class="sidebar">
        <div class="sticky-sidebar">
          <div class="share-placeholder">
            <span>📤 Share this article</span>
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem;">
              <span style="cursor: pointer;">📘</span>
              <span style="cursor: pointer;">🐦</span>
              <span style="cursor: pointer;">💼</span>
              <span style="cursor: pointer;">📌</span>
              <span style="cursor: pointer;">🔗</span>
            </div>
          </div>
          <div class="newsletter-placeholder">
            <span>✨ Want to stay updated?</span>
            <p style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">Subscribe to our newsletter</p>
          </div>
        </div>
      </aside>
    </div>
    
    <div class="rating-placeholder">
      <div class="stars">★★★★☆</div>
      <div style="font-weight: 600;">4.5 (128 ratings)</div>
      <p style="font-size: 0.85rem; color: #495057; margin-top: 0.5rem;">How did you feel about this article?</p>
      <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.5rem;">
        <span style="font-size: 1.5rem;">😤</span>
        <span style="font-size: 1.5rem;">😕</span>
        <span style="font-size: 1.5rem;">😐</span>
        <span style="font-size: 1.5rem;">😊</span>
        <span style="font-size: 1.5rem;">😍</span>
      </div>
    </div>
    
    <div class="related-placeholder">
      <h3>More from ${escapeHtml(category || 'Blog')}</h3>
      <div class="related-grid">
        <div class="related-card">Related article 1</div>
        <div class="related-card">Related article 2</div>
        <div class="related-card">Related article 3</div>
      </div>
    </div>
  </div>
  
  <button class="scroll-top" onclick="scrollToTop()">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  </button>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

// Helper function to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}