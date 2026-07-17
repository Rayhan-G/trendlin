globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                          */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../../chunks/AdminLayout_G02ipTsx.mjs';
/* empty css                                         */
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { DB } = Astro2.locals.runtime.env;
  let product = null;
  let resources = [];
  let error = null;
  let success = false;
  try {
    const productResult = await DB.prepare(`
    SELECT 
      p.*,
      COUNT(r.id) as resource_count
    FROM products p
    LEFT JOIN product_resources r ON r.product_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `).bind(id).first();
    if (productResult) {
      product = productResult;
      const resourceResult = await DB.prepare(`
      SELECT * FROM product_resources 
      WHERE product_id = ?
      ORDER BY display_order ASC, id ASC
    `).bind(id).all();
      resources = resourceResult.results || [];
    } else {
      error = "Product not found";
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    error = "Failed to load product";
  }
  if (Astro2.request.method === "POST") {
    try {
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
      await DB.prepare(`
      UPDATE products 
      SET 
        name = ?,
        slug = ?,
        description = ?,
        category = ?,
        brand = ?,
        cover_image = ?,
        in_stock = ?,
        is_top_pick = ?,
        is_newly_released = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
        name,
        slug,
        description,
        category,
        brand,
        cover_image,
        in_stock,
        is_top_pick,
        is_newly_released,
        id
      ).run();
      await DB.prepare("DELETE FROM product_resources WHERE product_id = ?").bind(id).run();
      const newResources = [];
      for (let i = 0; i < 4; i++) {
        const platform = formData.get(`resource_platform_${i}`);
        const url = formData.get(`resource_url_${i}`);
        const title = formData.get(`resource_title_${i}`);
        const description2 = formData.get(`resource_description_${i}`);
        const author = formData.get(`resource_author_${i}`);
        const shop_name = formData.get(`resource_shop_name_${i}`);
        const is_featured = formData.get(`resource_featured_${i}`) ? 1 : 0;
        if (platform && url && title) {
          newResources.push({
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
      if (newResources.length > 0) {
        for (let i = 0; i < newResources.length; i++) {
          const r = newResources[i];
          await DB.prepare(`
          INSERT INTO product_resources (
            product_id, platform, url, title, description, 
            author, shop_name, is_featured, display_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
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
      return Astro2.redirect(`/admin/products/${id}/resources`);
    } catch (e) {
      error = e.message;
      console.error("Error updating product:", e);
    }
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": `Edit Product - ${product?.name || "Product"}`, "data-astro-cid-rro7ooei": true }, { "default": async ($$result2) => renderTemplate`  ${error && renderTemplate`${maybeRenderHead()}<div class="alert alert-error" data-astro-cid-rro7ooei> <strong data-astro-cid-rro7ooei>Error:</strong> ${error} </div>`} ${success && renderTemplate`<div class="alert alert-success" data-astro-cid-rro7ooei> <strong data-astro-cid-rro7ooei>Success!</strong> Product updated successfully.
</div>`}${product ? renderTemplate`<form method="POST" class="product-form" id="productForm" data-astro-cid-rro7ooei> <!-- ============================================ --> <!-- SECTION 1: Product Details --> <!-- ============================================ --> <div class="form-section" data-astro-cid-rro7ooei> <h3 class="section-title" data-astro-cid-rro7ooei>📦 Product Details</h3> <div class="form-grid" data-astro-cid-rro7ooei> <!-- Product Name --> <div class="form-group" data-astro-cid-rro7ooei> <label for="name" data-astro-cid-rro7ooei>Product Name *</label> <input type="text" id="name" name="name" required${addAttribute(product.name || "", "value")} placeholder="e.g. Apple AirPods Pro 2" class="form-input" data-astro-cid-rro7ooei> </div> <!-- Slug --> <div class="form-group" data-astro-cid-rro7ooei> <label for="slug" data-astro-cid-rro7ooei>Slug (URL)</label> <input type="text" id="slug" name="slug"${addAttribute(product.slug || "", "value")} placeholder="apple-airpods-pro-2" class="form-input" data-astro-cid-rro7ooei> <span class="form-hint" data-astro-cid-rro7ooei>Leave blank to auto-generate from name</span> </div> <!-- Description --> <div class="form-group full-width" data-astro-cid-rro7ooei> <label for="description" data-astro-cid-rro7ooei>Description</label> <textarea id="description" name="description" rows="4" placeholder="Product description..." class="form-textarea" data-astro-cid-rro7ooei>${product.description || ""}</textarea> </div> <!-- Category --> <div class="form-group" data-astro-cid-rro7ooei> <label for="category" data-astro-cid-rro7ooei>Category *</label> <select id="category" name="category" required class="form-select" data-astro-cid-rro7ooei> <option value="" data-astro-cid-rro7ooei>Select Category</option> <option value="Electronics"${addAttribute(product.category === "Electronics", "selected")} data-astro-cid-rro7ooei>Electronics</option> <option value="Health & Wellness"${addAttribute(product.category === "Health & Wellness", "selected")} data-astro-cid-rro7ooei>Health & Wellness</option> <option value="Food & Dining"${addAttribute(product.category === "Food & Dining", "selected")} data-astro-cid-rro7ooei>Food & Dining</option> <option value="Entertainment"${addAttribute(product.category === "Entertainment", "selected")} data-astro-cid-rro7ooei>Entertainment</option> <option value="Lifestyle"${addAttribute(product.category === "Lifestyle", "selected")} data-astro-cid-rro7ooei>Lifestyle</option> <option value="Technology"${addAttribute(product.category === "Technology", "selected")} data-astro-cid-rro7ooei>Technology</option> <option value="Shopping"${addAttribute(product.category === "Shopping", "selected")} data-astro-cid-rro7ooei>Shopping</option> <option value="Real Estate"${addAttribute(product.category === "Real Estate", "selected")} data-astro-cid-rro7ooei>Real Estate</option> <option value="Finance"${addAttribute(product.category === "Finance", "selected")} data-astro-cid-rro7ooei>Finance</option> <option value="Travel"${addAttribute(product.category === "Travel", "selected")} data-astro-cid-rro7ooei>Travel</option> <option value="Fashion"${addAttribute(product.category === "Fashion", "selected")} data-astro-cid-rro7ooei>Fashion</option> </select> </div> <!-- Brand --> <div class="form-group" data-astro-cid-rro7ooei> <label for="brand" data-astro-cid-rro7ooei>Brand</label> <input type="text" id="brand" name="brand"${addAttribute(product.brand || "", "value")} placeholder="e.g. Apple" class="form-input" data-astro-cid-rro7ooei> </div> <!-- Cover Image --> <div class="form-group full-width" data-astro-cid-rro7ooei> <label for="cover_image" data-astro-cid-rro7ooei>Cover Image</label> <div class="image-upload-wrapper" data-astro-cid-rro7ooei> <input type="url" id="cover_image" name="cover_image"${addAttribute(product.cover_image || "", "value")} placeholder="https://images.unsplash.com/..." class="form-input" data-astro-cid-rro7ooei> <button type="button" id="uploadBtn" class="btn-upload" data-astro-cid-rro7ooei>
📤 Upload
</button> </div> <!-- Cover Preview --> <div id="coverPreview"${addAttribute(`cover-preview ${product.cover_image ? "" : "hidden"}`, "class")} data-astro-cid-rro7ooei> <div class="cover-preview-inner" data-astro-cid-rro7ooei> <img id="coverPreviewImg"${addAttribute(product.cover_image || "", "src")} alt="Cover preview" data-astro-cid-rro7ooei> <button type="button" id="removeCoverBtn" class="remove-btn" data-astro-cid-rro7ooei>✕</button> </div> </div> </div> </div> </div> <!-- ============================================ --> <!-- SECTION 2: Product Status --> <!-- ============================================ --> <div class="form-section" data-astro-cid-rro7ooei> <h3 class="section-title" data-astro-cid-rro7ooei>⚙️ Product Status</h3> <div class="checkbox-grid" data-astro-cid-rro7ooei> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" id="in_stock" name="in_stock"${addAttribute(product.in_stock === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>✅ In Stock</span> </label> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" id="is_top_pick" name="is_top_pick"${addAttribute(product.is_top_pick === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>⭐ Top Pick</span> </label> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" id="is_newly_released" name="is_newly_released"${addAttribute(product.is_newly_released === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>✨ Newly Released</span> </label> </div> </div> <!-- ============================================ --> <!-- SECTION 3: Resources (Up to 4) --> <!-- ============================================ --> <div class="form-section" data-astro-cid-rro7ooei> <h3 class="section-title" data-astro-cid-rro7ooei>
🔗 Product Resources
<span class="optional" data-astro-cid-rro7ooei>(Optional - Up to 4)</span> </h3> <p class="section-desc" data-astro-cid-rro7ooei>
Add resources for <strong data-astro-cid-rro7ooei>Reddit</strong>, <strong data-astro-cid-rro7ooei>YouTube</strong>, <strong data-astro-cid-rro7ooei>TikTok</strong>, or <strong data-astro-cid-rro7ooei>Shop</strong>.
          You can add more later from the product's resources page.
</p> <div id="resourcesContainer" data-astro-cid-rro7ooei> <!-- Resource 1 --> <div class="resource-row" data-astro-cid-rro7ooei> <div class="resource-header" data-astro-cid-rro7ooei> <span class="resource-number" data-astro-cid-rro7ooei>#1</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-rro7ooei>✕</button> </div> <div class="resource-fields" data-astro-cid-rro7ooei> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Platform *</label> <select name="resource_platform_0" class="resource-platform form-select" data-astro-cid-rro7ooei> <option value="" data-astro-cid-rro7ooei>Select</option> <option value="reddit"${addAttribute(resources[0]?.platform === "reddit", "selected")} data-astro-cid-rro7ooei>Reddit</option> <option value="youtube"${addAttribute(resources[0]?.platform === "youtube", "selected")} data-astro-cid-rro7ooei>YouTube</option> <option value="tiktok"${addAttribute(resources[0]?.platform === "tiktok", "selected")} data-astro-cid-rro7ooei>TikTok</option> <option value="shop"${addAttribute(resources[0]?.platform === "shop", "selected")} data-astro-cid-rro7ooei>Shop</option> </select> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>URL *</label> <input type="url" name="resource_url_0"${addAttribute(resources[0]?.url || "", "value")} placeholder="https://..." class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Title *</label> <input type="text" name="resource_title_0"${addAttribute(resources[0]?.title || "", "value")} placeholder="Resource title" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Description</label> <input type="text" name="resource_description_0"${addAttribute(resources[0]?.description || "", "value")} placeholder="Optional description" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Author</label> <input type="text" name="resource_author_0"${addAttribute(resources[0]?.author || "", "value")} placeholder="u/username or @username" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group shop-name-group"${addAttribute(`display: ${resources[0]?.platform === "shop" ? "block" : "none"};`, "style")} data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Shop Name</label> <input type="text" name="resource_shop_name_0"${addAttribute(resources[0]?.shop_name || "", "value")} placeholder="e.g. Amazon" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group checkbox-group" data-astro-cid-rro7ooei> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" name="resource_featured_0"${addAttribute(resources[0]?.is_featured === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>⭐ Featured</span> </label> </div> </div> </div> <!-- Resource 2 --> <div class="resource-row" data-astro-cid-rro7ooei> <div class="resource-header" data-astro-cid-rro7ooei> <span class="resource-number" data-astro-cid-rro7ooei>#2</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-rro7ooei>✕</button> </div> <div class="resource-fields" data-astro-cid-rro7ooei> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Platform *</label> <select name="resource_platform_1" class="resource-platform form-select" data-astro-cid-rro7ooei> <option value="" data-astro-cid-rro7ooei>Select</option> <option value="reddit"${addAttribute(resources[1]?.platform === "reddit", "selected")} data-astro-cid-rro7ooei>Reddit</option> <option value="youtube"${addAttribute(resources[1]?.platform === "youtube", "selected")} data-astro-cid-rro7ooei>YouTube</option> <option value="tiktok"${addAttribute(resources[1]?.platform === "tiktok", "selected")} data-astro-cid-rro7ooei>TikTok</option> <option value="shop"${addAttribute(resources[1]?.platform === "shop", "selected")} data-astro-cid-rro7ooei>Shop</option> </select> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>URL *</label> <input type="url" name="resource_url_1"${addAttribute(resources[1]?.url || "", "value")} placeholder="https://..." class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Title *</label> <input type="text" name="resource_title_1"${addAttribute(resources[1]?.title || "", "value")} placeholder="Resource title" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Description</label> <input type="text" name="resource_description_1"${addAttribute(resources[1]?.description || "", "value")} placeholder="Optional description" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Author</label> <input type="text" name="resource_author_1"${addAttribute(resources[1]?.author || "", "value")} placeholder="u/username or @username" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group shop-name-group"${addAttribute(`display: ${resources[1]?.platform === "shop" ? "block" : "none"};`, "style")} data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Shop Name</label> <input type="text" name="resource_shop_name_1"${addAttribute(resources[1]?.shop_name || "", "value")} placeholder="e.g. Amazon" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group checkbox-group" data-astro-cid-rro7ooei> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" name="resource_featured_1"${addAttribute(resources[1]?.is_featured === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>⭐ Featured</span> </label> </div> </div> </div> <!-- Resource 3 --> <div class="resource-row" data-astro-cid-rro7ooei> <div class="resource-header" data-astro-cid-rro7ooei> <span class="resource-number" data-astro-cid-rro7ooei>#3</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-rro7ooei>✕</button> </div> <div class="resource-fields" data-astro-cid-rro7ooei> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Platform *</label> <select name="resource_platform_2" class="resource-platform form-select" data-astro-cid-rro7ooei> <option value="" data-astro-cid-rro7ooei>Select</option> <option value="reddit"${addAttribute(resources[2]?.platform === "reddit", "selected")} data-astro-cid-rro7ooei>Reddit</option> <option value="youtube"${addAttribute(resources[2]?.platform === "youtube", "selected")} data-astro-cid-rro7ooei>YouTube</option> <option value="tiktok"${addAttribute(resources[2]?.platform === "tiktok", "selected")} data-astro-cid-rro7ooei>TikTok</option> <option value="shop"${addAttribute(resources[2]?.platform === "shop", "selected")} data-astro-cid-rro7ooei>Shop</option> </select> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>URL *</label> <input type="url" name="resource_url_2"${addAttribute(resources[2]?.url || "", "value")} placeholder="https://..." class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Title *</label> <input type="text" name="resource_title_2"${addAttribute(resources[2]?.title || "", "value")} placeholder="Resource title" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Description</label> <input type="text" name="resource_description_2"${addAttribute(resources[2]?.description || "", "value")} placeholder="Optional description" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Author</label> <input type="text" name="resource_author_2"${addAttribute(resources[2]?.author || "", "value")} placeholder="u/username or @username" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group shop-name-group"${addAttribute(`display: ${resources[2]?.platform === "shop" ? "block" : "none"};`, "style")} data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Shop Name</label> <input type="text" name="resource_shop_name_2"${addAttribute(resources[2]?.shop_name || "", "value")} placeholder="e.g. Amazon" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group checkbox-group" data-astro-cid-rro7ooei> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" name="resource_featured_2"${addAttribute(resources[2]?.is_featured === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>⭐ Featured</span> </label> </div> </div> </div> <!-- Resource 4 --> <div class="resource-row" data-astro-cid-rro7ooei> <div class="resource-header" data-astro-cid-rro7ooei> <span class="resource-number" data-astro-cid-rro7ooei>#4</span> <button type="button" class="remove-resource-btn" style="display:none;" data-astro-cid-rro7ooei>✕</button> </div> <div class="resource-fields" data-astro-cid-rro7ooei> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Platform *</label> <select name="resource_platform_3" class="resource-platform form-select" data-astro-cid-rro7ooei> <option value="" data-astro-cid-rro7ooei>Select</option> <option value="reddit"${addAttribute(resources[3]?.platform === "reddit", "selected")} data-astro-cid-rro7ooei>Reddit</option> <option value="youtube"${addAttribute(resources[3]?.platform === "youtube", "selected")} data-astro-cid-rro7ooei>YouTube</option> <option value="tiktok"${addAttribute(resources[3]?.platform === "tiktok", "selected")} data-astro-cid-rro7ooei>TikTok</option> <option value="shop"${addAttribute(resources[3]?.platform === "shop", "selected")} data-astro-cid-rro7ooei>Shop</option> </select> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>URL *</label> <input type="url" name="resource_url_3"${addAttribute(resources[3]?.url || "", "value")} placeholder="https://..." class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Title *</label> <input type="text" name="resource_title_3"${addAttribute(resources[3]?.title || "", "value")} placeholder="Resource title" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Description</label> <input type="text" name="resource_description_3"${addAttribute(resources[3]?.description || "", "value")} placeholder="Optional description" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group" data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Author</label> <input type="text" name="resource_author_3"${addAttribute(resources[3]?.author || "", "value")} placeholder="u/username or @username" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group shop-name-group"${addAttribute(`display: ${resources[3]?.platform === "shop" ? "block" : "none"};`, "style")} data-astro-cid-rro7ooei> <label data-astro-cid-rro7ooei>Shop Name</label> <input type="text" name="resource_shop_name_3"${addAttribute(resources[3]?.shop_name || "", "value")} placeholder="e.g. Amazon" class="form-input" data-astro-cid-rro7ooei> </div> <div class="form-group checkbox-group" data-astro-cid-rro7ooei> <label class="checkbox-label" data-astro-cid-rro7ooei> <input type="checkbox" name="resource_featured_3"${addAttribute(resources[3]?.is_featured === 1, "checked")} data-astro-cid-rro7ooei> <span data-astro-cid-rro7ooei>⭐ Featured</span> </label> </div> </div> </div> </div> <button type="button" id="addResourceRow" class="btn-add-row" data-astro-cid-rro7ooei>
+ Add Resource
</button> </div> <!-- ============================================ --> <!-- SECTION 4: Form Actions --> <!-- ============================================ --> <div class="form-actions" data-astro-cid-rro7ooei> <a href="/admin/products" class="btn-secondary" data-astro-cid-rro7ooei>← Cancel</a> <a${addAttribute(`/admin/products/${product.id}/resources`, "href")} class="btn-secondary" data-astro-cid-rro7ooei>
📂 Manage Resources (${product.resource_count || 0})
</a> <button type="submit" class="btn-primary" data-astro-cid-rro7ooei> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-astro-cid-rro7ooei> <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" data-astro-cid-rro7ooei></path> <polyline points="17 21 17 13 7 13 7 21" data-astro-cid-rro7ooei></polyline> <polyline points="7 3 7 8 15 8" data-astro-cid-rro7ooei></polyline> </svg>
Update Product
</button> </div> </form>` : renderTemplate`<div class="not-found" data-astro-cid-rro7ooei> <div class="not-found-icon" data-astro-cid-rro7ooei>🔍</div> <h2 data-astro-cid-rro7ooei>Product Not Found</h2> <p data-astro-cid-rro7ooei>The product you're looking for doesn't exist or has been removed.</p> <a href="/admin/products" class="btn-primary" data-astro-cid-rro7ooei>← Back to Products</a> </div>`}` })} <!-- ============================================ --> <!-- STYLES --> <!-- ============================================ -->  <!-- ============================================ --> <!-- JAVASCRIPT --> <!-- ============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/products/edit/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/products/edit/[id].astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/products/edit/[id].astro";
const $$url = "/admin/products/edit/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
