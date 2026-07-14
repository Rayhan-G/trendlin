// src/lib/newsletter.ts

import type { Subscriber, UnsubscribeRequest } from '@/types/newsletter';

declare global {
  var DB: D1Database;
}

// ============================================
// SUBSCRIBER FUNCTIONS
// ============================================

export async function getSubscriberByEmailAndToken(email: string, token: string): Promise<Subscriber | null> {
  const result = await global.DB.prepare(
    `SELECT * FROM subscribers WHERE email = ? AND verification_token = ?`
  ).bind(email, token).first();
  return result as Subscriber | null;
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  const result = await global.DB.prepare(
    `SELECT * FROM subscribers WHERE email = ?`
  ).bind(email).first();
  return result as Subscriber | null;
}

export async function getSubscriberById(id: number): Promise<Subscriber | null> {
  const result = await global.DB.prepare(
    `SELECT * FROM subscribers WHERE id = ?`
  ).bind(id).first();
  return result as Subscriber | null;
}

// ============================================
// PREFERENCES FUNCTIONS
// ============================================

export async function getSubscriberPreferences(subscriberId: number) {
  const results = await global.DB.prepare(`
    SELECT category, subscribed 
    FROM newsletter_preferences 
    WHERE subscriber_id = ?
  `).bind(subscriberId).all();
  return results.results;
}

export async function getSubscribedCategories(subscriberId: number): Promise<string[]> {
  const results = await global.DB.prepare(`
    SELECT category 
    FROM newsletter_preferences 
    WHERE subscriber_id = ? AND subscribed = 1
  `).bind(subscriberId).all();
  return results.results.map(r => r.category);
}

export async function updateSubscriberPreferences(
  subscriberId: number, 
  categories: string[]
) {
  // Delete existing preferences
  await global.DB.prepare(`
    DELETE FROM newsletter_preferences 
    WHERE subscriber_id = ?
  `).bind(subscriberId).run();

  // Insert new preferences
  if (categories.length > 0) {
    const placeholders = categories.map(() => '(?, ?, 1)').join(', ');
    const values = categories.flatMap(cat => [subscriberId, cat]);
    
    await global.DB.prepare(`
      INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
      VALUES ${placeholders}
    `).bind(...values).run();
  }

  // Update subscribers table
  await global.DB.prepare(`
    UPDATE subscribers 
    SET categories = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(categories.join(','), subscriberId).run();

  return { subscriberId, categories };
}

export async function subscriberWantsCategory(subscriberId: number, category: string): Promise<boolean> {
  const result = await global.DB.prepare(`
    SELECT 1 
    FROM newsletter_preferences 
    WHERE subscriber_id = ? AND category = ? AND subscribed = 1
  `).bind(subscriberId, category).first();
  return !!result;
}

// ============================================
// SUBSCRIBE FUNCTIONS
// ============================================

export async function createSubscriberWithPreferences(
  email: string,
  firstName: string,
  selectedCategories: string[],
  verificationToken: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
) {
  // Create subscriber
  const result = await global.DB.prepare(`
    INSERT INTO subscribers (
      email, 
      first_name, 
      categories, 
      verification_token, 
      verified, 
      subscribed,
      ip_address,
      user_agent,
      referrer
    )
    VALUES (?, ?, ?, ?, 0, 1, ?, ?, ?)
    RETURNING id
  `).bind(
    email, 
    firstName || '', 
    selectedCategories.join(','), 
    verificationToken,
    ipAddress || null,
    userAgent || null,
    referrer || null
  ).first();

  // Create preferences
  if (result && selectedCategories.length > 0) {
    const placeholders = selectedCategories.map(() => '(?, ?, 1)').join(', ');
    const values = selectedCategories.flatMap(cat => [result.id, cat]);
    
    await global.DB.prepare(`
      INSERT INTO newsletter_preferences (subscriber_id, category, subscribed)
      VALUES ${placeholders}
    `).bind(...values).run();
  }

  return result;
}

export async function verifyAndUpdatePreferences(
  email: string, 
  token: string, 
  selectedCategories: string[]
) {
  const subscriber = await getSubscriberByEmailAndToken(email, token);
  if (!subscriber) throw new Error('Invalid verification link');

  // Verify subscriber
  await global.DB.prepare(`
    UPDATE subscribers 
    SET verified = 1, 
        verified_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        categories = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ? AND verification_token = ?
  `).bind(selectedCategories.join(','), email, token).run();

  // Update preferences
  await updateSubscriberPreferences(subscriber.id, selectedCategories);

  return subscriber;
}

// ============================================
// UNSUBSCRIBE FUNCTIONS
// ============================================

export async function unsubscribeSubscriber(data: UnsubscribeRequest) {
  const { email, token, reason, feedback } = data;

  const subscriber = await getSubscriberByEmailAndToken(email, token);
  if (!subscriber) throw new Error('Invalid unsubscribe link');
  if (subscriber.subscribed === 0) throw new Error('Already unsubscribed');

  // Update subscriber
  const result = await global.DB.prepare(`
    UPDATE subscribers 
    SET subscribed = 0, 
        unsubscribed_at = CURRENT_TIMESTAMP,
        verification_token = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ? AND verification_token = ?
    RETURNING id, email, first_name, unsubscribed_at
  `).bind(email, token).first();

  // Update preferences - set all to unsubscribed
  await global.DB.prepare(`
    UPDATE newsletter_preferences 
    SET subscribed = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE subscriber_id = ?
  `).bind(subscriber.id).run();

  // Store feedback
  if (reason || feedback) {
    await global.DB.prepare(`
      INSERT INTO unsubscribe_feedback (subscriber_id, reason, feedback, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(subscriber.id, reason || null, feedback || null).run();
  }

  return result;
}

// ============================================
// SENDING FUNCTIONS
// ============================================

export async function getSubscribersForCategory(category: string) {
  const results = await global.DB.prepare(`
    SELECT s.* 
    FROM subscribers s
    INNER JOIN newsletter_preferences p ON p.subscriber_id = s.id
    WHERE s.verified = 1 
      AND s.subscribed = 1
      AND p.category = ?
      AND p.subscribed = 1
  `).bind(category).all();
  return results.results;
}

export async function getSubscribersForCategories(categories: string[]) {
  if (categories.length === 0) return [];
  
  const placeholders = categories.map(() => '?').join(',');
  const results = await global.DB.prepare(`
    SELECT DISTINCT s.* 
    FROM subscribers s
    INNER JOIN newsletter_preferences p ON p.subscriber_id = s.id
    WHERE s.verified = 1 
      AND s.subscribed = 1
      AND p.category IN (${placeholders})
      AND p.subscribed = 1
  `).bind(...categories).all();
  
  return results.results;
}

export async function getAllActiveSubscribers() {
  const results = await global.DB.prepare(`
    SELECT s.* 
    FROM subscribers s
    WHERE s.verified = 1 
      AND s.subscribed = 1
  `).all();
  return results.results;
}

// ============================================
// REACTIVATE FUNCTIONS
// ============================================

export async function reactivateSubscriber(email: string, categories: string[]) {
  const subscriber = await getSubscriberByEmail(email);
  if (!subscriber) throw new Error('Subscriber not found');

  // Reactivate subscriber
  await global.DB.prepare(`
    UPDATE subscribers 
    SET subscribed = 1, 
        unsubscribed_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = ?
  `).bind(email).run();

  // Update preferences
  await updateSubscriberPreferences(subscriber.id, categories);

  return subscriber;
}