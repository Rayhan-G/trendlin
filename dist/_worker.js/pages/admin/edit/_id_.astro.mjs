globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                       */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_BnhcRbiJ.mjs';
/* empty css                                      */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://b484b1fd.my-content-site.pages.dev");
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let post = null;
  let error = null;
  try {
    const response = await fetch(`${Astro2.url.origin}/api/admin/posts/${id}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.post) {
        post = data.post;
      } else {
        error = "Post not found";
      }
    } else {
      error = "Post not found";
    }
  } catch (err) {
    error = "Error fetching post";
    console.error("Error:", err);
  }
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Edit Post - Trendlin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto"> <!-- Header --> <div class="flex items-center justify-between mb-6"> <div> <h1 class="text-3xl font-bold text-gray-900">Edit Post</h1> <p class="text-sm text-gray-500 mt-1">Update your content</p> </div> <div class="flex items-center gap-3"> <span class="text-xs text-gray-400">ID: ${id}</span> <span${addAttribute(`w-2 h-2 rounded-full ${post?.is_draft ? "bg-yellow-500" : "bg-green-500"}`, "class")}></span> </div> </div> ${error ? renderTemplate`<div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center"> <div class="text-4xl mb-3">😕</div> <h2 class="text-xl font-semibold text-red-700 mb-2">${error}</h2> <p class="text-red-600 text-sm">The post you're looking for doesn't exist or has been removed.</p> <a href="/admin/dashboard" class="inline-block mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Back to Dashboard</a> </div>` : post ? renderTemplate`<form id="editForm" class="space-y-6"> <!-- Title & Slug --> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-gray-700 mb-1.5">Title *</label> <input type="text" id="title" name="title"${addAttribute(post.title || "", "value")} required placeholder="Enter post title..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" oninput="autoGenerateSlug()"> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label> <div class="relative"> <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/post/</span> <input type="text" id="slug" name="slug"${addAttribute(post.slug || "", "value")} required placeholder="my-awesome-post" class="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> </div> </div> </div> <!-- Cover Image --> <div> <label class="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label> <div class="flex gap-3"> <input type="url" id="cover_image" name="cover_image"${addAttribute(post.cover_image || "", "value")} placeholder="Upload an image or paste URL..." class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" oninput="updateCoverPreview()"> <button type="button" id="uploadBtn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
📤 Upload
</button> </div> <p class="mt-1 text-xs text-gray-400">Upload to blog-assets (JPEG, PNG, WebP, GIF, SVG) • Max 5MB</p> <!-- Cover Image Preview --> <div id="coverPreview"${addAttribute(`mt-3 ${post.cover_image ? "" : "hidden"}`, "class")}> <div class="relative inline-block"> <img id="coverPreviewImg"${addAttribute(post.cover_image || "", "src")} alt="Cover preview" class="max-h-48 rounded-lg border border-gray-200 object-cover"> <button type="button" id="removeCoverBtn" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex items-center justify-center shadow-md">
✕
</button> </div> </div> </div> <!-- HTML Editor with Media Library Button --> <div> <div class="flex items-center justify-between mb-1.5"> <label class="block text-sm font-medium text-gray-700">HTML Content *</label> <button type="button" id="mediaLibraryBtn" class="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1.5">
🖼️ Insert from Media Library
</button> </div> <textarea id="content" name="content" rows="16" required placeholder="<h1>Your heading</h1><p>Your content...</p>" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none" oninput="updatePreview()">${post.content || ""}</textarea> <div class="mt-2 text-right text-xs text-gray-400"> <span id="charCount">${post.content?.length || 0}</span> characters
</div> </div> <!-- Preview --> <div> <div class="flex items-center justify-between mb-1.5"> <label class="block text-sm font-medium text-gray-700">Live Preview</label> <button type="button" id="togglePreview" class="text-xs text-blue-600 hover:text-blue-800">
Hide Preview
</button> </div> <div id="preview" class="w-full min-h-[200px] overflow-y-auto px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"></div> </div> <!-- Category & Tags --> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label> <select id="category" name="category" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> <option value="">Select a category</option> <option value="Food & Dining"${addAttribute(post.category === "Food & Dining", "selected")}>Food & Dining</option> <option value="Entertainment"${addAttribute(post.category === "Entertainment", "selected")}>Entertainment</option> <option value="Shopping"${addAttribute(post.category === "Shopping", "selected")}>Shopping</option> <option value="Lifestyle"${addAttribute(post.category === "Lifestyle", "selected")}>Lifestyle</option> <option value="Technology"${addAttribute(post.category === "Technology", "selected")}>Technology</option> <option value="Travel"${addAttribute(post.category === "Travel", "selected")}>Travel</option> <option value="Health & Wellness"${addAttribute(post.category === "Health & Wellness", "selected")}>Health & Wellness</option> <option value="Real Estate"${addAttribute(post.category === "Real Estate", "selected")}>Real Estate</option> <option value="Finance"${addAttribute(post.category === "Finance", "selected")}>Finance</option> <option value="Fashion"${addAttribute(post.category === "Fashion", "selected")}>Fashion</option> </select> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-1.5">Tags</label> <input type="text" id="tags" name="tags"${addAttribute(post.tags || "", "value")} placeholder="la, lifestyle, tips" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"> </div> </div> <!-- Publish Options --> <div class="flex flex-wrap items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200"> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" id="is_draft" name="is_draft" value="1"${addAttribute(post.is_draft === 1, "checked")} class="w-4 h-4 rounded border-gray-300 text-blue-600"> <span class="text-sm font-medium text-gray-700">Save as draft</span> </label> <label class="flex items-center gap-2 cursor-pointer"> <input type="checkbox" id="is_published" name="is_published" value="1"${addAttribute(post.is_published === 1, "checked")} class="w-4 h-4 rounded border-gray-300 text-blue-600"> <span class="text-sm font-medium text-gray-700">Publish immediately</span> </label> <div class="flex-1"></div> <div class="flex gap-3"> <a href="/admin/dashboard" class="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-100">Cancel</a> <button type="submit" id="submitBtn" class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25">
Update Post
</button> </div> </div> <!-- Status Message --> <div id="statusMessage" class="hidden p-4 rounded-xl"></div> </form>` : null} </div> ` })} <!-- ============================================
JAVASCRIPT - Auto Slug + Preview + R2 Upload + Media Library + Submit
============================================ --> ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/edit/[id].astro?astro&type=script&index=0&lang.ts")} `;
}, "P:/Projects/trendlin/src/pages/admin/edit/[id].astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/edit/[id].astro";
const $$url = "/admin/edit/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
