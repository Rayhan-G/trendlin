globalThis.process ??= {}; globalThis.process.env ??= {};
async function getSubscriberByEmailAndToken(email, token) {
  const result = await global.DB.prepare(
    `SELECT * FROM subscribers WHERE email = ? AND verification_token = ?`
  ).bind(email, token).first();
  return result;
}
async function unsubscribeSubscriber(data) {
  const { email, token, reason, feedback } = data;
  const subscriber = await getSubscriberByEmailAndToken(email, token);
  if (!subscriber) throw new Error("Invalid unsubscribe link");
  if (subscriber.subscribed === 0) throw new Error("Already unsubscribed");
  const result = await global.DB.prepare(`
    UPDATE subscribers 
    SET subscribed = 0, 
        unsubscribed_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ? AND verification_token = ?
    RETURNING id, email, first_name, unsubscribed_at
  `).bind(email, token).first();
  await global.DB.prepare(`
    UPDATE newsletter_preferences 
    SET subscribed = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE subscriber_id = ?
  `).bind(subscriber.id).run();
  if (reason || feedback) {
    await global.DB.prepare(`
      INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(subscriber.id, reason || null, feedback || null).run();
  }
  return result;
}

export { getSubscriberByEmailAndToken as g, unsubscribeSubscriber as u };
