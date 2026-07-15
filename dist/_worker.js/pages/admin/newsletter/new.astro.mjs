globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                       */
import { a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_Cu1IFVzQ.mjs';
/* empty css                                     */
export { renderers } from '../../../renderers.mjs';

const $$New = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "New Campaign", "data-astro-cid-ytwpffl3": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="campaign-editor" data-astro-cid-ytwpffl3> <h1 data-astro-cid-ytwpffl3>Create New Campaign</h1> <form id="campaign-form" data-astro-cid-ytwpffl3> <div class="form-group" data-astro-cid-ytwpffl3> <label for="subject" data-astro-cid-ytwpffl3>Subject Line</label> <input type="text" id="subject" required placeholder="Your newsletter subject" data-astro-cid-ytwpffl3> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="preview" data-astro-cid-ytwpffl3>Preview Text</label> <input type="text" id="preview" placeholder="Preview text for email clients" data-astro-cid-ytwpffl3> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="list" data-astro-cid-ytwpffl3>Audience</label> <select id="list" data-astro-cid-ytwpffl3> <option value="" data-astro-cid-ytwpffl3>All Subscribers</option> <option value="1" data-astro-cid-ytwpffl3>Technology</option> <option value="2" data-astro-cid-ytwpffl3>Finance</option> <option value="3" data-astro-cid-ytwpffl3>Health</option> </select> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="content" data-astro-cid-ytwpffl3>Content</label> <textarea id="content" rows="10" placeholder="Write your newsletter content here..." data-astro-cid-ytwpffl3></textarea> </div> <div class="form-group" data-astro-cid-ytwpffl3> <label for="schedule" data-astro-cid-ytwpffl3>Schedule</label> <input type="datetime-local" id="schedule" data-astro-cid-ytwpffl3> </div> <div class="actions" data-astro-cid-ytwpffl3> <button type="button" id="save-draft" class="btn-secondary" data-astro-cid-ytwpffl3>Save Draft</button> <button type="button" id="schedule-btn" class="btn-primary" data-astro-cid-ytwpffl3>Schedule</button> <button type="button" id="send-now" class="btn-success" data-astro-cid-ytwpffl3>Send Now</button> </div> </form> <div id="message" class="message" data-astro-cid-ytwpffl3></div> </div> ` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/newsletter/new.astro?astro&type=script&index=0&lang.ts")}`;
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
