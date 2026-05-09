// hooks/useBookmarks.js - COMPLETE WITH SIDEBAR STATE
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBookmarks(userId) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!userId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformed = (data || []).map(item => ({
        id: item.id,
        title: item.post_title,
        excerpt: item.post_excerpt,
        slug: item.post_slug,
        savedDate: item.created_at,
        isFavorite: item.is_favorite || false,
        readLater: item.read_later || false,
        archived: item.archived || false,
        isRead: item.is_read || false,
        tags: item.custom_tags || []
      }));

      setBookmarks(transformed);
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // TOGGLE FAVORITE
  const toggleFavorite = useCallback(async (bookmarkId, currentValue) => {
    const newValue = !currentValue;
    
    // Update local state immediately
    setBookmarks(prev => prev.map(b => 
      b.id === bookmarkId ? { ...b, isFavorite: newValue } : b
    ));
    
    // Update database
    const { error } = await supabase
      .from('bookmarks')
      .update({ is_favorite: newValue })
      .eq('id', bookmarkId);
    
    if (error) {
      // Rollback on error
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, isFavorite: currentValue } : b
      ));
      console.error('Error toggling favorite:', error);
    }
  }, []);

  // TOGGLE READ LATER
  const toggleReadLater = useCallback(async (bookmarkId, currentValue) => {
    const newValue = !currentValue;
    
    setBookmarks(prev => prev.map(b => 
      b.id === bookmarkId ? { ...b, readLater: newValue } : b
    ));
    
    const { error } = await supabase
      .from('bookmarks')
      .update({ read_later: newValue })
      .eq('id', bookmarkId);
    
    if (error) {
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, readLater: currentValue } : b
      ));
      console.error('Error toggling read later:', error);
    }
  }, []);

  // TOGGLE ARCHIVE
  const toggleArchive = useCallback(async (bookmarkId, currentValue) => {
    const newValue = !currentValue;
    
    setBookmarks(prev => prev.map(b => 
      b.id === bookmarkId ? { ...b, archived: newValue } : b
    ));
    
    const { error } = await supabase
      .from('bookmarks')
      .update({ archived: newValue })
      .eq('id', bookmarkId);
    
    if (error) {
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, archived: currentValue } : b
      ));
      console.error('Error toggling archive:', error);
    }
  }, []);

  // DELETE BOOKMARK
  const deleteBookmark = useCallback(async (bookmarkId) => {
    const deletedBookmark = bookmarks.find(b => b.id === bookmarkId);
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);
    
    if (error && deletedBookmark) {
      setBookmarks(prev => [deletedBookmark, ...prev]);
      console.error('Error deleting bookmark:', error);
    }
  }, [bookmarks]);

  // Listen for bookmark changes from button
  useEffect(() => {
    const handleBookmarkChange = () => {
      loadBookmarks();
    };
    
    window.addEventListener('bookmarkChanged', handleBookmarkChange);
    return () => window.removeEventListener('bookmarkChanged', handleBookmarkChange);
  }, [loadBookmarks]);

  // Initial load
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    toggleFavorite,
    toggleReadLater,
    toggleArchive,
    deleteBookmark,
    refresh: loadBookmarks
  };
}