globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, F as Fragment, b as addAttribute } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C0GzesaC.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Posts = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Posts;
  let posts = [];
  try {
    const response = await fetch(`${Astro2.url.origin}/api/admin/posts`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.posts && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if (Array.isArray(data)) {
        posts = data;
      }
    }
  } catch (error2) {
    console.error("Error fetching posts:", error2);
    error2 = error2.message;
  }
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => !p.is_draft).length;
  const draftPosts = posts.filter((p) => p.is_draft).length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Posts - Trendlin", "description": "Manage your articles" }, { "default": async ($$result2) => renderTemplate`    ${maybeRenderHead()}<div class="page-header"> <div class="header-content"> <div class="header-icon-wrapper"> <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> <polyline points="14 2 14 8 20 8"></polyline> <line x1="16" y1="13" x2="8" y2="13"></line> <line x1="16" y1="17" x2="8" y2="17"></line> <polyline points="10 9 9 9 8 9"></polyline> </svg> </div> <div> <h1 class="page-title">Posts</h1> <p class="page-subtitle"> <span class="post-count">${totalPosts}</span> articles in your content library
</p> </div> </div> <a href="/admin/new" class="btn btn-primary"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
New Post
</a> </div>    <div class="stats-grid"> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-blue"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path> <polyline points="22,6 12,13 2,6"></polyline> </svg> </div> <div> <div class="stat-label">Total Posts</div> <div class="stat-value">${totalPosts}</div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-blue"></span>
Content articles
</span> </div> </div> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-green"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path> <polyline points="22 4 12 14.01 9 11.01"></polyline> </svg> </div> <div> <div class="stat-label">Published</div> <div class="stat-value stat-value-green">${publishedPosts}</div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-green"></span>
Live articles
</span> </div> </div> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-yellow"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10"></circle> <path d="M12 8v4l3 3"></path> </svg> </div> <div> <div class="stat-label">Drafts</div> <div class="stat-value stat-value-yellow">${draftPosts}</div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-yellow"></span>
In progress
</span> </div> </div> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-purple"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M2 12h4l2-3 2 6 2-3 2 6 4-9 2 3h4"></path> </svg> </div> <div> <div class="stat-label">Total Views</div> <div class="stat-value stat-value-purple">${totalViews}</div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-purple"></span>
Total engagement
</span> </div> </div> </div>    <div class="table-section"> <div class="table-section-header"> <div> <h2 class="section-title"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path> <polyline points="22,6 12,13 2,6"></polyline> </svg>
All Posts
</h2> <p class="section-subtitle">Manage your articles and content</p> </div> <div class="table-controls"> <div class="search-wrapper"> <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> </svg> <input type="text" id="searchInput" placeholder="Search posts..." class="search-input" oninput="filterPosts()"> </div> <select id="statusFilter" class="filter-select" onchange="filterPosts()"> <option value="">All Status</option> <option value="published">Published</option> <option value="draft">Draft</option> </select> </div> </div> <div class="table-wrapper"> ${posts.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="table-scroll"> <table class="posts-table" id="postsTable"> <thead> <tr> <th class="col-title">Title</th> <th class="col-status">Status</th> <th class="col-category">Category</th> <th class="col-date">Published</th> <th class="col-views">Views</th> <th class="col-actions">Actions</th> </tr> </thead> <tbody id="postsTableBody"> ${posts.map((post) => renderTemplate`<tr${addAttribute(post.id, "key")} class="post-row"${addAttribute(post.title.toLowerCase(), "data-title")}${addAttribute(post.is_draft ? "draft" : "published", "data-status")}> <td class="col-title"> <span class="post-title">${post.title}</span> <span class="post-title-mobile-status">${post.is_draft ? "Draft" : "Published"}</span> </td> <td class="col-status"> <span${addAttribute(`status-badge ${post.is_draft ? "status-draft" : "status-published"}`, "class")}> <span class="status-dot"></span> ${post.is_draft ? "Draft" : "Published"} </span> </td> <td class="col-category"> <span class="category-badge">${post.category || "\u2014"}</span> </td> <td class="col-date"> <span class="date-text"> ${post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "\u2014"} </span> </td> <td class="col-views"> <span class="views-count">${post.views || 0}</span> </td> <td class="col-actions"> <div class="action-buttons"> <a${addAttribute(`/admin/edit/${post.id}`, "href")} class="btn-action btn-action-edit" title="Edit post"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Edit
</a> <button class="btn-action btn-action-delete delete-btn"${addAttribute(post.id, "data-id")} title="Delete post"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg>
Delete
</button> </div> </td> </tr>`)} </tbody> </table> </div> <div class="table-footer"> <span class="table-footer-text">
Showing <strong id="visibleCount">${totalPosts}</strong> post${totalPosts > 1 ? "s" : ""} </span> <div class="table-footer-stats"> <span class="table-footer-text"> <span class="active-indicator"></span> ${publishedPosts} published
</span> <span class="table-footer-divider">•</span> <span class="table-footer-text"> <span class="draft-indicator"></span> ${draftPosts} drafts
</span> </div> </div> ` })}` : renderTemplate`<div class="empty-state"> <div class="empty-icon-wrapper"> <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> <polyline points="14 2 14 8 20 8"></polyline> <line x1="16" y1="13" x2="8" y2="13"></line> <line x1="16" y1="17" x2="8" y2="17"></line> <polyline points="10 9 9 9 8 9"></polyline> </svg> </div> <h3>No posts yet</h3> <p>Create your first article to get started</p> <a href="/admin/new" class="btn btn-primary"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
Create Post
</a> </div>`} </div> </div> ` })} <!-- ============================================ --> <!-- JAVASCRIPT --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/posts.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/posts.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/posts.astro";
const $$url = "/admin/posts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Posts,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
