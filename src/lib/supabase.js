// src/lib/supabase.js (COMPLETE FIXED FILE)

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration from environment variables
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
  console.warn('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Supabase client instance
 * Returns null if environment variables are missing
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'trendlin-blog',
        },
      },
    })
  : null;

/**
 * Check if Supabase is properly configured
 * @returns {boolean} True if both URL and anon key are set
 */
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

/**
 * Get the Supabase client (throws if not configured)
 * @returns {Object} Supabase client
 * @throws {Error} If Supabase is not configured
 */
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Please check your environment variables.');
  }
  return supabase;
};

/**
 * Check if Supabase client is available
 * @returns {boolean} True if client is available
 */
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

/**
 * Subscribe to real-time changes on the posts table
 * @param {Function} callback - Callback function that receives the payload
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToPosts = (callback) => {
  // ✅ FIXED: Return a proper subscription object even when Supabase is not configured
  if (!supabase) {
    console.warn('Cannot subscribe to posts: Supabase not configured');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('Supabase not configured')
    };
  }
  
  // Validate callback
  if (typeof callback !== 'function') {
    console.error('subscribeToPosts requires a function callback');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('Invalid callback')
    };
  }
  
  try {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        },
        (payload) => {
          // ✅ FIXED: Add error handling inside callback
          try {
            callback(payload);
          } catch (callbackError) {
            console.error('Error in subscription callback:', callbackError);
          }
        }
      )
      .subscribe((status, err) => {
        // ✅ FIXED: Log subscription status changes
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to posts changes');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error:', err);
        }
        if (status === 'TIMED_OUT') {
          console.error('Subscription timed out');
        }
      });
    
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from posts changes');
        supabase.removeChannel(channel);
      },
      isActive: true,
      channel
    };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return {
      unsubscribe: () => {},
      isActive: false,
      error
    };
  }
};

/**
 * Subscribe to real-time changes on a specific post
 * @param {string} postId - ID of the post to watch
 * @param {Function} callback - Callback function that receives the payload
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToPost = (postId, callback) => {
  if (!supabase) {
    console.warn('Cannot subscribe to post: Supabase not configured');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('Supabase not configured')
    };
  }
  
  if (!postId) {
    console.error('subscribeToPost requires a postId');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('postId is required')
    };
  }
  
  if (typeof callback !== 'function') {
    console.error('subscribeToPost requires a function callback');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('Invalid callback')
    };
  }
  
  try {
    const channel = supabase
      .channel(`post-${postId}-changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`
        },
        (payload) => {
          try {
            callback(payload);
          } catch (callbackError) {
            console.error('Error in post subscription callback:', callbackError);
          }
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
      isActive: true,
      channel
    };
  } catch (error) {
    console.error('Failed to create post subscription:', error);
    return {
      unsubscribe: () => {},
      isActive: false,
      error
    };
  }
};

/**
 * Subscribe to real-time changes on a specific user's posts
 * @param {string} userId - ID of the user
 * @param {Function} callback - Callback function that receives the payload
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToUserPosts = (userId, callback) => {
  if (!supabase) {
    console.warn('Cannot subscribe to user posts: Supabase not configured');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('Supabase not configured')
    };
  }
  
  if (!userId) {
    console.error('subscribeToUserPosts requires a userId');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('userId is required')
    };
  }
  
  if (typeof callback !== 'function') {
    console.error('subscribeToUserPosts requires a function callback');
    return { 
      unsubscribe: () => {},
      isActive: false,
      error: new Error('Invalid callback')
    };
  }
  
  try {
    const channel = supabase
      .channel(`user-${userId}-posts-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `author_id=eq.${userId}`
        },
        (payload) => {
          try {
            callback(payload);
          } catch (callbackError) {
            console.error('Error in user posts subscription callback:', callbackError);
          }
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
      isActive: true,
      channel
    };
  } catch (error) {
    console.error('Failed to create user posts subscription:', error);
    return {
      unsubscribe: () => {},
      isActive: false,
      error
    };
  }
};

/**
 * Test the Supabase connection
 * @returns {Promise<Object>} Connection test result
 */
export const testSupabaseConnection = async () => {
  if (!supabase) {
    return { 
      success: false, 
      error: 'Supabase client not configured',
      configured: false
    };
  }
  
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    if (error) {
      return { 
        success: false, 
        error: error.message,
        configured: true
      };
    }
    
    return { 
      success: true, 
      configured: true,
      message: 'Supabase connection successful'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      configured: true
    };
  }
};

/**
 * Get Supabase configuration status
 * @returns {Object} Configuration status
 */
export const getSupabaseStatus = () => {
  return {
    isConfigured: isSupabaseConfigured(),
    isClientAvailable: isSupabaseAvailable(),
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : null
  };
};

export default supabase;