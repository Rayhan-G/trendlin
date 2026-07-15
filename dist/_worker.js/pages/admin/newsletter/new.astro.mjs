globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                       */
import { c as createAstro, a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_Cu1IFVzQ.mjs';
import { b as getLists } from '../../../chunks/newsletter_DvXc4akD.mjs';
/* empty css                                     */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://trendlin.com");
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$New;
  const env = Astro2.locals.env;
  const lists = await getLists(env, true);
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "New Campaign", "data-astro-cid-ytwpffl3": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="campaign-editor" data-astro-cid-ytwpffl3> <div class="page-header" data-astro-cid-ytwpffl3> <h1 data-astro-cid-ytwpffl3>📧 Create New Campaign</h1> <p data-astro-cid-ytwpffl3>Create and send a newsletter campaign to your subscribers.</p> </div> <div class="card" data-astro-cid-ytwpffl3> <form id="campaign-form" data-astro-cid-ytwpffl3> <div class="form-group" data-astro-cid-ytwpffl3> <label for="subject" data-astro-cid-ytwpffl3>Subject Line</label> <input type="text" id="subject" required placeholder="Your newsletter subject" class="form-input" data-astro-cid-ytwpffl3> <p class="form-hint" data-astro-cid-ytwpffl3>Keep it short and engaging. Emojis work great!</p> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="preview" data-astro-cid-ytwpffl3>Preview Text</label> <input type="text" id="preview" placeholder="Preview text for email clients" class="form-input" data-astro-cid-ytwpffl3> <p class="form-hint" data-astro-cid-ytwpffl3>Appears next to the subject line in inboxes.</p> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="list" data-astro-cid-ytwpffl3>Audience</label> <select id="list" class="form-select" data-astro-cid-ytwpffl3> <option value="" data-astro-cid-ytwpffl3>All Subscribers</option> ${lists.map((list) => renderTemplate`<option${addAttribute(list.id, "value")} data-astro-cid-ytwpffl3>${list.name}</option>`)} </select> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="content" data-astro-cid-ytwpffl3>Email Content</label> <textarea id="content" rows="12" placeholder="Write your newsletter content here... Use HTML for formatting." class="form-textarea" data-astro-cid-ytwpffl3></textarea> <p class="form-hint" data-astro-cid-ytwpffl3>You can use HTML tags for formatting: &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.</p> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="schedule" data-astro-cid-ytwpffl3>Schedule</label> <input type="datetime-local" id="schedule" class="form-input" data-astro-cid-ytwpffl3> <p class="form-hint" data-astro-cid-ytwpffl3>Leave blank to send immediately.</p> </div> <div class="form-actions" data-astro-cid-ytwpffl3> <button type="button" id="save-draft" class="btn-secondary" data-astro-cid-ytwpffl3>
💾 Save Draft
</button> <button type="button" id="schedule-btn" class="btn-primary" data-astro-cid-ytwpffl3>
📅 Schedule
</button> <button type="button" id="send-now" class="btn-success" data-astro-cid-ytwpffl3>
🚀 Send Now
</button> </div> </form> <div id="message" class="message hidden" data-astro-cid-ytwpffl3></div> </div> </div> ` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/newsletter/new.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/newsletter/new.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/newsletter/new.astro";
const $$url = "/admin/newsletter/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
