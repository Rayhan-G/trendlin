globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute, F as Fragment } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C0GzesaC.mjs';
/* empty css                                        */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Templates = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Templates;
  let templates = [];
  let categories = [];
  try {
    const templatesResponse = await fetch(`${Astro2.url.origin}/api/admin/templates`);
    if (templatesResponse.ok) {
      const data = await templatesResponse.json();
      if (data && data.templates && Array.isArray(data.templates)) {
        templates = data.templates;
      }
    }
    const categoriesResponse = await fetch(`${Astro2.url.origin}/api/admin/templates/categories`);
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      if (data && data.categories && Array.isArray(data.categories)) {
        categories = data.categories;
      }
    }
  } catch (error2) {
    console.error("Error fetching templates:", error2);
  }
  const categoryOptions = [
    "Health & Wellness",
    "Food & Dining",
    "Entertainment",
    "Lifestyle",
    "Technology",
    "Shopping",
    "Real Estate"
  ];
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Templates Management - Trendlin" }, { "default": async ($$result2) => renderTemplate`    ${maybeRenderHead()}<div class="page-header"> <div class="header-content"> <div class="header-icon-wrapper"> <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> <polyline points="14 2 14 8 20 8"></polyline> <line x1="16" y1="13" x2="8" y2="13"></line> <line x1="16" y1="17" x2="8" y2="17"></line> <polyline points="10 9 9 9 8 9"></polyline> </svg> </div> <div> <h1 class="page-title">Content Templates</h1> <p class="page-subtitle"> <span class="template-count">${templates.length}</span> templates across your content ecosystem
</p> </div> </div> <button id="openAddTemplateModal" class="btn btn-primary"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
Add Template
</button> </div>    <div class="stats-grid"> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-blue"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> <polyline points="14 2 14 8 20 8"></polyline> <line x1="16" y1="13" x2="8" y2="13"></line> <line x1="16" y1="17" x2="8" y2="17"></line> </svg> </div> <div> <div class="stat-label">Total Templates</div> <div class="stat-value">${templates.length}</div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-blue"></span>
Content templates
</span> </div> </div> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-purple"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path> </svg> </div> <div> <div class="stat-label">Categories</div> <div class="stat-value stat-value-purple">${categories.length}</div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-purple"></span>
Unique categories
</span> </div> </div> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-green"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path> <polyline points="22 4 12 14.01 9 11.01"></polyline> </svg> </div> <div> <div class="stat-label">Active</div> <div class="stat-value stat-value-green"> ${templates.filter((t) => t.is_active === 1).length} </div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-green"></span>
Available for use
</span> </div> </div> <div class="stat-card"> <div class="stat-card-content"> <div class="stat-icon-wrapper stat-icon-orange"> <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path> </svg> </div> <div> <div class="stat-label">Total Usage</div> <div class="stat-value stat-value-orange"> ${templates.reduce((sum, t) => sum + (t.usage_count || 0), 0)} </div> </div> </div> <div class="stat-card-footer"> <span class="stat-trend"> <span class="stat-trend-dot stat-trend-orange"></span>
Times used
</span> </div> </div> </div>    ${categories.length > 0 && renderTemplate`<div class="category-breakdown"> <div class="category-breakdown-header"> <h2 class="section-title"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path> </svg>
Category Breakdown
</h2> <p class="section-subtitle">Distribution of templates across categories</p> </div> <div class="category-grid"> ${categories.map((cat) => renderTemplate`<div class="category-card"${addAttribute(cat.category, "key")}> <div class="category-card-content"> <span class="category-name">${cat.category}</span> <span class="category-count">${cat.template_count}</span> </div> <div class="category-meta"> <span class="category-meta-item"> <span class="meta-dot meta-dot-active"></span> ${cat.active_count} active
</span> <span class="category-meta-divider">•</span> <span class="category-meta-item"> <span class="meta-dot meta-dot-usage"></span> ${cat.total_usage || 0} uses
</span> </div> </div>`)} </div> </div>`}   <div class="table-section"> <div class="table-section-header"> <div> <h2 class="section-title"> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path> <polyline points="22,6 12,13 2,6"></polyline> </svg>
All Templates
</h2> <p class="section-subtitle">Manage your content templates by category</p> </div> <div class="table-controls"> <div class="search-wrapper"> <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <circle cx="11" cy="11" r="8"></circle> <line x1="21" y1="21" x2="16.65" y2="16.65"></line> </svg> <input type="text" id="searchInput" placeholder="Search templates..." class="search-input" oninput="filterTemplates()"> </div> <select id="categoryFilter" class="filter-select" onchange="filterTemplates()"> <option value="">All Categories</option> ${categoryOptions.map((cat) => renderTemplate`<option${addAttribute(cat, "key")}${addAttribute(cat, "value")}>${cat}</option>`)} </select> </div> </div> <div class="table-wrapper"> ${templates.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="table-scroll"> <table class="templates-table" id="templatesTable"> <thead> <tr> <th class="col-name">Name</th> <th class="col-category">Category</th> <th class="col-description">Description</th> <th class="col-usage">Usage</th> <th class="col-status">Status</th> <th class="col-actions">Actions</th> </tr> </thead> <tbody id="templatesTableBody"> ${templates.map((template) => renderTemplate`<tr${addAttribute(template.id, "key")} class="template-row"${addAttribute(template.name.toLowerCase(), "data-name")}${addAttribute(template.category, "data-category")}> <td class="col-name"> <span class="template-name">${template.name}</span> </td> <td class="col-category"> <span class="badge badge-category">${template.category}</span> </td> <td class="col-description"> <span class="template-description">${template.description || "\u2014"}</span> </td> <td class="col-usage"> <span class="usage-count">${template.usage_count || 0}</span> <span class="usage-label">uses</span> </td> <td class="col-status"> <span${addAttribute(`status-badge ${template.is_active === 1 ? "status-active" : "status-inactive"}`, "class")}> <span class="status-dot"></span> ${template.is_active === 1 ? "Active" : "Inactive"} </span> </td> <td class="col-actions"> <div class="action-buttons"> <button class="btn-action btn-action-edit"${addAttribute(template.id, "data-id")}${addAttribute(template.name, "data-name")}${addAttribute(template.category, "data-category")}${addAttribute(template.content, "data-content")}${addAttribute(template.description || "", "data-description")}${addAttribute(template.is_active, "data-is-active")} title="Edit template"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Edit
</button> <button class="btn-action btn-action-delete"${addAttribute(template.id, "data-id")} title="Delete template"> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg>
Delete
</button> </div> </td> </tr>`)} </tbody> </table> </div> <div class="table-footer"> <span class="table-footer-text">
Showing <strong id="visibleCount">${templates.length}</strong> template${templates.length > 1 ? "s" : ""} </span> <span class="table-footer-text"> <span class="active-indicator"></span> ${templates.filter((t) => t.is_active === 1).length} active
</span> </div> ` })}` : renderTemplate`<div class="empty-state"> <div class="empty-icon-wrapper"> <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> <polyline points="14 2 14 8 20 8"></polyline> <line x1="16" y1="13" x2="8" y2="13"></line> <line x1="16" y1="17" x2="8" y2="17"></line> </svg> </div> <h3>No templates yet</h3> <p>Create your first template to get started</p> <button id="emptyAddTemplateBtn" class="btn btn-primary"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
Add Template
</button> </div>`} </div> </div>    <div id="addTemplateModal" class="modal-overlay" style="display:none;"> <div class="modal modal-lg"> <div class="modal-header"> <h2 id="addModalTitle">Add Template</h2> <button class="modal-close" onclick="closeAddTemplateModal()"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg> </button> </div> <form id="addTemplateForm" class="modal-body"> <input type="hidden" id="templateEditId"> <div class="form-group"> <label class="form-label">Template Name <span class="form-required">*</span></label> <input type="text" id="templateName" required placeholder="e.g., Health & Wellness - Basic" class="form-input"> </div> <div class="form-group"> <label class="form-label">Category <span class="form-required">*</span></label> <select id="templateCategory" required class="form-select"> <option value="">Select a category</option> ${categoryOptions.map((cat) => renderTemplate`<option${addAttribute(cat, "key")}${addAttribute(cat, "value")}>${cat}</option>`)} </select> </div> <div class="form-group"> <label class="form-label">Description</label> <input type="text" id="templateDescription" placeholder="Brief description of this template" class="form-input"> </div> <div class="form-group"> <label class="form-label">HTML Content <span class="form-required">*</span></label> <textarea id="templateContent" rows="8" required placeholder="<h1>Your heading</h1><p>Your content...</p>" class="form-textarea"></textarea> <p class="form-hint">Enter HTML content for the template</p> </div> <div class="form-group"> <label class="checkbox-label"> <input type="checkbox" id="templateActive" checked> <span class="checkbox-custom"></span>
Active <span class="checkbox-hint">(available for use)</span> </label> </div> <div id="templateFormMessage" class="form-message" style="display:none;"></div> </form> <div class="modal-footer"> <button type="button" class="btn btn-secondary" onclick="closeAddTemplateModal()">Cancel</button> <button type="submit" form="addTemplateForm" id="saveTemplateBtn" class="btn btn-primary"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path> <polyline points="17 21 17 13 7 13 7 21"></polyline> <polyline points="7 3 7 8 15 8"></polyline> </svg>
Save Template
</button> </div> </div> </div> ` })} <!-- ============================================ --> <!-- JAVASCRIPT --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/templates.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/templates.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/templates.astro";
const $$url = "/admin/templates";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Templates,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
