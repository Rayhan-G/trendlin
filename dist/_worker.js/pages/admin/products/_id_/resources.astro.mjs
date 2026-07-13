globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                          */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../../chunks/AdminLayout_zDHvTD6y.mjs';
/* empty css                                              */
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$Resources = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Resources;
  const { id } = Astro2.params;
  let product = null;
  let resources = [];
  let error = null;
  let success = false;
  let deleteSuccess = false;
  try {
    const { DB } = Astro2.locals.runtime.env;
    const productResult = await DB.prepare(`
    SELECT id, name, slug, cover_image, category, brand, in_stock, is_top_pick, is_newly_released
    FROM products WHERE id = ?
  `).bind(id).first();
    product = productResult;
    const resourcesResult = await DB.prepare(`
    SELECT id, platform, url, title, description, author, shop_name, is_featured, display_order
    FROM product_resources
    WHERE product_id = ?
    ORDER BY display_order ASC
  `).bind(id).all();
    resources = resourcesResult.results || [];
  } catch (e) {
    error = e.message;
  }
  if (Astro2.request.method === "POST") {
    try {
      const { DB } = Astro2.locals.runtime.env;
      const formData = await Astro2.request.formData();
      const action = formData.get("_action");
      if (action === "delete") {
        const resourceId = formData.get("resource_id");
        await DB.prepare(`
        DELETE FROM product_resources WHERE id = ? AND product_id = ?
      `).bind(resourceId, id).run();
        deleteSuccess = true;
        const resourcesResult = await DB.prepare(`
        SELECT id, platform, url, title, description, author, shop_name, is_featured, display_order
        FROM product_resources
        WHERE product_id = ?
        ORDER BY display_order ASC
      `).bind(id).all();
        resources = resourcesResult.results || [];
      } else {
        const platform = formData.get("platform");
        const url = formData.get("url");
        const title = formData.get("title");
        const description = formData.get("description");
        const author = formData.get("author");
        const shop_name = formData.get("shop_name");
        const is_featured = formData.get("is_featured") ? 1 : 0;
        const allowedPlatforms = ["reddit", "youtube", "tiktok", "shop"];
        if (!platform || !allowedPlatforms.includes(platform)) {
          throw new Error("Platform must be: reddit, youtube, tiktok, or shop");
        }
        if (!url || !title) {
          throw new Error("URL and Title are required");
        }
        const maxOrderResult = await DB.prepare(`
        SELECT MAX(display_order) as max_order
        FROM product_resources
        WHERE product_id = ?
      `).bind(id).first();
        const display_order = (maxOrderResult?.max_order || 0) + 1;
        await DB.prepare(`
        INSERT INTO product_resources (
          product_id, platform, url, title, description, 
          author, shop_name, is_featured, display_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
          id,
          platform,
          url,
          title,
          description,
          author,
          shop_name,
          is_featured,
          display_order
        ).run();
        success = true;
        const resourcesResult = await DB.prepare(`
        SELECT id, platform, url, title, description, author, shop_name, is_featured, display_order
        FROM product_resources
        WHERE product_id = ?
        ORDER BY display_order ASC
      `).bind(id).all();
        resources = resourcesResult.results || [];
      }
    } catch (e) {
      error = e.message;
      console.error("Error:", e);
    }
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Resources: ${product?.name || "Product"}`, "data-astro-cid-4oj33g74": true }, { "default": async ($$result2) => renderTemplate`  ${error && renderTemplate`${maybeRenderHead()}<div class="alert alert-error" data-astro-cid-4oj33g74> <strong data-astro-cid-4oj33g74>Error:</strong> ${error} </div>`}${success && renderTemplate`<div class="alert alert-success" data-astro-cid-4oj33g74> <strong data-astro-cid-4oj33g74>✅ Success!</strong> Resource added successfully.
</div>`}${deleteSuccess && renderTemplate`<div class="alert alert-success" data-astro-cid-4oj33g74> <strong data-astro-cid-4oj33g74>✅ Success!</strong> Resource deleted successfully.
</div>`} <div class="product-info-bar" data-astro-cid-4oj33g74> <div class="product-info" data-astro-cid-4oj33g74> ${product?.cover_image && renderTemplate`<img${addAttribute(product.cover_image, "src")}${addAttribute(product.name, "alt")} class="product-avatar" data-astro-cid-4oj33g74>`} <span class="product-name" data-astro-cid-4oj33g74>${product?.name || "Loading..."}</span> <span class="product-slug" data-astro-cid-4oj33g74>/products/${product?.slug}</span> <div class="product-status-badges" data-astro-cid-4oj33g74> ${product?.in_stock && renderTemplate`<span class="badge in-stock" data-astro-cid-4oj33g74>✅ In Stock</span>`} ${product?.is_top_pick && renderTemplate`<span class="badge top-pick" data-astro-cid-4oj33g74>⭐ Top Pick</span>`} ${product?.is_newly_released && renderTemplate`<span class="badge new-release" data-astro-cid-4oj33g74>✨ New</span>`} </div> <span class="resource-count-badge" data-astro-cid-4oj33g74>${resources.length} resources</span> </div> <div class="product-actions" data-astro-cid-4oj33g74> <a href="/admin/products" class="btn-sm btn-back" data-astro-cid-4oj33g74>← Back</a> <a${addAttribute(`/products/${product?.slug}`, "href")} class="btn-sm btn-view" target="_blank" data-astro-cid-4oj33g74>🔗 View</a> </div> </div>  <div class="two-col" data-astro-cid-4oj33g74> <!-- LEFT: Add Resource Form --> <div class="card" data-astro-cid-4oj33g74> <div class="card-header" data-astro-cid-4oj33g74> <span data-astro-cid-4oj33g74>➕ Add Resource</span> <span class="platform-hint" data-astro-cid-4oj33g74>reddit · youtube · tiktok · shop</span> </div> <form method="POST" class="resource-form" id="resourceForm" data-astro-cid-4oj33g74> <div class="form-group" data-astro-cid-4oj33g74> <label for="platform" data-astro-cid-4oj33g74>Platform *</label> <select id="platform" name="platform" required class="form-select" data-astro-cid-4oj33g74> <option value="" data-astro-cid-4oj33g74>Select platform...</option> <option value="reddit" data-astro-cid-4oj33g74>Reddit</option> <option value="youtube" data-astro-cid-4oj33g74>YouTube</option> <option value="tiktok" data-astro-cid-4oj33g74>TikTok</option> <option value="shop" data-astro-cid-4oj33g74>Shop / Affiliate</option> </select> </div> <div class="form-group" data-astro-cid-4oj33g74> <label for="url" data-astro-cid-4oj33g74>URL *</label> <input type="url" id="url" name="url" required placeholder="https://..." class="form-input" data-astro-cid-4oj33g74> </div> <div class="form-group" data-astro-cid-4oj33g74> <label for="title" data-astro-cid-4oj33g74>Title *</label> <input type="text" id="title" name="title" required placeholder="Resource title..." class="form-input" data-astro-cid-4oj33g74> </div> <div class="form-group" data-astro-cid-4oj33g74> <label for="description" data-astro-cid-4oj33g74>Description</label> <input type="text" id="description" name="description" placeholder="Optional description..." class="form-input" data-astro-cid-4oj33g74> </div> <div class="form-group" data-astro-cid-4oj33g74> <label for="author" data-astro-cid-4oj33g74>Author / Username</label> <input type="text" id="author" name="author" placeholder="e.g. u/username or @username" class="form-input" data-astro-cid-4oj33g74> </div> <div class="form-group" id="shopNameGroup" style="display:none;" data-astro-cid-4oj33g74> <label for="shop_name" data-astro-cid-4oj33g74>Shop Name</label> <input type="text" id="shop_name" name="shop_name" placeholder="e.g. Amazon, eBay, Walmart" class="form-input" data-astro-cid-4oj33g74> </div> <div class="form-group checkbox-group" data-astro-cid-4oj33g74> <label class="checkbox-label" data-astro-cid-4oj33g74> <input type="checkbox" id="is_featured" name="is_featured" data-astro-cid-4oj33g74> <span data-astro-cid-4oj33g74>⭐ Featured Resource</span> </label> </div> <button type="submit" class="btn-primary" data-astro-cid-4oj33g74> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-4oj33g74> <line x1="12" y1="5" x2="12" y2="19" data-astro-cid-4oj33g74></line> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-4oj33g74></line> </svg>
Add Resource
</button> </form> </div> <!-- RIGHT: Existing Resources --> <div class="card" data-astro-cid-4oj33g74> <div class="card-header" data-astro-cid-4oj33g74> <span data-astro-cid-4oj33g74>📋 Existing Resources</span> <span class="resource-count" data-astro-cid-4oj33g74>${resources.length}</span> </div> ${resources.length === 0 ? renderTemplate`<div class="empty-resources" data-astro-cid-4oj33g74> <div class="empty-icon" data-astro-cid-4oj33g74>🔗</div> <p data-astro-cid-4oj33g74>No resources added yet.</p> <p class="text-muted" data-astro-cid-4oj33g74>Add Reddit, YouTube, TikTok, or Shop links above.</p> </div>` : renderTemplate`<div class="resource-list" data-astro-cid-4oj33g74> ${resources.map((r, index) => renderTemplate`<div class="resource-item"${addAttribute(r.id, "key")} data-astro-cid-4oj33g74> <div class="resource-info" data-astro-cid-4oj33g74> <span${addAttribute(`platform-badge platform-${r.platform}`, "class")} data-astro-cid-4oj33g74> ${r.platform} </span> <strong data-astro-cid-4oj33g74>${r.title}</strong> ${r.author && renderTemplate`<span class="resource-author" data-astro-cid-4oj33g74>by ${r.author}</span>`} ${r.shop_name && renderTemplate`<span class="shop-tag" data-astro-cid-4oj33g74>🛒 ${r.shop_name}</span>`} ${r.is_featured === 1 && renderTemplate`<span class="featured-tag" data-astro-cid-4oj33g74>⭐ Featured</span>`} <span class="resource-order" data-astro-cid-4oj33g74>#${index + 1}</span> </div> <div class="resource-actions" data-astro-cid-4oj33g74> <a${addAttribute(r.url, "href")} target="_blank" class="btn-sm btn-view" title="Open URL" data-astro-cid-4oj33g74>🔗</a> <form method="POST" style="display:inline;" onsubmit="return confirm('Remove this resource?')" data-astro-cid-4oj33g74> <input type="hidden" name="_action" value="delete" data-astro-cid-4oj33g74> <input type="hidden" name="resource_id"${addAttribute(r.id, "value")} data-astro-cid-4oj33g74> <button type="submit" class="btn-sm btn-delete" title="Delete" data-astro-cid-4oj33g74>✕</button> </form> </div> </div>`)} </div>`} </div> </div>  <div class="form-actions" data-astro-cid-4oj33g74> <a href="/admin/products" class="btn-secondary" data-astro-cid-4oj33g74>← Back to Products</a> <a href="/admin/products/new" class="btn-secondary" data-astro-cid-4oj33g74>+ Add New Product</a> </div> ` })} <!-- ============================================ --> <!-- STYLES --> <!-- ============================================ -->  <!-- ============================================ --> <!-- JAVASCRIPT --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/products/[id]/resources.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/products/[id]/resources.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/products/[id]/resources.astro";
const $$url = "/admin/products/[id]/resources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Resources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
