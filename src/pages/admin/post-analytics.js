// src/pages/admin/post-analytics.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import UnifiedAnalytics from '@/components/admin/UnifiedAnalytics';
import Link from 'next/link';
import { formatNumber } from '@/utils/formatters';

// Date range options
const DATE_RANGES = {
  '7days': 7,
  '30days': 30,
  '90days': 90,
  'all': 'all'
};

// Stat Card Component
const StatCard = ({ label, value, color = 'default' }) => {
  const colors = {
    default: 'bg-gray-50',
    green: 'bg-emerald-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50',
  };
  
  return (
    <div className={`${colors[color]} rounded-xl p-5 border border-gray-100`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export default function PostAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    avgViewsPerPost: 0,
    publishedCount: 0,
    draftCount: 0,
    scheduledCount: 0
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  // Check auth on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem('admin_session_token');
    if (!sessionToken) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, [router]);

  // Fetch stats when date range changes
  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('posts').select('*');
      
      if (dateRange !== 'all') {
        const days = DATE_RANGES[dateRange];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }
      
      const { data: postsList, error: allError } = await query;
      
      if (allError) throw allError;
      
      const posts = postsList || [];
      
      // Calculate stats
      const totalPosts = posts.length;
      const publishedCount = posts.filter(p => p.status === 'published').length;
      const draftCount = posts.filter(p => p.status === 'draft').length;
      const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
      const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
      const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
      
      setStats({
        totalViews,
        totalPosts,
        avgViewsPerPost,
        publishedCount,
        draftCount,
        scheduledCount
      });
      
      // Category stats
      const categoryMap = new Map();
      posts.forEach(post => {
        const cat = post.category || 'Uncategorized';
        if (!categoryMap.has(cat)) categoryMap.set(cat, { views: 0, count: 0 });
        const data = categoryMap.get(cat);
        data.views += post.views || 0;
        data.count++;
      });
      
      const categoryStatsArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name, 
        views: data.views, 
        count: data.count,
        avgPerPost: data.count > 0 ? Math.round(data.views / data.count) : 0
      })).sort((a, b) => b.views - a.views);
      
      setCategoryStats(categoryStatsArray);
      
      // Top posts
      const sortedPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
      setTopPosts(sortedPosts.map((post, i) => ({
        rank: i + 1,
        id: post.id,
        title: post.title || 'Untitled',
        category: post.category || 'Uncategorized',
        views: post.views || 0,
        status: post.status || 'draft',
        slug: post.slug
      })));
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'analytics', label: '📈 Advanced Analytics', icon: '📈' },
    { id: 'top-posts', label: '🏆 Top Posts', icon: '🏆' },
    { id: 'categories', label: '📁 Categories', icon: '📁' },
  ];

  if (loading) {
    return (
      <AdminNavigation>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      </AdminNavigation>
    );
  }

  if (error) {
    return (
      <AdminNavigation>
        <div className="p-4 text-center text-red-500">
          <p>{error}</p>
          <button onClick={fetchStats} className="mt-2 px-4 py-2 bg-black text-white rounded-lg">Retry</button>
        </div>
      </AdminNavigation>
    );
  }

  return (
    <AdminNavigation>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Post Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Track your content performance</p>
          </div>
          <div className="flex gap-3 items-center">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm bg-white"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button 
              onClick={fetchStats} 
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Views" value={formatNumber(stats.totalViews)} />
          <StatCard label="Avg Views/Post" value={formatNumber(stats.avgViewsPerPost)} color="blue" />
          <StatCard label="Total Posts" value={stats.totalPosts.toString()} />
          <StatCard label="Published" value={stats.publishedCount.toString()} color="green" />
          <StatCard label="Drafts" value={stats.draftCount.toString()} color="amber" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Posts</span>
                  <span className="font-semibold">{stats.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Published</span>
                  <span className="font-semibold text-green-600">{stats.publishedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Drafts</span>
                  <span className="font-semibold text-amber-600">{stats.draftCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-semibold text-purple-600">{stats.scheduledCount}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-500">Total Views</span>
                  <span className="font-bold text-lg">{formatNumber(stats.totalViews)}</span>
                </div>
              </div>
            </div>

            {/* Recent Top Posts */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Top 5 Posts</h3>
              <div className="space-y-2">
                {topPosts.slice(0, 5).map((post, i) => (
                  <Link 
                    key={post.id} 
                    href={`/edit-post/${post.id}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' :
                        i === 1 ? 'bg-gray-100 text-gray-700' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm truncate max-w-[200px]">{post.title}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatNumber(post.views)} views</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <UnifiedAnalytics 
            defaultSource="posts"
            showSourceSelector={false}
            title="Post Performance Analytics"
            description="Detailed views and engagement analytics"
          />
        )}

        {activeTab === 'top-posts' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">🏆 Top Performing Posts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Views</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">No posts found</td>
                    </tr>
                  ) : (
                    topPosts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            post.rank === 1 ? 'bg-amber-100 text-amber-700' :
                            post.rank === 2 ? 'bg-gray-100 text-gray-700' :
                            post.rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {post.rank}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/edit-post/${post.id}`} className="font-medium text-gray-900 hover:underline">
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{post.category}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatNumber(post.views)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            post.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                            post.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                            'bg-purple-50 text-purple-700'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">📁 Performance by Category</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Posts</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Views</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Avg Views/Post</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-400">No category data</td>
                    </tr>
                  ) : (
                    categoryStats.map(cat => (
                      <tr key={cat.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                        <td className="px-4 py-3 text-right">{cat.count}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatNumber(cat.views)}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(cat.avgPerPost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminNavigation>
  );
}