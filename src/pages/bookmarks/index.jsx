// src/pages/bookmarks/index.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function BookmarksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndBookmarks = async () => {
      try {
        // Check auth
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.authenticated) {
          router.push('/');
          return;
        }
        
        setUser(data.user);
        
        // Fetch bookmarks
        const { data: bookmarksData, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setBookmarks(bookmarksData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndBookmarks();
  }, [router]);

  const handleRemoveBookmark = async (bookmarkId, postId) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);
    
    if (!error) {
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      // Dispatch event to update bookmark buttons on other pages
      window.dispatchEvent(new CustomEvent('bookmarkUpdated', { detail: { postId, isBookmarked: false } }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #2196f3;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <Link href="/" className="back-button">
              ← Back to Home
            </Link>
          </div>
          <div className="header-center">
            <h1>My Bookmarked Posts</h1>
            <p className="bookmark-count">{bookmarks.length} saved posts</p>
          </div>
          <div className="header-right"></div>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h2>No bookmarks yet</h2>
            <p>Save your favorite posts by clicking the bookmark button on any article.</p>
            <Link href="/" className="browse-button">
              Browse Posts →
            </Link>
          </div>
        ) : (
          <div className="bookmarks-grid">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-card">
                <Link href={`/post/${bookmark.post_slug}`} className="card-link">
                  {bookmark.featured_image_url && (
                    <div className="card-image">
                      <img src={bookmark.featured_image_url} alt={bookmark.post_title} />
                    </div>
                  )}
                  <div className="card-content">
                    <h3>{bookmark.post_title}</h3>
                    <p>{bookmark.post_excerpt?.substring(0, 120)}...</p>
                    <div className="card-meta">
                      <span className="date">
                        Saved {new Date(bookmark.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
                <button 
                  onClick={() => handleRemoveBookmark(bookmark.id, bookmark.post_id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .bookmarks-page {
          min-height: 100vh;
          background: #f5f5f5;
          padding: 20px;
        }
        .bookmarks-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .back-button {
          text-decoration: none;
          color: #666;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 8px;
          background: #f5f5f5;
          transition: all 0.2s;
        }
        .back-button:hover {
          background: #e0e0e0;
          color: #333;
        }
        .header-center {
          text-align: center;
        }
        .header-center h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        .bookmark-count {
          margin: 8px 0 0;
          font-size: 14px;
          color: #666;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .empty-state h2 {
          margin: 0 0 10px;
          color: #333;
        }
        .empty-state p {
          color: #666;
          margin-bottom: 24px;
        }
        .browse-button {
          display: inline-block;
          padding: 12px 24px;
          background: #2196f3;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .browse-button:hover {
          background: #1976d2;
        }
        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .bookmark-card {
          position: relative;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .bookmark-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .card-image {
          height: 180px;
          overflow: hidden;
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .bookmark-card:hover .card-image img {
          transform: scale(1.05);
        }
        .card-content {
          padding: 16px;
        }
        .card-content h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #333;
          line-height: 1.4;
        }
        .card-content p {
          margin: 0 0 12px;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .date {
          font-size: 12px;
          color: #999;
        }
        .remove-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .bookmark-card:hover .remove-btn {
          opacity: 1;
        }
        .remove-btn:hover {
          background: #f44336;
        }
        @media (max-width: 768px) {
          .bookmarks-grid {
            grid-template-columns: 1fr;
          }
          .page-header {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}