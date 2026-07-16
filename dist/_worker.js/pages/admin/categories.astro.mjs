globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C0GzesaC.mjs';
/* empty css                                         */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Categories = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Categories;
  let categories = [];
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT 
      c.*,
      ch.id as hero_id,
      ch.hero_image,
      ch.is_active as hero_active,
      COUNT(DISTINCT p.id) as post_count
    FROM categories c
    LEFT JOIN category_hero ch ON c.id = ch.category_id AND ch.is_active = 1
    LEFT JOIN posts p ON p.category = c.name AND p.is_draft = 0
    GROUP BY c.id
    ORDER BY c.name ASC
  `).all();
    categories = result.results || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Categories - Trendlin Admin" }, { "default": async ($$result2) => renderTemplate`    ${maybeRenderHead()}<div class="page-header"> <div class="header-content"> <div class="header-icon-wrapper"> <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path> </svg> </div> <div> <h1 class="page-title">Category Management</h1> <p class="page-subtitle"> <span class="category-count">${categories.length}</span> categories with hero images
</p> </div> </div> </div>    <div class="categories-grid"> ${categories.map((category) => {
    category.description ? category.description.replace(/'/g, "\\'").replace(/"/g, '\\"') : "";
    category.name ? category.name.replace(/'/g, "\\'").replace(/"/g, '\\"') : "";
    category.slug ? category.slug.replace(/'/g, "\\'").replace(/"/g, '\\"') : "";
    category.icon ? category.icon.replace(/'/g, "\\'").replace(/"/g, '\\"') : "";
    category.hero_image || "";
    category.hero_id || "";
    category.is_active || 1;
    return renderTemplate`<div class="category-card"${addAttribute(category.id, "data-id")}> <div class="category-card-header"> <div class="category-icon-wrapper"> <span class="category-icon">${category.icon || "\u{1F4C1}"}</span> </div> <div class="category-info"> <h3 class="category-name">${category.name}</h3> <span class="category-slug">/${category.slug}</span> </div> </div> <!-- Hero Image Preview --> <div class="hero-preview-container"> ${category.hero_image ? renderTemplate`<div class="hero-image-container"> <img${addAttribute(category.hero_image, "src")}${addAttribute(`${category.name} hero`, "alt")} class="hero-image" loading="lazy" onerror="this.style.display='none'"> <div class="hero-overlay"> <span class="hero-label"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> <circle cx="8.5" cy="8.5" r="1.5"></circle> <polyline points="21 15 16 10 5 21"></polyline> </svg>
Hero Image
</span> <div class="hero-actions"> <button class="btn btn-sm btn-outline-light change-hero-btn" onclick="openEditModal({id: \${category.id}, name: '\${escapedName}', slug: '\${escapedSlug}', icon: '\${escapedIcon}', description: '\${escapedDescription}', hero_image: '\${heroImage}', hero_id: '\${heroId}', is_active: \${isActive}})"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg>
Change
</button> ${category.hero_id && renderTemplate`<button class="btn btn-sm btn-danger remove-hero-btn" onclick="removeHeroImage(\${category.id}, \${category.hero_id})"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg>
Remove
</button>`} </div> </div> </div>` : renderTemplate`<div class="no-hero"> <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"> <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> <circle cx="8.5" cy="8.5" r="1.5"></circle> <polyline points="21 15 16 10 5 21"></polyline> </svg> <p>No hero image set</p> <button class="btn btn-sm btn-success add-hero-btn" onclick="openEditModal({id: \${category.id}, name: '\${escapedName}', slug: '\${escapedSlug}', icon: '\${escapedIcon}', description: '\${escapedDescription}', hero_image: '', hero_id: '', is_active: \${isActive}})"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
Add Hero Image
</button> </div>`} </div> <div class="category-description"> ${category.description || "No description provided"} </div> <div class="category-stats"> <div class="stat"> <span class="stat-label"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path> <polyline points="22,6 12,13 2,6"></polyline> </svg>
Posts
</span> <span class="stat-value">${category.post_count || 0}</span> </div> <div class="stat"> <span class="stat-label">Status</span> <span${addAttribute(`status-badge ${category.is_active ? "status-active" : "status-inactive"}`, "class")}> <span class="status-dot"></span> ${category.is_active ? "Active" : "Inactive"} </span> </div> </div> </div>`;
  })} </div>    <div id="editModal" class="modal-overlay" style="display:none;"> <div class="modal modal-lg"> <div class="modal-header"> <h2 id="modalTitle">Manage Hero Image</h2> <button class="modal-close" onclick="closeModal()"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg> </button> </div> <form id="categoryForm"> <input type="hidden" id="categoryId" name="id"> <input type="hidden" id="categoryHeroId" name="hero_id"> <div class="form-group"> <label class="form-label">Category</label> <p id="categoryDisplayName" class="category-display-name"></p> </div> <!-- Hero Image Section --> <div class="form-group hero-section"> <label class="form-label">Hero Image URL</label> <div class="hero-upload-wrapper"> <div class="hero-input-group"> <input type="text" id="categoryHero" name="hero_image" placeholder="https://example.com/hero.jpg" class="form-input"> <button type="button" class="btn btn-browse-media" onclick="openMediaLibrary()" title="Browse Media Library"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> <circle cx="8.5" cy="8.5" r="1.5"></circle> <polyline points="21 15 16 10 5 21"></polyline> </svg>
Browse
</button> </div> <div class="hero-upload-help"> <span class="help-text">Recommended: 1200×400px</span> <button type="button" class="btn btn-sm btn-secondary upload-btn" onclick="document.getElementById('heroFileInput').click()"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path> <polyline points="17 8 12 3 7 8"></polyline> <line x1="12" y1="3" x2="12" y2="15"></line> </svg>
Upload
</button> <input type="file" id="heroFileInput" accept="image/*" style="display:none;"> </div> </div> <!-- Preview Box --> <div id="heroPreview" class="hero-preview-box" style="display:none;"> <div class="hero-preview-content"> <img id="heroPreviewImage" src="" alt="Hero preview"> <div class="hero-preview-actions"> <button type="button" class="btn btn-sm btn-danger" onclick="removeHeroPreview()"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> </svg>
Remove
</button> </div> </div> </div> </div> <div class="form-actions"> <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button> <button type="submit" class="btn btn-primary" id="saveBtn"> <span id="saveBtnText"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path> <polyline points="17 21 17 13 7 13 7 21"></polyline> <polyline points="7 3 7 8 15 8"></polyline> </svg>
Save Hero Image
</span> <span id="saveBtnLoading" style="display:none;"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <circle cx="12" cy="12" r="10"></circle> <polyline points="12 6 12 12 16 14"></polyline> </svg>
Saving...
</span> </button> </div> </form> </div> </div>    <div id="mediaLibraryModal" class="modal-overlay" style="display:none;"> <div class="modal modal-xl"> <div class="modal-header"> <h2>Media Library</h2> <button class="modal-close" onclick="closeMediaLibrary()"> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg> </button> </div> <div class="modal-body"> <div id="mediaLibraryContent"> <div class="loading-state"> <div class="spinner"></div> <p>Loading media...</p> </div> </div> </div> <div class="modal-footer"> <button type="button" class="btn btn-secondary" onclick="closeMediaLibrary()">Close</button> <button type="button" class="btn btn-primary" onclick="refreshMediaLibrary()"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"> <polyline points="23 4 23 10 17 10"></polyline> <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path> </svg>
Refresh
</button> </div> </div> </div> ` })} <!-- ============================================ --> <!-- TOAST --> <!-- ============================================ --> <div id="toast" class="toast"></div> <!-- ============================================ --> <!-- JAVASCRIPT --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/categories.astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/categories.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/categories.astro";
const $$url = "/admin/categories";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Categories,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
