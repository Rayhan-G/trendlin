globalThis.process ??= {}; globalThis.process.env ??= {};
import { R as Resend } from '../../chunks/index_CQDMUPqB.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ locals }) => {
  try {
    const apiKey = locals?.runtime?.env?.RESEND_API_KEY || "re_Kfpjk4uw_7ZACMZFkoSWKJHoTh7cosEf9";
    if (!apiKey) ;
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "Trendlin <contact@trendlin.com>",
      to: "your-email@example.com",
      // ⚠️ CHANGE THIS TO YOUR EMAIL
      subject: "Test Email from Trendlin",
      html: "<h1>✅ Test Successful!</h1><p>Your Resend API is working.</p>"
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test email sent! Check your inbox.",
        result
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Test email error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
