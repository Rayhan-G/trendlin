// hooks/useOptimisticBookmark.js
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useOptimisticBookmark(userId) {
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  const updateBookmark = useCallback(async (bookmarkId, updates, rollbackData) => {
    // 1. Apply optimistic update IMMEDIATELY
    setOptimisticUpdates(prev => ({
      ...prev,
      [bookmarkId]: { ...prev[bookmarkId], ...updates }
    }));
    
    try {
      // 2. Sync with backend
      const { error } = await supabase
        .from('bookmarks')
        .update(updates)
        .eq('id', bookmarkId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // 3. Commit - keep the optimistic update
      return { success: true };
      
    } catch (error) {
      // 4. Rollback on failure
      setOptimisticUpdates(prev => ({
        ...prev,
        [bookmarkId]: rollbackData
      }));
      
      // 5. Clear after 3 seconds
      setTimeout(() => {
        setOptimisticUpdates(prev => {
          const newState = { ...prev };
          delete newState[bookmarkId];
          return newState;
        });
      }, 3000);
      
      return { success: false, error };
    }
  }, [userId]);

  const getOptimisticValue = useCallback((bookmarkId, field, actualValue) => {
    return optimisticUpdates[bookmarkId]?.[field] ?? actualValue;
  }, [optimisticUpdates]);

  return { updateBookmark, getOptimisticValue };
}