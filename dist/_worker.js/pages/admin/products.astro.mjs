globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_C0GzesaC.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  let products = [];
  try {
    const { DB } = Astro2.locals.runtime.env;
    const result = await DB.prepare(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.category,
      p.brand,
      p.cover_image,
      p.in_stock,
      p.is_top_pick,
      p.is_newly_released,
      p.created_at,
      COUNT(r.id) as resource_count
    FROM products p
    LEFT JOIN product_resources r ON r.product_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();
    products = result.results || [];
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Products", "description": "Manage your product catalog", "data-astro-cid-jgtptyeq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="products-page" data-astro-cid-jgtptyeq> <!-- ============================================ --> <!-- HEADER --> <!-- ============================================ --> <div class="products-header" data-astro-cid-jgtptyeq> <div class="header-content" data-astro-cid-jgtptyeq> <div class="header-icon-wrapper" data-astro-cid-jgtptyeq> <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" data-astro-cid-jgtptyeq></path> </svg> </div> <div data-astro-cid-jgtptyeq> <h1 class="page-title" data-astro-cid-jgtptyeq>Products</h1> <p class="page-subtitle" data-astro-cid-jgtptyeq> <span class="product-count" data-astro-cid-jgtptyeq>${products.length}</span> products in your catalog
</p> </div> </div> <a href="/admin/products/new" class="btn btn-primary" data-astro-cid-jgtptyeq> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <line x1="12" y1="5" x2="12" y2="19" data-astro-cid-jgtptyeq></line> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-jgtptyeq></line> </svg>
Add Product
</a> </div> <!-- ============================================ --> <!-- PRODUCTS TABLE --> <!-- ============================================ --> ${products.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-jgtptyeq> <div class="empty-icon-wrapper" data-astro-cid-jgtptyeq> <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" data-astro-cid-jgtptyeq></path> </svg> </div> <h3 data-astro-cid-jgtptyeq>No products yet</h3> <p data-astro-cid-jgtptyeq>Create your first product to start building your catalog</p> <a href="/admin/products/new" class="btn btn-primary" data-astro-cid-jgtptyeq> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <line x1="12" y1="5" x2="12" y2="19" data-astro-cid-jgtptyeq></line> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-jgtptyeq></line> </svg>
Add Product
</a> </div>` : renderTemplate`<div class="table-wrapper" data-astro-cid-jgtptyeq> <div class="table-toolbar" data-astro-cid-jgtptyeq> <div class="table-toolbar-left" data-astro-cid-jgtptyeq> <div class="table-info" data-astro-cid-jgtptyeq> <span class="table-info-label" data-astro-cid-jgtptyeq>Showing</span> <strong data-astro-cid-jgtptyeq>${products.length}</strong> <span class="table-info-label" data-astro-cid-jgtptyeq>products</span> </div> <div class="table-divider" data-astro-cid-jgtptyeq></div> <div class="table-info" data-astro-cid-jgtptyeq> <span class="table-info-label" data-astro-cid-jgtptyeq> <span class="status-indicator status-indicator-active" data-astro-cid-jgtptyeq></span> ${products.filter((p) => p.in_stock).length} in stock
</span> </div> </div> <div class="table-toolbar-right" data-astro-cid-jgtptyeq> <div class="search-wrapper" data-astro-cid-jgtptyeq> <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <circle cx="11" cy="11" r="8" data-astro-cid-jgtptyeq></circle> <line x1="21" y1="21" x2="16.65" y2="16.65" data-astro-cid-jgtptyeq></line> </svg> <input type="text" id="searchProducts" placeholder="Search products..." class="search-input" data-astro-cid-jgtptyeq> </div> </div> </div> <div class="table-scroll" data-astro-cid-jgtptyeq> <table class="products-table" data-astro-cid-jgtptyeq> <thead data-astro-cid-jgtptyeq> <tr data-astro-cid-jgtptyeq> <th class="col-image" data-astro-cid-jgtptyeq></th> <th class="col-name" data-astro-cid-jgtptyeq>Product</th> <th class="col-category" data-astro-cid-jgtptyeq>Category</th> <th class="col-brand" data-astro-cid-jgtptyeq>Brand</th> <th class="col-resources" data-astro-cid-jgtptyeq>Resources</th> <th class="col-status" data-astro-cid-jgtptyeq>Status</th> <th class="col-actions" data-astro-cid-jgtptyeq></th> </tr> </thead> <tbody data-astro-cid-jgtptyeq> ${products.map((product) => renderTemplate`<tr${addAttribute(product.id, "key")} class="product-row" data-astro-cid-jgtptyeq> <td class="col-image" data-astro-cid-jgtptyeq> <a${addAttribute(`/admin/products/edit/${product.id}`, "href")} class="product-image-link" data-astro-cid-jgtptyeq> ${product.cover_image ? renderTemplate`<div class="product-thumb-wrapper" data-astro-cid-jgtptyeq> <img${addAttribute(product.cover_image, "src")}${addAttribute(product.name, "alt")} class="product-thumb" loading="lazy" data-astro-cid-jgtptyeq> </div>` : renderTemplate`<div class="product-thumb-placeholder" data-astro-cid-jgtptyeq> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <rect x="3" y="3" width="18" height="18" rx="2" ry="2" data-astro-cid-jgtptyeq></rect> <circle cx="8.5" cy="8.5" r="1.5" data-astro-cid-jgtptyeq></circle> <polyline points="21 15 16 10 5 21" data-astro-cid-jgtptyeq></polyline> </svg> </div>`} </a> </td> <td class="col-name" data-astro-cid-jgtptyeq> <div class="product-name-cell" data-astro-cid-jgtptyeq> <a${addAttribute(`/admin/products/edit/${product.id}`, "href")} class="product-name-link" data-astro-cid-jgtptyeq> <span class="product-name" data-astro-cid-jgtptyeq>${product.name}</span> </a> <div class="product-meta" data-astro-cid-jgtptyeq> <span class="product-slug" data-astro-cid-jgtptyeq>${product.slug}</span> <div class="product-badges" data-astro-cid-jgtptyeq> ${product.is_top_pick === 1 && renderTemplate`<span class="badge badge-top" data-astro-cid-jgtptyeq> <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" data-astro-cid-jgtptyeq> <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-astro-cid-jgtptyeq></polygon> </svg>
Top Pick
</span>`} ${product.is_newly_released === 1 && renderTemplate`<span class="badge badge-new" data-astro-cid-jgtptyeq> <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" data-astro-cid-jgtptyeq></path> </svg>
New
</span>`} </div> </div> </div> </td> <td class="col-category" data-astro-cid-jgtptyeq> ${product.category ? renderTemplate`<span class="category-tag" data-astro-cid-jgtptyeq>${product.category}</span>` : renderTemplate`<span class="empty-value" data-astro-cid-jgtptyeq>—</span>`} </td> <td class="col-brand" data-astro-cid-jgtptyeq> ${product.brand ? renderTemplate`<span class="brand-tag" data-astro-cid-jgtptyeq>${product.brand}</span>` : renderTemplate`<span class="empty-value" data-astro-cid-jgtptyeq>—</span>`} </td> <td class="col-resources" data-astro-cid-jgtptyeq> <div class="resource-cell" data-astro-cid-jgtptyeq> <span class="resource-count" data-astro-cid-jgtptyeq>${product.resource_count || 0}</span> <a${addAttribute(`/admin/products/${product.id}/resources`, "href")} class="resource-link" data-astro-cid-jgtptyeq>
Manage
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <polyline points="9 18 15 12 9 6" data-astro-cid-jgtptyeq></polyline> </svg> </a> </div> </td> <td class="col-status" data-astro-cid-jgtptyeq> <span${addAttribute(`status-badge ${product.in_stock ? "status-in-stock" : "status-out-of-stock"}`, "class")} data-astro-cid-jgtptyeq> <span class="status-dot" data-astro-cid-jgtptyeq></span> ${product.in_stock ? "In Stock" : "Out of Stock"} </span> </td> <td class="col-actions" data-astro-cid-jgtptyeq> <div class="action-buttons" data-astro-cid-jgtptyeq> <!-- EDIT BUTTON - ADDED --> <a${addAttribute(`/admin/products/edit/${product.id}`, "href")} class="btn-action btn-action-edit" title="Edit Product" data-astro-cid-jgtptyeq> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" data-astro-cid-jgtptyeq></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" data-astro-cid-jgtptyeq></path> </svg> </a> <a${addAttribute(`/admin/products/${product.id}/resources`, "href")} class="btn-action btn-action-resources" title="Manage Resources" data-astro-cid-jgtptyeq> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" data-astro-cid-jgtptyeq></path> <polyline points="14 2 14 8 20 8" data-astro-cid-jgtptyeq></polyline> <line x1="16" y1="13" x2="8" y2="13" data-astro-cid-jgtptyeq></line> <line x1="16" y1="17" x2="8" y2="17" data-astro-cid-jgtptyeq></line> <polyline points="10 9 9 9 8 9" data-astro-cid-jgtptyeq></polyline> </svg> </a> <button class="btn-action btn-action-delete" onclick="if(confirm('Delete this product?')) deleteProduct({product.id})" title="Delete Product" data-astro-cid-jgtptyeq> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <polyline points="3 6 5 6 21 6" data-astro-cid-jgtptyeq></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" data-astro-cid-jgtptyeq></path> </svg> </button> </div> </td> </tr>`)} </tbody> </table> </div> <div class="table-footer" data-astro-cid-jgtptyeq> <span class="table-footer-text" data-astro-cid-jgtptyeq>
Showing <strong data-astro-cid-jgtptyeq>${products.length}</strong> product${products.length > 1 ? "s" : ""} </span> <div class="table-footer-stats" data-astro-cid-jgtptyeq> <span class="table-footer-text" data-astro-cid-jgtptyeq> <span class="status-indicator status-indicator-active" data-astro-cid-jgtptyeq></span> ${products.filter((p) => p.in_stock).length} in stock
</span> <span class="table-footer-divider" data-astro-cid-jgtptyeq>•</span> <span class="table-footer-text" data-astro-cid-jgtptyeq> <span class="status-indicator status-indicator-inactive" data-astro-cid-jgtptyeq></span> ${products.filter((p) => !p.in_stock).length} out of stock
</span> </div> </div> </div>`} </div> ` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/products/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/products/index.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/products/index.astro";
const $$url = "/admin/products";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
