globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                       */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_Cu1IFVzQ.mjs';
/* empty css                                     */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$New;
  let error = null;
  let success = false;
  let productId = null;
  let productName = "";
  if (Astro2.request.method === "POST") {
    try {
      const { DB } = Astro2.locals.runtime.env;
      const formData = await Astro2.request.formData();
      const name = formData.get("name");
      const slug = formData.get("slug") || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const description = formData.get("description");
      const category = formData.get("category");
      const brand = formData.get("brand");
      const cover_image = formData.get("cover_image");
      const in_stock = formData.get("in_stock") ? 1 : 0;
      const is_top_pick = formData.get("is_top_pick") ? 1 : 0;
      const is_newly_released = formData.get("is_newly_released") ? 1 : 0;
      productName = name;
      const result = await DB.prepare(`
      INSERT INTO products (
        name, slug, description, category, brand, 
        cover_image, in_stock, is_top_pick, is_newly_released
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
        name,
        slug,
        description,
        category,
        brand,
        cover_image,
        in_stock,
        is_top_pick,
        is_newly_released
      ).run();
      productId = result.meta?.last_row_id || result.lastRowId;
      if (productId) {
        const resources = [];
        for (let i = 0; i < 4; i++) {
          const platform = formData.get(`resource_platform_${i}`);
          const url = formData.get(`resource_url_${i}`);
          const title = formData.get(`resource_title_${i}`);
          const description2 = formData.get(`resource_description_${i}`);
          const author = formData.get(`resource_author_${i}`);
          const shop_name = formData.get(`resource_shop_name_${i}`);
          const is_featured = formData.get(`resource_featured_${i}`) ? 1 : 0;
          if (platform && url && title) {
            resources.push({
              platform,
              url,
              title,
              description: description2 || "",
              author: author || "",
              shop_name: shop_name || "",
              is_featured
            });
          }
        }
        if (resources.length > 0) {
          for (let i = 0; i < resources.length; i++) {
            const r = resources[i];
            await DB.prepare(`
            INSERT INTO product_resources (
              product_id, platform, url, title, description, 
              author, shop_name, is_featured, display_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
              productId,
              r.platform,
              r.url,
              r.title,
              r.description,
              r.author,
              r.shop_name,
              r.is_featured,
              i + 1
            ).run();
          }
        }
        success = true;
        return Astro2.redirect(`/admin/products/${productId}/resources`);
      }
    } catch (e) {
      error = e.message;
      console.error("Error creating product:", e);
    }
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Add New Product", "description": "Create a new product with up to 4 resources", "data-astro-cid-unfxests": true }, { "default": async ($$result2) => renderTemplate`  ${error && renderTemplate`${maybeRenderHead()}<div class="alert alert-error" data-astro-cid-unfxests> <strong data-astro-cid-unfxests>Error:</strong> ${error} </div>`} ${success && renderTemplate`<div class="alert alert-success" data-astro-cid-unfxests> <strong data-astro-cid-unfxests>Success!</strong> Product "${productName}" created successfully.
</div>`}<form method="POST" class="product-form" id="productForm" data-astro-cid-unfxests> <!-- ============================================ --> <!-- SECTION 1: Product Details --> <!-- ============================================ --> <div class="form-section" data-astro-cid-unfxests> <h3 class="section-title" data-astro-cid-unfxests>📦 Product Details</h3> <div class="form-grid" data-astro-cid-unfxests> <!-- Product Name --> <div class="form-group" data-astro-cid-unfxests> <label for="name" data-astro-cid-unfxests>Product Name *</label> <input type="text" id="name" name="name" required placeholder="e.g. Apple AirPods Pro 2" class="form-input" data-astro-cid-unfxests> </div> <!-- Slug --> <div class="form-group" data-astro-cid-unfxests> <label for="slug" data-astro-cid-unfxests>Slug (URL)</label> <input type="text" id="slug" name="slug" placeholder="apple-airpods-pro-2" class="form-input" data-astro-cid-unfxests> <span class="form-hint" data-astro-cid-unfxests>Leave blank to auto-generate from name</span> </div> <!-- Description --> <div class="form-group full-width" data-astro-cid-unfxests> <label for="description" data-astro-cid-unfxests>Description</label> <textarea id="description" name="description" rows="4" placeholder="Product description..." class="form-textarea" data-astro-cid-unfxests></textarea> </div> <!-- Category --> <div class="form-group" data-astro-cid-unfxests> <label for="category" data-astro-cid-unfxests>Category *</label> <select id="category" name="category" required class="form-select" data-astro-cid-unfxests> <option value="" data-astro-cid-unfxests>Select Category</option> <option value="Electronics" data-astro-cid-unfxests>Electronics</option> <option value="Health & Wellness" data-astro-cid-unfxests>Health & Wellness</option> <option value="Food & Dining" data-astro-cid-unfxests>Food & Dining</option> <option value="Entertainment" data-astro-cid-unfxests>Entertainment</option> <option value="Lifestyle" data-astro-cid-unfxests>Lifestyle</option> <option value="Technology" data-astro-cid-unfxests>Technology</option> <option value="Shopping" data-astro-cid-unfxests>Shopping</option> <option value="Real Estate" data-astro-cid-unfxests>Real Estate</option> <option value="Finance" data-astro-cid-unfxests>Finance</option> <option value="Travel" data-astro-cid-unfxests>Travel</option> <option value="Fashion" data-astro-cid-unfxests>Fashion</option> </select> </div> <!-- Brand --> <div class="form-group" data-astro-cid-unfxests> <label for="brand" data-astro-cid-unfxests>Brand</label> <input type="text" id="brand" name="brand" placeholder="e.g. Apple" class="form-input" data-astro-cid-unfxests> </div> <!-- Cover Image --> <div class="form-group full-width" data-astro-cid-unfxests> <label for="cover_image" data-astro-cid-unfxests>Cover Image</label> <div class="image-upload-wrapper" data-astro-cid-unfxests> <input type="url" id="cover_image" name="cover_image" placeholder="https://images.unsplash.com/..." class="form-input" data-astro-cid-unfxests> <button type="button" id="uploadBtn" class="btn-upload" data-astro-cid-unfxests>
📤 Upload
</button> </div> <!-- Cover Preview --> <div id="coverPreview" class="cover-preview hidden" data-astro-cid-unfxests> <div class="cover-preview-inner" data-astro-cid-unfxests> <img id="coverPreviewImg" src="" alt="Cover preview" data-astro-cid-unfxests> <button type="button" id="removeCoverBtn" class="remove-btn" data-astro-cid-unfxests>✕</button> </div> </div> </div> </div> </div> <!-- ============================================ --> <!-- SECTION 2: Product Status --> <!-- ============================================ --> <div class="form-section" data-astro-cid-unfxests> <h3 class="section-title" data-astro-cid-unfxests>⚙️ Product Status</h3> <div class="checkbox-grid" data-astro-cid-unfxests> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" id="in_stock" name="in_stock" checked data-astro-cid-unfxests> <span data-astro-cid-unfxests>✅ In Stock</span> </label> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" id="is_top_pick" name="is_top_pick" data-astro-cid-unfxests> <span data-astro-cid-unfxests>⭐ Top Pick</span> </label> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" id="is_newly_released" name="is_newly_released" data-astro-cid-unfxests> <span data-astro-cid-unfxests>✨ Newly Released</span> </label> </div> </div> <!-- ============================================ --> <!-- SECTION 3: Resources (Up to 4) --> <!-- ============================================ --> <div class="form-section" data-astro-cid-unfxests> <h3 class="section-title" data-astro-cid-unfxests>
🔗 Product Resources
<span class="optional" data-astro-cid-unfxests>(Optional - Up to 4)</span> </h3> <p class="section-desc" data-astro-cid-unfxests>
Add resources for <strong data-astro-cid-unfxests>Reddit</strong>, <strong data-astro-cid-unfxests>YouTube</strong>, <strong data-astro-cid-unfxests>TikTok</strong>, or <strong data-astro-cid-unfxests>Shop</strong>.
        You can add more later from the product's resources page.
</p> <div id="resourcesContainer" data-astro-cid-unfxests> <!-- Resource 1 --> <div class="resource-row" data-astro-cid-unfxests> <div class="resource-header" data-astro-cid-unfxests> <span class="resource-number" data-astro-cid-unfxests>#1</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-unfxests>✕</button> </div> <div class="resource-fields" data-astro-cid-unfxests> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Platform *</label> <select name="resource_platform_0" class="resource-platform form-select" required data-astro-cid-unfxests> <option value="" data-astro-cid-unfxests>Select</option> <option value="reddit" data-astro-cid-unfxests>Reddit</option> <option value="youtube" data-astro-cid-unfxests>YouTube</option> <option value="tiktok" data-astro-cid-unfxests>TikTok</option> <option value="shop" data-astro-cid-unfxests>Shop</option> </select> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>URL *</label> <input type="url" name="resource_url_0" placeholder="https://..." class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Title *</label> <input type="text" name="resource_title_0" placeholder="Resource title" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Description</label> <input type="text" name="resource_description_0" placeholder="Optional description" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Author</label> <input type="text" name="resource_author_0" placeholder="u/username or @username" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group shop-name-group" style="display:none;" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Shop Name</label> <input type="text" name="resource_shop_name_0" placeholder="e.g. Amazon" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group checkbox-group" data-astro-cid-unfxests> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" name="resource_featured_0" data-astro-cid-unfxests> <span data-astro-cid-unfxests>⭐ Featured</span> </label> </div> </div> </div> <!-- Resource 2 --> <div class="resource-row" data-astro-cid-unfxests> <div class="resource-header" data-astro-cid-unfxests> <span class="resource-number" data-astro-cid-unfxests>#2</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-unfxests>✕</button> </div> <div class="resource-fields" data-astro-cid-unfxests> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Platform *</label> <select name="resource_platform_1" class="resource-platform form-select" data-astro-cid-unfxests> <option value="" data-astro-cid-unfxests>Select</option> <option value="reddit" data-astro-cid-unfxests>Reddit</option> <option value="youtube" data-astro-cid-unfxests>YouTube</option> <option value="tiktok" data-astro-cid-unfxests>TikTok</option> <option value="shop" data-astro-cid-unfxests>Shop</option> </select> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>URL *</label> <input type="url" name="resource_url_1" placeholder="https://..." class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Title *</label> <input type="text" name="resource_title_1" placeholder="Resource title" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Description</label> <input type="text" name="resource_description_1" placeholder="Optional description" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Author</label> <input type="text" name="resource_author_1" placeholder="u/username or @username" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group shop-name-group" style="display:none;" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Shop Name</label> <input type="text" name="resource_shop_name_1" placeholder="e.g. Amazon" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group checkbox-group" data-astro-cid-unfxests> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" name="resource_featured_1" data-astro-cid-unfxests> <span data-astro-cid-unfxests>⭐ Featured</span> </label> </div> </div> </div> <!-- Resource 3 --> <div class="resource-row" data-astro-cid-unfxests> <div class="resource-header" data-astro-cid-unfxests> <span class="resource-number" data-astro-cid-unfxests>#3</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-unfxests>✕</button> </div> <div class="resource-fields" data-astro-cid-unfxests> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Platform *</label> <select name="resource_platform_2" class="resource-platform form-select" data-astro-cid-unfxests> <option value="" data-astro-cid-unfxests>Select</option> <option value="reddit" data-astro-cid-unfxests>Reddit</option> <option value="youtube" data-astro-cid-unfxests>YouTube</option> <option value="tiktok" data-astro-cid-unfxests>TikTok</option> <option value="shop" data-astro-cid-unfxests>Shop</option> </select> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>URL *</label> <input type="url" name="resource_url_2" placeholder="https://..." class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Title *</label> <input type="text" name="resource_title_2" placeholder="Resource title" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Description</label> <input type="text" name="resource_description_2" placeholder="Optional description" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Author</label> <input type="text" name="resource_author_2" placeholder="u/username or @username" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group shop-name-group" style="display:none;" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Shop Name</label> <input type="text" name="resource_shop_name_2" placeholder="e.g. Amazon" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group checkbox-group" data-astro-cid-unfxests> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" name="resource_featured_2" data-astro-cid-unfxests> <span data-astro-cid-unfxests>⭐ Featured</span> </label> </div> </div> </div> <!-- Resource 4 --> <div class="resource-row" data-astro-cid-unfxests> <div class="resource-header" data-astro-cid-unfxests> <span class="resource-number" data-astro-cid-unfxests>#4</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-unfxests>✕</button> </div> <div class="resource-fields" data-astro-cid-unfxests> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Platform *</label> <select name="resource_platform_3" class="resource-platform form-select" data-astro-cid-unfxests> <option value="" data-astro-cid-unfxests>Select</option> <option value="reddit" data-astro-cid-unfxests>Reddit</option> <option value="youtube" data-astro-cid-unfxests>YouTube</option> <option value="tiktok" data-astro-cid-unfxests>TikTok</option> <option value="shop" data-astro-cid-unfxests>Shop</option> </select> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>URL *</label> <input type="url" name="resource_url_3" placeholder="https://..." class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Title *</label> <input type="text" name="resource_title_3" placeholder="Resource title" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Description</label> <input type="text" name="resource_description_3" placeholder="Optional description" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Author</label> <input type="text" name="resource_author_3" placeholder="u/username or @username" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group shop-name-group" style="display:none;" data-astro-cid-unfxests> <label data-astro-cid-unfxests>Shop Name</label> <input type="text" name="resource_shop_name_3" placeholder="e.g. Amazon" class="form-input" data-astro-cid-unfxests> </div> <div class="form-group checkbox-group" data-astro-cid-unfxests> <label class="checkbox-label" data-astro-cid-unfxests> <input type="checkbox" name="resource_featured_3" data-astro-cid-unfxests> <span data-astro-cid-unfxests>⭐ Featured</span> </label> </div> </div> </div> </div> <button type="button" id="addResourceRow" class="btn-add-row" data-astro-cid-unfxests>
+ Add Resource
</button> </div> <!-- ============================================ --> <!-- SECTION 4: Form Actions --> <!-- ============================================ --> <div class="form-actions" data-astro-cid-unfxests> <a href="/admin/products" class="btn-secondary" data-astro-cid-unfxests>← Cancel</a> <button type="submit" class="btn-primary" data-astro-cid-unfxests> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-unfxests> <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" data-astro-cid-unfxests></path> <polyline points="17 21 17 13 7 13 7 21" data-astro-cid-unfxests></polyline> <polyline points="7 3 7 8 15 8" data-astro-cid-unfxests></polyline> </svg>
Create Product
</button> </div> </form> ` })} <!-- ============================================ --> <!-- STYLES --> <!-- ============================================ -->  <!-- ============================================ --> <!-- JAVASCRIPT --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/products/new.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/products/new.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/products/new.astro";
const $$url = "/admin/products/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
