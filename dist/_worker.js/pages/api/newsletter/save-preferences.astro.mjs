globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as getSubscriberByUnsubscribeToken, h as getSubscriberByEmail, u as updateSubscriberPreferences } from '../../../chunks/newsletter_igr2G-4O.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const { email, token, categories, frequency } = await request.json();
    const env = locals.env;
    let subscriber;
    if (token) {
      subscriber = await getSubscriberByUnsubscribeToken(env, token);
    } else if (email) {
      subscriber = await getSubscriberByEmail(env, email);
    }
    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: "Subscriber not found" }),
        { status: 404 }
      );
    }
    const preferences = {
      categories: categories || [],
      frequency: frequency || "weekly"
    };
    const result = await updateSubscriberPreferences(
      env,
      subscriber.unsubscribe_token || "",
      preferences
    );
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 400 }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Preferences saved successfully"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving preferences:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save preferences" }),
      { status: 500 }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
