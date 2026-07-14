// src/lib/newsletter.ts

import type { Subscriber, UnsubscribeRequest } from '@/types/newsletter';

declare global {
  var DB: D1Database;
}

/**
 * Get subscriber by email and verification token
 */
export async function getSubscriberByEmailAndToken(email: string, token: string): Promise<Subscriber | null> {
  const result = await global.DB.prepare(
    `SELECT * FROM subscribers WHERE email = ? AND verification_token = ?`
  ).bind(email, token).first();
  
  return result as Subscriber | null;
}

/**
 * Unsubscribe subscriber with reason and feedback
 */
export async function unsubscribeSubscriber(data: UnsubscribeRequest) {
  const { email, token, reason, feedback } = data;

  // First verify the subscriber exists
  const subscriber = await getSubscriberByEmailAndToken(email, token);
  
  if (!subscriber) {
    throw new Error('Invalid unsubscribe link');
  }

  if (subscriber.subscribed === 0) {
    throw new Error('You are already unsubscribed');
  }

  // Update subscriber
  const result = await global.DB.prepare(`
    UPDATE subscribers 
    SET 
      subscribed = 0, 
      unsubscribed_at = CURRENT_TIMESTAMP,
      verification_token = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE email = ? AND verification_token = ?
    RETURNING id, email, first_name, unsubscribed_at
  `).bind(email, token).first();

  // Store unsubscribe feedback
  if (reason || feedback) {
    await global.DB.prepare(`
      INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(subscriber.id, reason || null, feedback || null).run();
  }

  return result;
}

/**
 * Get subscriber by email only
 */
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  const result = await global.DB.prepare(
    `SELECT * FROM subscribers WHERE email = ?`
  ).bind(email).first();
  
  return result as Subscriber | null;
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscriber(email: string) {
  const result = await global.DB.prepare(`
    UPDATE subscribers 
    SET 
      subscribed = 1, 
      unsubscribed_at = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
    RETURNING id, email, first_name
  `).bind(email).first();
  
  return result;
}