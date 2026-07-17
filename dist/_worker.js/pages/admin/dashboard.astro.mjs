globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C0GzesaC.mjs';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const { DB } = Astro2.locals.runtime.env;
  let posts = [];
  try {
    const response = await fetch(`${Astro2.url.origin}/api/admin/posts`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.posts && Array.isArray(data.posts)) {
        posts = data.posts;
      }
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => !p.is_draft).length;
  const draftPosts = posts.filter((p) => p.is_draft).length;
  let products = [];
  let totalProducts = 0;
  let productsInStock = 0;
  let totalResources = 0;
  try {
    const productsResponse = await fetch(`${Astro2.url.origin}/api/admin/products`);
    if (productsResponse.ok) {
      const data = await productsResponse.json();
      if (data && data.products && Array.isArray(data.products)) {
        products = data.products;
        totalProducts = products.length;
        productsInStock = products.filter((p) => p.in_stock === 1).length;
        totalResources = products.reduce((sum, p) => sum + (p.resource_count || 0), 0);
      }
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  let totalMedia = 0;
  let totalFolders = 0;
  try {
    const mediaResponse = await fetch(`${Astro2.url.origin}/api/admin/media`);
    if (mediaResponse.ok) {
      const data = await mediaResponse.json();
      if (data && data.success) {
        totalMedia = (data.media || []).length;
        totalFolders = (data.folders || []).length;
      }
    }
  } catch (error) {
    console.error("Error fetching media:", error);
  }
  let templates = [];
  let totalTemplates = 0;
  let activeTemplates = 0;
  let templateUsage = 0;
  try {
    const templatesResponse = await fetch(`${Astro2.url.origin}/api/admin/templates`);
    if (templatesResponse.ok) {
      const data = await templatesResponse.json();
      if (data && data.templates && Array.isArray(data.templates)) {
        templates = data.templates;
        totalTemplates = templates.length;
        activeTemplates = templates.filter((t) => t.is_active === 1).length;
        templateUsage = templates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
      }
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
  let masterSources = [];
  let stateSources = [];
  let totalSources = 0;
  let totalMasterSources = 0;
  let totalStateSources = 0;
  try {
    const sourcesResponse = await fetch(`${Astro2.url.origin}/api/admin/sources`);
    if (sourcesResponse.ok) {
      const data = await sourcesResponse.json();
      if (data && data.success) {
        masterSources = data.master || [];
        stateSources = data.state || [];
        totalMasterSources = masterSources.length;
        totalStateSources = stateSources.length;
        totalSources = totalMasterSources + totalStateSources;
      }
    }
  } catch (error) {
    console.error("Error fetching sources:", error);
  }
  let contentStats = {
    total: 0,
    published: 0,
    scheduled: 0,
    drafts: 0,
    thisMonth: 0,
    byStatus: [],
    byType: []
  };
  try {
    const contentStatsResponse = await fetch(`${Astro2.url.origin}/api/admin/content/stats`);
    if (contentStatsResponse.ok) {
      const data = await contentStatsResponse.json();
      if (data && data.success) {
        contentStats = data.data;
      }
    }
  } catch (error) {
    console.error("Error fetching content stats:", error);
  }
  let recentContent = [];
  try {
    const recentContentResponse = await fetch(`${Astro2.url.origin}/api/admin/content?limit=5`);
    if (recentContentResponse.ok) {
      const data = await recentContentResponse.json();
      if (data && data.success) {
        recentContent = data.data || [];
      }
    }
  } catch (error) {
    console.error("Error fetching recent content:", error);
  }
  let contentStatuses = [];
  let contentTypes = [];
  try {
    const [statusRes, typeRes] = await Promise.all([
      fetch(`${Astro2.url.origin}/api/admin/content/status`),
      fetch(`${Astro2.url.origin}/api/admin/content/types`)
    ]);
    if (statusRes.ok) {
      const data = await statusRes.json();
      if (data && data.success) contentStatuses = data.data || [];
    }
    if (typeRes.ok) {
      const data = await typeRes.json();
      if (data && data.success) contentTypes = data.data || [];
    }
  } catch (error) {
    console.error("Error fetching content metadata:", error);
  }
  let newsletterStats = {
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0,
    campaigns: 0
  };
  try {
    if (DB) {
      const statsResult = await DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
        FROM newsletter_subscribers
      `).first();
      const campaignResult = await DB.prepare("SELECT COUNT(*) as count FROM newsletter_campaigns").first();
      if (statsResult) {
        newsletterStats = {
          total: statsResult.total || 0,
          active: statsResult.active || 0,
          pending: statsResult.pending || 0,
          unsubscribed: statsResult.unsubscribed || 0,
          campaigns: campaignResult?.count || 0
        };
      }
    }
  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
  }
  const totalContent = totalPosts + totalProducts + totalMedia + totalTemplates + totalSources + contentStats.total;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard - Trendlin" }, { "default": async ($$result2) => renderTemplate`    ${maybeRenderHead()}<div class="dashboard-hero"> <div class="dashboard-hero-content"> <div class="dashboard-greeting-wrapper"> <div class="dashboard-greeting"> <span class="greeting-emoji">👋</span> <span>Welcome back</span> </div> <h1 class="dashboard-title">
Content Dashboard
</h1> <p class="dashboard-subtitle">
Managing <strong>${totalContent}</strong> content items across your ecosystem
</p> </div> <div class="dashboard-meta"> <div class="dashboard-time"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline> </svg> <span>${(/* @__PURE__ */ new Date()).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}</span> </div> <div class="dashboard-status"> <span class="status-indicator"></span>
All systems operational
</div> </div> </div> </div>    <div class="stats-grid"> <!-- 1. POSTS --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-blue"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> <span class="stat-card-badge">Posts</span> </div> <div class="stat-card-body"> <div class="stat-value">${totalPosts}</div> <div class="stat-metrics"> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${publishedPosts} Published
</span> <span class="metric-item metric-warning"> <span class="metric-dot"></span> ${draftPosts} Drafts
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/posts" class="stat-link">View all posts →</a> <a href="/admin/new" class="stat-action stat-action-blue">+ New</a> </div> </div> <!-- 2. PRODUCTS --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-orange"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> <span class="stat-card-badge">Products</span> </div> <div class="stat-card-body"> <div class="stat-value">${totalProducts}</div> <div class="stat-metrics"> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${productsInStock} In Stock
</span> <span class="metric-item metric-info"> <span class="metric-dot"></span> ${totalResources} Resources
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/products" class="stat-link">View all products →</a> <a href="/admin/products/new" class="stat-action stat-action-orange">+ New</a> </div> </div> <!-- 3. MEDIA --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-green"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> <span class="stat-card-badge">Media</span> </div> <div class="stat-card-body"> <div class="stat-value">${totalMedia}</div> <div class="stat-metrics"> <span class="metric-item metric-info"> <span class="metric-dot"></span> ${totalFolders} Folders
</span> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${totalMedia} Files
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/media" class="stat-link">View all media →</a> <a href="/admin/media" class="stat-action stat-action-green">+ Upload</a> </div> </div> <!-- 4. TEMPLATES --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-indigo"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> <span class="stat-card-badge">Templates</span> </div> <div class="stat-card-body"> <div class="stat-value">${totalTemplates}</div> <div class="stat-metrics"> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${activeTemplates} Active
</span> <span class="metric-item metric-warning"> <span class="metric-dot"></span> ${templateUsage} Uses
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/templates" class="stat-link">View all templates →</a> <a href="/admin/templates/new" class="stat-action stat-action-indigo">+ New</a> </div> </div> <!-- 5. SOURCES --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-cyan"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <span class="stat-card-badge">Sources</span> </div> <div class="stat-card-body"> <div class="stat-value">${totalSources}</div> <div class="stat-metrics"> <span class="metric-item metric-info"> <span class="metric-dot"></span> ${totalMasterSources} Universal
</span> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${totalStateSources} State
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/sources" class="stat-link">View all sources →</a> <a href="/admin/sources/new" class="stat-action stat-action-cyan">+ New</a> </div> </div> <!-- 6. CONTENT CALENDAR --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-pink"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line> </svg> </div> <span class="stat-card-badge">Calendar</span> </div> <div class="stat-card-body"> <div class="stat-value">${contentStats.total}</div> <div class="stat-metrics"> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${contentStats.published} Published
</span> <span class="metric-item metric-info"> <span class="metric-dot"></span> ${contentStats.scheduled} Scheduled
</span> <span class="metric-item metric-warning"> <span class="metric-dot"></span> ${contentStats.drafts} Drafts
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/content" class="stat-link">View calendar →</a> <a href="/admin/content" class="stat-action stat-action-pink">+ New</a> </div> </div> <!-- 7. NEWSLETTER --> <div class="stat-card"> <div class="stat-card-header"> <div class="stat-icon-wrapper stat-icon-rose"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> </div> <span class="stat-card-badge">Newsletter</span> </div> <div class="stat-card-body"> <div class="stat-value">${newsletterStats.total}</div> <div class="stat-metrics"> <span class="metric-item metric-success"> <span class="metric-dot"></span> ${newsletterStats.active} Active
</span> <span class="metric-item metric-warning"> <span class="metric-dot"></span> ${newsletterStats.pending} Pending
</span> <span class="metric-item metric-danger"> <span class="metric-dot"></span> ${newsletterStats.unsubscribed} Unsubscribed
</span> </div> </div> <div class="stat-card-footer"> <a href="/admin/newsletter" class="stat-link">View subscribers →</a> <a href="/admin/newsletter/new" class="stat-action stat-action-rose">+ Campaign</a> </div> </div> </div>    <div class="content-sections-grid"> <!-- RECENT CONTENT --> <div class="content-section"> <div class="section-header"> <div> <h2 class="section-title"> <span class="section-icon">📅</span>
Recent Content
</h2> <p class="section-subtitle">Latest scheduled and published content</p> </div> <a href="/admin/content" class="section-action-btn">View All →</a> </div> <div class="section-body"> ${recentContent.length > 0 ? renderTemplate`<div class="content-list"> ${recentContent.map((item) => {
    const status = contentStatuses.find((s) => s.id === item.status_id);
    const type = contentTypes.find((t) => t.id === item.content_type_id);
    status ? status.color : "#94a3b8";
    const statusName = status ? status.name : "Unknown";
    const typeIcon = type ? type.icon : "\u{1F4C4}";
    const typeName = type ? type.name : "Unknown";
    return renderTemplate`<div class="content-item"${addAttribute(item.id, "key")}> <div class="content-item-main"> <div class="content-item-info"> <span class="content-item-title">${item.title}</span> <div class="content-item-meta"> <span class="content-type" style="background: {type ? type.color + '20' : '#94a3b820'}; color: {type ? type.color : '#94a3b8'}"> ${typeIcon} ${typeName} </span> <span class="content-status" style="background: {statusColor}20; color: {statusColor}"> <span class="status-indicator-dot" style="background: {statusColor}"></span> ${statusName} </span> </div> </div> <div class="content-item-date"> ${item.scheduled_publish_at ? new Date(item.scheduled_publish_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) : "\u2014"} </div> </div> <div class="content-item-actions"> <a${addAttribute(`/admin/content/edit/${item.id}`, "href")} class="content-action content-action-edit"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Edit
</a> <button class="content-action content-action-delete delete-content-btn"${addAttribute(item.id, "data-id")}> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg> </button> </div> </div>`;
  })} </div>` : renderTemplate`<div class="empty-state"> <div class="empty-state-icon">📅</div> <p class="empty-state-text">No content scheduled yet</p> <a href="/admin/content" class="empty-state-action">Create your first content →</a> </div>`} </div> </div> <!-- RECENT POSTS --> <div class="content-section"> <div class="section-header"> <div> <h2 class="section-title"> <span class="section-icon">📄</span>
Recent Posts
</h2> <p class="section-subtitle">Latest published and draft articles</p> </div> <div class="section-actions"> <div class="search-wrapper"> <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> </svg> <input type="text" id="searchInput" placeholder="Search posts..." class="search-input"> </div> <a href="/admin/new" class="section-action-btn primary"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
New Post
</a> </div> </div> <div class="section-body"> ${posts.length > 0 ? renderTemplate`<div class="post-list"> ${posts.slice(0, 5).map((post) => renderTemplate`<div class="post-item"${addAttribute(post.id, "key")}> <div class="post-item-main"> <div class="post-item-info"> <span class="post-item-title">${post.title}</span> <span${addAttribute(`post-status ${post.is_draft ? "post-status-draft" : "post-status-published"}`, "class")}> <span class="status-indicator-dot"></span> ${post.is_draft ? "Draft" : "Published"} </span> </div> <div class="post-item-date"> ${post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "\u2014"} </div> </div> <div class="post-item-actions"> <a${addAttribute(`/admin/edit/${post.id}`, "href")} class="post-action post-action-edit"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Edit
</a> <button class="post-action post-action-delete delete-btn"${addAttribute(post.id, "data-id")}> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg> </button> </div> </div>`)} </div>` : renderTemplate`<div class="empty-state"> <div class="empty-state-icon">📝</div> <p class="empty-state-text">No posts created yet</p> <a href="/admin/new" class="empty-state-action">Create your first post →</a> </div>`} </div> ${posts.length > 5 && renderTemplate`<div class="section-footer"> <a href="/admin/posts" class="view-all-link">
View all ${posts.length} posts →
</a> </div>`} </div> <!-- ============================================ --> <!-- RECENT PRODUCTS - NEW SECTION ADDED --> <!-- ============================================ --> <div class="content-section"> <div class="section-header"> <div> <h2 class="section-title"> <span class="section-icon">🛍️</span>
Recent Products
</h2> <p class="section-subtitle">Latest products in your catalog</p> </div> <div class="section-actions"> <a href="/admin/products" class="section-action-btn">View All →</a> <a href="/admin/products/new" class="section-action-btn primary"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
New Product
</a> </div> </div> <div class="section-body"> ${products.length > 0 ? renderTemplate`<div class="post-list"> ${products.slice(0, 5).map((product) => renderTemplate`<div class="post-item"${addAttribute(product.id, "key")}> <div class="post-item-main"> <div class="post-item-info"> <span class="post-item-title">${product.name || product.title || "Untitled Product"}</span> <span${addAttribute(`post-status ${product.in_stock === 1 ? "post-status-published" : "post-status-draft"}`, "class")}> <span class="status-indicator-dot"></span> ${product.in_stock === 1 ? "In Stock" : "Out of Stock"} </span> </div> <div class="post-item-date">
$${product.price ? parseFloat(product.price).toFixed(2) : "0.00"} · ${product.resource_count || 0} resources
</div> </div> <div class="post-item-actions"> <a${addAttribute(`/admin/products/edit/${product.id}`, "href")} class="post-action post-action-edit"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Edit
</a> <button class="post-action post-action-delete delete-product-btn"${addAttribute(product.id, "data-id")}> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg> </button> </div> </div>`)} </div>` : renderTemplate`<div class="empty-state"> <div class="empty-state-icon">🛍️</div> <p class="empty-state-text">No products created yet</p> <a href="/admin/products/new" class="empty-state-action">Create your first product →</a> </div>`} </div> ${products.length > 5 && renderTemplate`<div class="section-footer"> <a href="/admin/products" class="view-all-link">
View all ${products.length} products →
</a> </div>`} </div> </div> ` })} <!-- ============================================ --> <!-- DELETE FUNCTIONALITY --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/dashboard.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/dashboard.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/dashboard.astro";
const $$url = "/admin/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
