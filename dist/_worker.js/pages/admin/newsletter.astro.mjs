globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { a as createComponent, g as renderComponent, e as renderScript, f as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_DJuXqbzQ.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_Cu1IFVzQ.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Newsletter | Admin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-header"> <h1>📧 Newsletter Management</h1> <p>Manage subscribers, create campaigns, and track performance</p> </div>  <div class="stats-grid" id="newsletter-stats"> <div class="stat-card"> <div class="stat-label">Total Subscribers</div> <div class="stat-value" id="total-subscribers">—</div> </div> <div class="stat-card stat-active"> <div class="stat-label">Active</div> <div class="stat-value" id="active-subscribers">—</div> </div> <div class="stat-card stat-pending"> <div class="stat-label">Pending</div> <div class="stat-value" id="pending-subscribers">—</div> </div> <div class="stat-card stat-unsubscribed"> <div class="stat-label">Unsubscribed</div> <div class="stat-value" id="unsubscribed-subscribers">—</div> </div> </div>  <div class="campaign-stats"> <div class="campaign-stat-card"> <div class="campaign-stat-icon">📨</div> <div> <div class="campaign-stat-label">Total Campaigns</div> <div class="campaign-stat-value" id="total-campaigns">—</div> </div> </div> <div class="campaign-stat-card"> <div class="campaign-stat-icon">📊</div> <div> <div class="campaign-stat-label">Open Rate</div> <div class="campaign-stat-value" id="open-rate">—</div> </div> </div> <div class="campaign-stat-card"> <div class="campaign-stat-icon">👆</div> <div> <div class="campaign-stat-label">Click Rate</div> <div class="campaign-stat-value" id="click-rate">—</div> </div> </div> </div>  <div class="card create-campaign-card"> <h2 class="card-header">Create New Campaign</h2> <form id="create-campaign-form" class="campaign-form"> <div class="form-group"> <label for="campaign-subject">Subject</label> <input type="text" id="campaign-subject" placeholder="Enter email subject" required> </div> <div class="form-group"> <label for="campaign-content">Content (HTML)</label> <textarea id="campaign-content" rows="8" placeholder="Write your email content in HTML..." required></textarea> </div> <div class="form-row"> <div class="form-group"> <label for="campaign-category">Category</label> <select id="campaign-category"> <option value="general">All Subscribers</option> <option value="technology">💻 Technology</option> <option value="health-wellness">🧘 Health & Wellness</option> <option value="shopping">🛍️ Shopping</option> <option value="food-dining">🍽️ Food & Dining</option> <option value="entertainment">🎬 Entertainment</option> <option value="lifestyle">🌟 Lifestyle</option> <option value="real-estate">🏠 Real Estate</option> <option value="finance">💰 Finance</option> </select> </div> <div class="form-group"> <label for="campaign-schedule">Schedule (optional)</label> <input type="datetime-local" id="campaign-schedule"> </div> </div> <div class="form-actions"> <button type="submit" class="btn btn-primary">Save Draft</button> <button type="button" id="schedule-btn" class="btn btn-secondary">Schedule</button> <button type="button" id="send-now-btn" class="btn btn-success">Send Now</button> </div> <div id="campaign-message" class="form-message hidden"></div> </form> </div>  <div class="card"> <h2 class="card-header">Recent Campaigns</h2> <div id="campaign-list"> <p class="text-muted">Loading campaigns...</p> </div> </div> ` })}  ${renderScript($$result, "P:/Projects/trendlin/src/pages/admin/newsletter/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "P:/Projects/trendlin/src/pages/admin/newsletter/index.astro", void 0);

const $$file = "P:/Projects/trendlin/src/pages/admin/newsletter/index.astro";
const $$url = "/admin/newsletter";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
