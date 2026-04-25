import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(amount || 0);
};

const StatCard = ({ icon, value, label, color = 'default' }) => {
  const colors = {
    default: { bg: 'bg-gray-50', iconBg: 'bg-white', text: 'text-gray-900' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-700' },
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-700' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-700' },
  };
  const theme = colors[color] || colors.default;
  return (
    <div className={`${theme.bg} rounded-2xl p-5 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className={`${theme.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>{icon}</div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

const PostRow = ({ post }) => {
  const statusColors = {
    published: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-amber-50 text-amber-700',
    scheduled: 'bg-blue-50 text-blue-700',
  };
  return (
    <Link href={`/admin/posts/edit/${post.id}`} className="block p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{post.title || 'Untitled Post'}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[post.status] || statusColors.draft}`}>{post.status || 'draft'}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">👁️ {formatNumber(post.views || 0)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </Link>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0, publishedPosts: 0, draftPosts: 0, scheduledPosts: 0,
    totalViews: 0, totalRevenue: 0, affiliateClicks: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let safePosts = [];
      try {
        const { data: posts, error: postsError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (!postsError) safePosts = posts || [];
      } catch (err) {
        console.log('Posts table may not exist yet:', err.message);
      }
      
      const published = safePosts.filter(p => p.status === 'published');
      const drafts = safePosts.filter(p => p.status === 'draft');
      const scheduled = safePosts.filter(p => p.status === 'scheduled');
      const totalViews = safePosts.reduce((sum, p) => sum + (p.views || 0), 0);
      
      let totalRevenue = 0, affiliateClicks = 0;
      try {
        const { data: affiliate } = await supabase.from('affiliate_links').select('clicks, revenue');
        if (affiliate) {
          affiliateClicks = affiliate.reduce((sum, a) => sum + (a.clicks || 0), 0);
          totalRevenue = affiliate.reduce((sum, a) => sum + (a.revenue || 0), 0);
        }
      } catch {}
      
      setStats({
        totalPosts: safePosts.length,
        publishedPosts: published.length,
        draftPosts: drafts.length,
        scheduledPosts: scheduled.length,
        totalViews,
        totalRevenue,
        affiliateClicks
      });
      setRecentPosts(safePosts.slice(0, 5));
      const top5 = [...safePosts].filter(p => (p.views || 0) > 0).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
      setTopPosts(top5);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  if (loading) {
    return (
      <AdminNavigation>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </AdminNavigation>
    );
  }

  if (error) {
    return (
      <AdminNavigation>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={fetchDashboardData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition">
              🔄 Try Again
            </button>
          </div>
        </div>
      </AdminNavigation>
    );
  }

  return (
    <AdminNavigation>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
              <span>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/admin/posts/create" className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition">
              <span>➕</span>
              New Post
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <StatCard icon="📄" value={stats.totalPosts} label="Total Posts" />
          <StatCard icon="✅" value={stats.publishedPosts} label="Published" color="green" />
          <StatCard icon="✏️" value={stats.draftPosts} label="Drafts" color="amber" />
          <StatCard icon="📅" value={stats.scheduledPosts} label="Scheduled" color="purple" />
          <StatCard icon="👁️" value={formatNumber(stats.totalViews)} label="Views" color="blue" />
          <StatCard icon="💰" value={formatCurrency(stats.totalRevenue)} label="Revenue" color="green" />
          <StatCard icon="🔗" value={formatNumber(stats.affiliateClicks)} label="Clicks" color="purple" />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📝</span>
                <h3 className="font-semibold text-gray-900">Recent Posts</h3>
              </div>
              <Link href="/admin/posts-manager" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                View all →
              </Link>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {recentPosts.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No posts yet</p>
              ) : (
                recentPosts.map(post => <PostRow key={post.id} post={post} />)
              )}
            </div>
          </div>

          {/* Top Posts */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📈</span>
                <h3 className="font-semibold text-gray-900">Top Performing</h3>
              </div>
              <Link href="/admin/post-analytics" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                Analytics →
              </Link>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {topPosts.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No data available</p>
              ) : (
                topPosts.map((post, i) => (
                  <Link key={post.id} href={`/admin/posts/edit/${post.id}`} className="block p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-300 w-8">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{post.title || 'Untitled'}</h4>
                        <p className="text-sm text-gray-500">{formatNumber(post.views || 0)} views</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/posts/create" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl">✏️</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Post</h3>
                  <p className="text-sm text-gray-500 mt-1">Write new content</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/posts-manager" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl">📋</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Posts Manager</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage all posts</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/content-calendar" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl">📅</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Content Calendar</h3>
                  <p className="text-sm text-gray-500 mt-1">Schedule content</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/post-analytics" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">📊</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Post Analytics</h3>
                  <p className="text-sm text-gray-500 mt-1">View performance</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/media" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 text-xl">🖼️</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Media Library</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage images</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/affiliate" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">🔗</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Affiliate</h3>
                  <p className="text-sm text-gray-500 mt-1">Track earnings</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/revenue" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-xl">💰</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Revenue</h3>
                  <p className="text-sm text-gray-500 mt-1">View earnings</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/ads" className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl">📺</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ad Manager</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage ads</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminNavigation>
  );
}