globalThis.process ??= {}; globalThis.process.env ??= {};
import { h as getSubscriberByEmail, u as updateSubscriberPreferences, l as createSubscriber } from '../../../chunks/newsletter_igr2G-4O.mjs';
import { E as EmailService } from '../../../chunks/email-service_BZMp7oTW.mjs';
import { g as getDB } from '../../../chunks/db_Ck9stjmw.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  try {
    const { email, firstName, categories, token } = await request.json();
    const env = locals.env;
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400 }
      );
    }
    const apiKey = process.env.RESEND_API_KEY || locals.env?.RESEND_API_KEY;
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY not set in environment variables");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500 }
      );
    }
    const emailService = new EmailService(apiKey);
    const existing = await getSubscriberByEmail(env, email);
    if (existing && token) {
      const preferences = {
        categories: categories || [],
        frequency: "weekly"
      };
      const result2 = await updateSubscriberPreferences(env, token, preferences);
      if (result2.success) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Preferences updated successfully!"
          }),
          { status: 200 }
        );
      }
    }
    if (existing) {
      if (existing.status === "active") {
        if (categories && categories.length > 0) {
          const preferences = {
            categories: categories || [],
            frequency: "weekly"
          };
          if (existing.unsubscribe_token) {
            await updateSubscriberPreferences(env, existing.unsubscribe_token, preferences);
          }
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: "You are already subscribed! Preferences updated.",
            alreadySubscribed: true
          }),
          { status: 200 }
        );
      }
      if (existing.status === "pending") {
        if (existing.verification_token) {
          await emailService.sendNewsletterVerification(
            email,
            existing.verification_token,
            firstName
          );
        }
        return new Response(
          JSON.stringify({
            success: true,
            message: "Verification email resent! Please check your inbox.",
            status: "pending"
          }),
          { status: 200 }
        );
      }
      if (existing.status === "unsubscribed") {
        const db = getDB(env);
        const newToken = generateToken();
        await db.prepare(`
            UPDATE newsletter_subscribers 
            SET status = 'pending',
                verification_token = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(newToken, existing.id).run();
        await emailService.sendNewsletterVerification(email, newToken, firstName);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Please check your email to verify your subscription!"
          }),
          { status: 200 }
        );
      }
    }
    const result = await createSubscriber(env, {
      email,
      first_name: firstName || "",
      source: "website",
      ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for"),
      user_agent: request.headers.get("user-agent")
    });
    if (categories && categories.length > 0 && result.id) {
      const preferences = {
        categories,
        frequency: "weekly"
      };
      const subscriber = await getSubscriberByEmail(env, email);
      if (subscriber && subscriber.unsubscribe_token) {
        await updateSubscriberPreferences(env, subscriber.unsubscribe_token, preferences);
      }
    }
    await emailService.sendNewsletterVerification(
      email,
      result.verificationToken,
      firstName
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "Please check your email to verify your subscription!"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Subscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe" }),
      { status: 500 }
    );
  }
};
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
