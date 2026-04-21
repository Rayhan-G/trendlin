// src/services/analyticsService.js
import { supabase } from '@/lib/supabase'

export const analyticsService = {
  // Track page view
  async trackPageView(page, title, referrer = null) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('page_views')
        .insert([{
          page,
          title,
          referrer,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          viewed_at: new Date().toISOString()
        }])
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Track page view error:', error)
      return { success: false }
    }
  },

  // Track post view
  async trackPostView(postId, postTitle, category) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('post_views')
        .insert([{
          post_id: postId,
          post_title: postTitle,
          category,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          viewed_at: new Date().toISOString()
        }])
      
      if (error) throw error
      
      // Also increment the post's view count
      await this.incrementPostViews(postId)
      
      return { success: true }
    } catch (error) {
      console.error('Track post view error:', error)
      return { success: false }
    }
  },

  // Increment post views counter
  async incrementPostViews(postId) {
    try {
      const { error } = await supabase.rpc('increment_post_views', {
        post_id: postId
      })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Increment post views error:', error)
      return { success: false }
    }
  },

  // Track affiliate click
  async trackAffiliateClick(linkId, linkUrl, postId = null) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .insert([{
          link_id: linkId,
          link_url: linkUrl,
          post_id: postId,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          clicked_at: new Date().toISOString()
        }])
      
      if (error) throw error
      
      // Increment link click count
      await this.incrementAffiliateClicks(linkId)
      
      return { success: true }
    } catch (error) {
      console.error('Track affiliate click error:', error)
      return { success: false }
    }
  },

  // Increment affiliate link clicks
  async incrementAffiliateClicks(linkId) {
    try {
      const { error } = await supabase.rpc('increment_affiliate_clicks', {
        link_id: linkId
      })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Increment affiliate clicks error:', error)
      return { success: false }
    }
  },

  // Track ad impression
  async trackAdImpression(slotId, codeId, postId = null) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('ad_impressions')
        .insert([{
          slot_id: slotId,
          code_id: codeId,
          post_id: postId,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          impressed_at: new Date().toISOString()
        }])
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Track ad impression error:', error)
      return { success: false }
    }
  },

  // Track ad click
  async trackAdClick(slotId, codeId, postId = null) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('ad_clicks')
        .insert([{
          slot_id: slotId,
          code_id: codeId,
          post_id: postId,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          clicked_at: new Date().toISOString()
        }])
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Track ad click error:', error)
      return { success: false }
    }
  },

  // Track scroll depth
  async trackScrollDepth(postId, depth) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('scroll_depth')
        .upsert([{
          post_id: postId,
          session_id: sessionId,
          depth_percentage: depth,
          tracked_at: new Date().toISOString()
        }], {
          onConflict: 'post_id,session_id'
        })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Track scroll depth error:', error)
      return { success: false }
    }
  },

  // Track time on page
  async trackTimeOnPage(postId, secondsSpent) {
    try {
      const sessionId = this.getSessionId()
      const { data, error } = await supabase
        .from('time_on_page')
        .insert([{
          post_id: postId,
          session_id: sessionId,
          seconds_spent: secondsSpent,
          tracked_at: new Date().toISOString()
        }])
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Track time on page error:', error)
      return { success: false }
    }
  },

  // Get unique session ID
  getSessionId() {
    let sessionId = localStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  },

  // Get popular posts
  async getPopularPosts(limit = 10, days = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const { data, error } = await supabase
        .from('post_views')
        .select('post_id, post_title, count')
        .gte('viewed_at', startDate.toISOString())
        .group('post_id, post_title')
        .order('count', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Get popular posts error:', error)
      return { success: false, error: error.message }
    }
  },

  // Get analytics summary
  async getAnalyticsSummary(startDate, endDate) {
    try {
      // Get total page views
      const { data: pageViews, error: pageError } = await supabase
        .from('page_views')
        .select('id', { count: 'exact' })
        .gte('viewed_at', startDate)
        .lte('viewed_at', endDate)
      
      // Get total post views
      const { data: postViews, error: postError } = await supabase
        .from('post_views')
        .select('id', { count: 'exact' })
        .gte('viewed_at', startDate)
        .lte('viewed_at', endDate)
      
      // Get affiliate clicks
      const { data: affiliateClicks, error: affiliateError } = await supabase
        .from('affiliate_clicks')
        .select('id', { count: 'exact' })
        .gte('clicked_at', startDate)
        .lte('clicked_at', endDate)
      
      // Get ad impressions
      const { data: adImpressions, error: adError } = await supabase
        .from('ad_impressions')
        .select('id', { count: 'exact' })
        .gte('impressed_at', startDate)
        .lte('impressed_at', endDate)
      
      return {
        success: true,
        data: {
          totalPageViews: pageViews?.length || 0,
          totalPostViews: postViews?.length || 0,
          totalAffiliateClicks: affiliateClicks?.length || 0,
          totalAdImpressions: adImpressions?.length || 0
        }
      }
    } catch (error) {
      console.error('Get analytics summary error:', error)
      return { success: false, error: error.message }
    }
  }
}

export default analyticsService