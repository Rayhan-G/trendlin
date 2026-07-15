globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_CYeYE4e8.mjs';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
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
    campaigns: 0,
    openRate: 0,
    clickRate: 0
  };
  try {
    const statsResponse = await fetch(`${Astro2.url.origin}/api/newsletter/stats`);
    if (statsResponse.ok) {
      const data = await statsResponse.json();
      if (data && data.success) {
        newsletterStats = data.data;
      }
    }
  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
  }
  let recentCampaigns = [];
  try {
    const campaignsResponse = await fetch(`${Astro2.url.origin}/api/newsletter/campaigns?limit=5`);
    if (campaignsResponse.ok) {
      const data = await campaignsResponse.json();
      if (data && data.success) {
        recentCampaigns = data.data || [];
      }
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
  }
  const totalContent = totalPosts + totalProducts + totalMedia + totalTemplates + totalSources + contentStats.total;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Dashboard - Trendlin" }, { "default": async ($$result2) => renderTemplate`    ${maybeRenderHead()}<div class="dashboard-hero"> <div class="dashboard-hero-content"> <div> <div class="dashboard-greeting"> <span class="greeting-emoji">👋</span> <span>Welcome back!</span> </div> <h1 class="dashboard-title">
Your Content Dashboard
</h1> <p class="dashboard-subtitle">
You have <strong>${totalContent}</strong> items across your content ecosystem
</p> </div> <div class="dashboard-time"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline> </svg> <span>${(/* @__PURE__ */ new Date()).toLocaleString()}</span> </div> </div> </div>    <div class="stats-grid"> <!-- 1. POSTS --> <div class="stat-card stat-card-blue"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path> </svg> </div> <div> <div class="stat-label">Total Posts</div> <div class="stat-value">${totalPosts}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${publishedPosts} Published
</span> <span class="stat-badge stat-badge-yellow"> <span class="stat-dot stat-dot-yellow"></span> ${draftPosts} Drafts
</span> </div> </div> <div class="stat-actions"> <a href="/admin/posts" class="stat-action-link">View All →</a> <a href="/admin/new" class="stat-action-btn stat-action-btn-blue">+ New Post</a> </div> </div> <!-- 2. PRODUCTS --> <div class="stat-card stat-card-orange"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path> </svg> </div> <div> <div class="stat-label">Total Products</div> <div class="stat-value">${totalProducts}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${productsInStock} In Stock
</span> <span class="stat-badge stat-badge-purple"> <span class="stat-dot stat-dot-purple"></span> ${totalResources} Resources
</span> </div> </div> <div class="stat-actions"> <a href="/admin/products" class="stat-action-link">View All →</a> <a href="/admin/products/new" class="stat-action-btn stat-action-btn-orange">+ New Product</a> </div> </div> <!-- 3. MEDIA --> <div class="stat-card stat-card-green"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> <div> <div class="stat-label">Media Files</div> <div class="stat-value">${totalMedia}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-blue"> <span class="stat-dot stat-dot-blue"></span> ${totalFolders} Folders
</span> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${totalMedia} Files
</span> </div> </div> <div class="stat-actions"> <a href="/admin/media" class="stat-action-link">View All →</a> <a href="/admin/media" class="stat-action-btn stat-action-btn-green">+ Upload</a> </div> </div> <!-- 4. TEMPLATES --> <div class="stat-card stat-card-indigo"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> </div> <div> <div class="stat-label">Templates</div> <div class="stat-value">${totalTemplates}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${activeTemplates} Active
</span> <span class="stat-badge stat-badge-orange"> <span class="stat-dot stat-dot-orange"></span> ${templateUsage} Uses
</span> </div> </div> <div class="stat-actions"> <a href="/admin/templates" class="stat-action-link">View All →</a> <a href="/admin/templates/new" class="stat-action-btn stat-action-btn-indigo">+ New Template</a> </div> </div> <!-- 5. SOURCES --> <div class="stat-card stat-card-cyan"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path> </svg> </div> <div> <div class="stat-label">Sources</div> <div class="stat-value">${totalSources}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-blue"> <span class="stat-dot stat-dot-blue"></span> ${totalMasterSources} Universal
</span> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${totalStateSources} State
</span> </div> </div> <div class="stat-actions"> <a href="/admin/sources" class="stat-action-link">View All →</a> <a href="/admin/sources/new" class="stat-action-btn stat-action-btn-cyan">+ New Source</a> </div> </div> <!-- 6. CONTENT CALENDAR --> <div class="stat-card stat-card-pink"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect> <line x1="16" y1="2" x2="16" y2="6"></line> <line x1="8" y1="2" x2="8" y2="6"></line> <line x1="3" y1="10" x2="21" y2="10"></line> </svg> </div> <div> <div class="stat-label">Content Calendar</div> <div class="stat-value">${contentStats.total}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${contentStats.published} Published
</span> <span class="stat-badge stat-badge-blue"> <span class="stat-dot stat-dot-blue"></span> ${contentStats.scheduled} Scheduled
</span> <span class="stat-badge stat-badge-yellow"> <span class="stat-dot stat-dot-yellow"></span> ${contentStats.drafts} Drafts
</span> </div> </div> <div class="stat-actions"> <a href="/admin/content" class="stat-action-link">View Calendar →</a> <a href="/admin/content" class="stat-action-btn stat-action-btn-pink">+ New Content</a> </div> </div> <!-- 7. NEWSLETTER (NEW) --> <div class="stat-card stat-card-rose"> <div class="stat-card-inner"> <div class="stat-card-left"> <div class="stat-icon-wrapper"> <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg> </div> <div> <div class="stat-label">Newsletter</div> <div class="stat-value">${newsletterStats.total || 0}</div> </div> </div> <div class="stat-badges"> <span class="stat-badge stat-badge-green"> <span class="stat-dot stat-dot-green"></span> ${newsletterStats.active || 0} Active
</span> <span class="stat-badge stat-badge-yellow"> <span class="stat-dot stat-dot-yellow"></span> ${newsletterStats.pending || 0} Pending
</span> <span class="stat-badge stat-badge-red"> <span class="stat-dot stat-dot-red"></span> ${newsletterStats.unsubscribed || 0} Unsubscribed
</span> </div> </div> <div class="stat-actions"> <a href="/admin/newsletter" class="stat-action-link">View All →</a> <a href="/admin/newsletter" class="stat-action-btn stat-action-btn-rose">+ New Campaign</a> </div> </div> </div>    <div class="newsletter-stats-grid"> <div class="newsletter-stat-card"> <div class="newsletter-stat-icon">📧</div> <div> <div class="newsletter-stat-label">Campaigns Sent</div> <div class="newsletter-stat-value">${newsletterStats.campaigns || 0}</div> </div> </div> <div class="newsletter-stat-card"> <div class="newsletter-stat-icon">📊</div> <div> <div class="newsletter-stat-label">Open Rate</div> <div class="newsletter-stat-value">${newsletterStats.openRate || 0}%</div> </div> </div> <div class="newsletter-stat-card"> <div class="newsletter-stat-icon">👆</div> <div> <div class="newsletter-stat-label">Click Rate</div> <div class="newsletter-stat-value">${newsletterStats.clickRate || 0}%</div> </div> </div> </div>    <div class="recent-content-grid"> <!-- Recent Content Calendar Items --> <div class="recent-posts-section"> <div class="section-header"> <div> <h2 class="section-title">📅 Recent Content</h2> <p class="section-subtitle">Your latest scheduled and published content</p> </div> <div class="section-actions"> <a href="/admin/content" class="btn-new-post"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
New Content
</a> </div> </div> <div class="table-container"> ${recentContent.length > 0 ? renderTemplate`<div class="table-scroll"> <table class="posts-table"> <thead> <tr> <th>Title</th> <th class="type-col">Type</th> <th class="status-col">Status</th> <th class="date-col">Scheduled</th> <th class="actions-col">Actions</th> </tr> </thead> <tbody> ${recentContent.map((item) => {
    const status = contentStatuses.find((s) => s.id === item.status_id);
    const type = contentTypes.find((t) => t.id === item.content_type_id);
    status ? status.color : "#94a3b8";
    const statusName = status ? status.name : "Unknown";
    const typeIcon = type ? type.icon : "\u{1F4C4}";
    const typeName = type ? type.name : "Unknown";
    return renderTemplate`<tr${addAttribute(item.id, "key")}> <td> <div class="post-title-cell"> <span class="post-title">${item.title}</span> </div> </td> <td class="type-col"> <span class="type-badge" style="background: {type ? type.color + '20' : '#94a3b820'}; color: {type ? type.color : '#94a3b8'}"> ${typeIcon} ${typeName} </span> </td> <td class="status-col"> <span class="status-badge" style="background: {statusColor}20; color: {statusColor}"> <span class="status-dot" style="background: {statusColor}"></span> ${statusName} </span> </td> <td class="date-col"> ${item.scheduled_publish_at ? new Date(item.scheduled_publish_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) : "\u2014"} </td> <td class="actions-col"> <div class="action-buttons"> <a${addAttribute(`/admin/content/edit/${item.id}`, "href")} class="action-btn action-btn-edit"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Edit
</a> <button class="action-btn action-btn-delete delete-content-btn"${addAttribute(item.id, "data-id")}> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg>
Delete
</button> </div> </td> </tr>`;
  })} </tbody> </table> </div>` : renderTemplate`<div class="empty-state"> <div class="empty-icon">📅</div> <p>No content yet</p> <a href="/admin/content" class="empty-action">Create your first content →</a> </div>`} </div> ${recentContent.length > 0 && renderTemplate`<div class="view-all-container"> <a href="/admin/content" class="view-all-link">
View all ${contentStats.total} content items →
</a> </div>`} </div> <!-- Recent Campaigns --> <div class="recent-posts-section"> <div class="section-header"> <div> <h2 class="section-title">📨 Recent Campaigns</h2> <p class="section-subtitle">Your latest newsletter campaigns</p> </div> <div class="section-actions"> <a href="/admin/newsletter" class="btn-new-post"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
New Campaign
</a> </div> </div> <div class="table-container"> ${recentCampaigns.length > 0 ? renderTemplate`<div class="table-scroll"> <table class="posts-table"> <thead> <tr> <th>Subject</th> <th class="status-col">Status</th> <th class="date-col">Sent</th> <th class="actions-col">Actions</th> </tr> </thead> <tbody> ${recentCampaigns.map((campaign) => renderTemplate`<tr${addAttribute(campaign.id, "key")}> <td> <div class="post-title-cell"> <span class="post-title">${campaign.subject}</span> </div> </td> <td class="status-col"> <span${addAttribute(`status-badge ${getStatusClass(campaign.status)}`, "class")}> <span class="status-dot"></span> ${campaign.status} </span> </td> <td class="date-col"> ${campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "\u2014"} </td> <td class="actions-col"> <div class="action-buttons"> <a${addAttribute(`/admin/newsletter/${campaign.id}`, "href")} class="action-btn action-btn-edit"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
View
</a> </div> </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<div class="empty-state"> <div class="empty-icon">📨</div> <p>No campaigns yet</p> <a href="/admin/newsletter" class="empty-action">Create your first campaign →</a> </div>`} </div> ${recentCampaigns.length > 0 && renderTemplate`<div class="view-all-container"> <a href="/admin/newsletter" class="view-all-link">
View all campaigns →
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
