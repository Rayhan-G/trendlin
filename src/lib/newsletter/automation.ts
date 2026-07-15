// /src/lib/newsletter/automation.ts
import { createD1Client } from '../db';

export class AutomationEngine {
  private db: any;

  constructor(env: any) {
    this.db = createD1Client(env.DB);
  }

  async handleArticlePublished(articleId: number) {
    // Get article details
    const article = await this.db.prepare(`
      SELECT * FROM posts WHERE id = ? AND is_published = 1
    `).bind(articleId).first();

    if (!article) return;

    // Find automation rules for article_published trigger
    const automations = await this.db.prepare(`
      SELECT * FROM newsletter_automations 
      WHERE trigger = 'article_published' AND is_active = 1
    `).all();

    for (const automation of automations.results) {
      const actions = JSON.parse(automation.actions);
      
      for (const action of actions) {
        if (action.type === 'send_campaign') {
          await this.createCampaignFromArticle(article, action);
        }
      }
    }
  }

  private async createCampaignFromArticle(article: any, action: any) {
    const campaign = await this.db.prepare(`
      INSERT INTO newsletter_campaigns (
        subject, 
        preview_text, 
        content_html, 
        status,
        metadata
      ) VALUES (?, ?, ?, 'draft', ?)
    `).bind(
      article.title,
      article.excerpt || '',
      `<h1>${article.title}</h1><p>${article.excerpt || ''}</p><a href="/posts/${article.slug}">Read More</a>`,
      JSON.stringify({ article_id: article.id, source: 'automation' })
    ).run();

    // Optionally auto-schedule or send
    return campaign;
  }

  async handleNewSubscriber(subscriberId: number) {
    // Check for welcome automations
    const automations = await this.db.prepare(`
      SELECT * FROM newsletter_automations 
      WHERE trigger = 'subscriber_created' AND is_active = 1
    `).all();

    for (const automation of automations.results) {
      const actions = JSON.parse(automation.actions);
      
      for (const action of actions) {
        if (action.type === 'send_campaign' && action.template === 'welcome') {
          await this.sendWelcomeEmail(subscriberId);
        }
      }
    }
  }

  private async sendWelcomeEmail(subscriberId: number) {
    const subscriber = await this.db.prepare(`
      SELECT * FROM newsletter_subscribers WHERE id = ?
    `).bind(subscriberId).first();

    if (!subscriber) return;

    // Create welcome campaign
    const template = await this.db.prepare(`
      SELECT * FROM newsletter_templates WHERE slug = 'welcome'
    `).first();

    if (!template) return;

    const campaign = await this.db.prepare(`
      INSERT INTO newsletter_campaigns (
        subject,
        content_html,
        status,
        metadata
      ) VALUES (?, ?, 'sending', ?)
    `).bind(
      `Welcome to Trendlin, ${subscriber.first_name || 'Reader'}!`,
      template.content_html,
      JSON.stringify({ welcome: true, subscriber_id: subscriberId })
    ).run();

    // Enqueue for immediate sending
    const campaignId = campaign.meta.last_row_id;
    await this.db.prepare(`
      INSERT INTO newsletter_queue (campaign_id, subscriber_id)
      VALUES (?, ?)
    `).bind(campaignId, subscriberId).run();

    // Add recipient
    await this.db.prepare(`
      INSERT INTO newsletter_campaign_recipients (campaign_id, subscriber_id)
      VALUES (?, ?)
    `).bind(campaignId, subscriberId).run();
  }

  async handleInactiveUsers() {
    // Find subscribers who haven't opened in 30 days
    const inactive = await this.db.prepare(`
      SELECT DISTINCT ns.id
      FROM newsletter_subscribers ns
      WHERE ns.status = 'active'
        AND ns.id NOT IN (
          SELECT subscriber_id 
          FROM newsletter_events 
          WHERE type = 'open' 
            AND created_at >= datetime('now', '-30 days')
        )
        AND ns.created_at <= datetime('now', '-30 days')
    `).all();

    // Send re-engagement campaigns
    const automations = await this.db.prepare(`
      SELECT * FROM newsletter_automations 
      WHERE trigger = 'no_opens_30days' AND is_active = 1
    `).all();

    for (const automation of automations.results) {
      const actions = JSON.parse(automation.actions);
      
      for (const subscriber of inactive.results) {
        for (const action of actions) {
          if (action.type === 'send_campaign') {
            await this.sendReengagementEmail(subscriber.id);
          }
        }
      }
    }
  }

  private async sendReengagementEmail(subscriberId: number) {
    // Similar to welcome email but with re-engagement template
    // Implementation similar to sendWelcomeEmail
  }
}