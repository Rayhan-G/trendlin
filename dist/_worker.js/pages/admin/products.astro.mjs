globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createAstro, a as createComponent, g as renderComponent, f as renderScript, d as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../chunks/astro/server_DVHrQl8d.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_EzYbiflv.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
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
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Products", "description": "Manage your product catalog", "data-astro-cid-jgtptyeq": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="products-header" data-astro-cid-jgtptyeq> <div data-astro-cid-jgtptyeq> <h1 class="page-title" data-astro-cid-jgtptyeq>📦 Products</h1> <p class="page-subtitle" data-astro-cid-jgtptyeq>${products.length} products in your catalog</p> </div> <a href="/admin/products/new" class="btn-primary" data-astro-cid-jgtptyeq> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-jgtptyeq> <line x1="12" y1="5" x2="12" y2="19" data-astro-cid-jgtptyeq></line> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-jgtptyeq></line> </svg>
Add New Product
</a> </div> ${products.length === 0 ? renderTemplate`<div class="empty-state" data-astro-cid-jgtptyeq> <div class="empty-icon" data-astro-cid-jgtptyeq>📦</div> <h3 data-astro-cid-jgtptyeq>No products yet</h3> <p data-astro-cid-jgtptyeq>Create your first product to get started.</p> <a href="/admin/products/new" class="btn-primary" data-astro-cid-jgtptyeq>Add Product</a> </div>` : renderTemplate`<div class="table-wrapper" data-astro-cid-jgtptyeq> <table class="products-table" data-astro-cid-jgtptyeq> <thead data-astro-cid-jgtptyeq> <tr data-astro-cid-jgtptyeq> <th data-astro-cid-jgtptyeq>Image</th> <th data-astro-cid-jgtptyeq>Name</th> <th data-astro-cid-jgtptyeq>Category</th> <th data-astro-cid-jgtptyeq>Brand</th> <th data-astro-cid-jgtptyeq>Resources</th> <th data-astro-cid-jgtptyeq>Status</th> <th data-astro-cid-jgtptyeq>Actions</th> </tr> </thead> <tbody data-astro-cid-jgtptyeq> ${products.map((product) => renderTemplate`<tr${addAttribute(product.id, "key")} data-astro-cid-jgtptyeq> <td data-astro-cid-jgtptyeq> ${product.cover_image ? renderTemplate`<img${addAttribute(product.cover_image, "src")}${addAttribute(product.name, "alt")} class="product-thumb" data-astro-cid-jgtptyeq>` : renderTemplate`<div class="product-thumb-placeholder" data-astro-cid-jgtptyeq>📷</div>`} </td> <td data-astro-cid-jgtptyeq> <strong data-astro-cid-jgtptyeq>${product.name}</strong> <div class="product-slug" data-astro-cid-jgtptyeq>/products/${product.slug}</div> <div class="product-badges" data-astro-cid-jgtptyeq> ${product.is_top_pick === 1 && renderTemplate`<span class="badge badge-top" data-astro-cid-jgtptyeq>⭐ Top Pick</span>`} ${product.is_newly_released === 1 && renderTemplate`<span class="badge badge-new" data-astro-cid-jgtptyeq>✨ New</span>`} </div> </td> <td data-astro-cid-jgtptyeq>${product.category || "\u2014"}</td> <td data-astro-cid-jgtptyeq>${product.brand || "\u2014"}</td> <td data-astro-cid-jgtptyeq> <span class="resource-badge" data-astro-cid-jgtptyeq>${product.resource_count || 0}</span> <a${addAttribute(`/admin/products/${product.id}/resources`, "href")} class="resource-link" data-astro-cid-jgtptyeq>Manage</a> </td> <td data-astro-cid-jgtptyeq> <span${addAttribute(`status-badge ${product.in_stock ? "in-stock" : "out-of-stock"}`, "class")} data-astro-cid-jgtptyeq> ${product.in_stock ? "\u2705 In Stock" : "\u274C Out of Stock"} </span> </td> <td data-astro-cid-jgtptyeq> <div class="action-buttons" data-astro-cid-jgtptyeq> <a${addAttribute(`/admin/products/${product.id}/resources`, "href")} class="btn-sm btn-resources" data-astro-cid-jgtptyeq>🔗 Resources</a> <button class="btn-sm btn-delete" onclick="if(confirm('Delete this product?')) deleteProduct({product.id})" data-astro-cid-jgtptyeq>🗑️ Delete</button> </div> </td> </tr>`)} </tbody> </table> </div>`}` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/products/index.astro?astro&type=script&index=0&lang.ts")}`;
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
