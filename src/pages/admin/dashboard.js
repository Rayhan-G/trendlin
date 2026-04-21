// src/pages/admin/dashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import Link from 'next/link';
import { formatNumber } from '@/utils/formatters';
import UnifiedAnalytics from '@/components/admin/UnifiedAnalytics';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  FileText, CheckCircle, Edit3, Eye, DollarSign, LinkIcon,
  TrendingUp, Calendar, BarChart3, Target, Plus,
  RefreshCw, AlertCircle, ArrowUpRight,
  Clock, MousePointer
} from 'lucide-react';

// ============================================================
// FORMATTING HELPERS
// ============================================================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// ============================================================
// STAT CARD COMPONENT
// ============================================================
const StatCard = ({ icon: Icon, value, label, color = 'default' }) => {
  const colors = {
    default: { bg: 'bg-gray-50', iconBg: 'bg-white', text: 'text-gray-900' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-700' },
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-700' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-700' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-700' },
    rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-100', text: 'text-rose-700' },
  };
  
  const theme = colors[color] || colors.default;
  
  return (
    <div className={`${theme.bg} rounded-2xl p-5 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className={`${theme.iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={theme.text} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

// ============================================================
// QUICK ACTION CARD COMPONENT
// ============================================================
const QuickActionCard = ({ href, icon: Icon, title, description, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };
  
  return (
    <Link href={href} className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <ArrowUpRight size={18} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
};

// ============================================================
// RECENT POST ROW COMPONENT
// ============================================================
const PostRow = ({ post }) => {
  const statusColors = {
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  
  return (
    <Link href={`/admin/posts/edit/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{post.title || 'Untitled Post'}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[post.status] || statusColors.draft}`}>
              {post.status || 'draft'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Eye size={12} /> {formatNumber(post.views || 0)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================
// ACTIVITY ITEM COMPONENT
// ============================================================
const ActivityItem = ({ activity }) => {
  const Icon = activity.icon;
  
  return (
    <Link 
      href={activity.link || '#'} 
      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
    >
      <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={activity.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{activity.action}</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">{formatTimeAgo(activity.time)}</span>
        </div>
      </div>
    </Link>
  );
};

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    totalViews: 0,
    totalRevenue: 0,
    affiliateClicks: 0,
  });
  
  const [recentPosts, setRecentPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // ============================================================
  // FETCH RECENT ACTIVITY (ENHANCED - WITH FALLBACKS)
  // ============================================================
  const fetchRecentActivity = useCallback(async () => {
    const activities = [];
    
    try {
      // 1. Recently published posts (handle null published_at)
      const { data: publishedPosts } = await supabase
        .from('posts')
        .select('id, title, published_at, created_at, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (publishedPosts) {
        publishedPosts.forEach(post => {
          const activityDate = post.published_at || post.created_at;
          if (activityDate) {
            activities.push({
              id: `publish-${post.id}`,
              type: 'publish',
              icon: CheckCircle,
              iconColor: 'text-green-600',
              bgColor: 'bg-green-50',
              action: 'Published',
              title: post.title || 'Untitled',
              time: new Date(activityDate),
              link: `/admin/posts/edit/${post.id}`
            });
          }
        });
      }
      
      // 2. Recently created drafts
      const { data: draftPosts } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (draftPosts) {
        draftPosts.forEach(post => {
          if (post.created_at) {
            activities.push({
              id: `draft-${post.id}`,
              type: 'draft',
              icon: Edit3,
              iconColor: 'text-amber-600',
              bgColor: 'bg-amber-50',
              action: 'Draft created',
              title: post.title || 'Untitled',
              time: new Date(post.created_at),
              link: `/admin/posts/edit/${post.id}`
            });
          }
        });
      }
      
      // 3. Recently scheduled posts
      const { data: scheduledPosts } = await supabase
        .from('posts')
        .select('id, title, scheduled_for, created_at')
        .eq('status', 'scheduled')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (scheduledPosts) {
        scheduledPosts.forEach(post => {
          const activityDate = post.scheduled_for || post.created_at;
          if (activityDate) {
            activities.push({
              id: `scheduled-${post.id}`,
              type: 'scheduled',
              icon: Calendar,
              iconColor: 'text-blue-600',
              bgColor: 'bg-blue-50',
              action: 'Scheduled',
              title: post.title || 'Untitled',
              time: new Date(activityDate),
              link: `/admin/posts/edit/${post.id}`
            });
          }
        });
      }
      
      // 4. Recent affiliate clicks
      try {
        const { data: clicks } = await supabase
          .from('affiliate_clicks')
          .select(`
            id,
            clicked_at,
            affiliate_links(name)
          `)
          .order('clicked_at', { ascending: false })
          .limit(5);
        
        if (clicks) {
          clicks.forEach(click => {
            if (click.clicked_at) {
              activities.push({
                id: `click-${click.id}`,
                type: 'click',
                icon: MousePointer,
                iconColor: 'text-purple-600',
                bgColor: 'bg-purple-50',
                action: 'Affiliate click',
                title: click.affiliate_links?.name || 'Unknown link',
                time: new Date(click.clicked_at),
                link: '/admin/affiliate'
              });
            }
          });
        }
      } catch {
        // Table might not exist yet - silently ignore
      }
      
      // 5. Recent revenue entries
      try {
        const { data: revenue } = await supabase
          .from('revenue_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (revenue) {
          revenue.forEach(entry => {
            if (entry.created_at) {
              const sourceLabel = {
                ad_revenue: 'Ad Revenue',
                affiliate_revenue: 'Affiliate',
                sponsored: 'Sponsored',
                other: 'Other'
              }[entry.source] || entry.source;
              
              activities.push({
                id: `revenue-${entry.id}`,
                type: 'revenue',
                icon: DollarSign,
                iconColor: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                action: 'Revenue added',
                title: `${formatCurrency(entry.amount)} from ${sourceLabel}`,
                time: new Date(entry.created_at),
                link: '/admin/revenue'
              });
            }
          });
        }
      } catch {
        // Table might not exist yet - silently ignore
      }
      
      // 6. Recent ad performance
      try {
        const { data: adRevenue } = await supabase
          .from('ad_revenue')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (adRevenue) {
          adRevenue.forEach(entry => {
            if (entry.created_at) {
              activities.push({
                id: `ad-${entry.id}`,
                type: 'ad',
                icon: Target,
                iconColor: 'text-rose-600',
                bgColor: 'bg-rose-50',
                action: 'Ad performance',
                title: `${formatNumber(entry.impressions || 0)} impressions, ${formatCurrency(entry.revenue || 0)}`,
                time: new Date(entry.created_at),
                link: '/admin/ads'
              });
            }
          });
        }
      } catch {
        // Table might not exist yet - silently ignore
      }
      
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
    
    // Sort all activities by time (most recent first)
    activities.sort((a, b) => b.time - a.time);
    
    return activities.slice(0, 8);
  }, []);

  // ============================================================
  // FETCH ALL DASHBOARD DATA
  // ============================================================
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured');
      }
      
      // Fetch all posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      const safePosts = posts || [];
      
      // Calculate basic stats
      const published = safePosts.filter(p => p.status === 'published');
      const drafts = safePosts.filter(p => p.status === 'draft');
      const scheduled = safePosts.filter(p => p.status === 'scheduled');
      const totalViews = safePosts.reduce((sum, p) => sum + (p.views || 0), 0);
      
      // Fetch affiliate data
      let totalRevenue = 0;
      let affiliateClicks = 0;
      
      try {
        const { data: affiliate } = await supabase
          .from('affiliate_links')
          .select('clicks, revenue');
        
        if (affiliate) {
          affiliateClicks = affiliate.reduce((sum, a) => sum + (a.clicks || 0), 0);
          totalRevenue = affiliate.reduce((sum, a) => sum + (a.revenue || 0), 0);
        }
      } catch {
        // Affiliate table might not exist
      }
      
      // Also add revenue from revenue_entries table
      try {
        const { data: revenueEntries } = await supabase
          .from('revenue_entries')
          .select('amount');
        
        if (revenueEntries) {
          totalRevenue += revenueEntries.reduce((sum, r) => sum + (r.amount || 0), 0);
        }
      } catch {
        // Table might not exist
      }
      
      // Add ad revenue
      try {
        const { data: adRevenue } = await supabase
          .from('ad_revenue')
          .select('revenue');
        
        if (adRevenue) {
          totalRevenue += adRevenue.reduce((sum, r) => sum + (r.revenue || 0), 0);
        }
      } catch {
        // Table might not exist
      }
      
      setStats({
        totalPosts: safePosts.length,
        publishedPosts: published.length,
        draftPosts: drafts.length,
        scheduledPosts: scheduled.length,
        totalViews,
        totalRevenue,
        affiliateClicks,
      });
      
      // Recent posts
      setRecentPosts(safePosts.slice(0, 5));
      
      // Top posts by views
      const top5 = [...safePosts]
        .filter(p => (p.views || 0) > 0)
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
      setTopPosts(top5);
      
      // Recent activity
      const activities = await fetchRecentActivity();
      setRecentActivity(activities);
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, fetchRecentActivity]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (authLoading || loading) {
    return (
      <AdminNavigation>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </AdminNavigation>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error) {
    return (
      <AdminNavigation>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={fetchDashboardData} className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      </AdminNavigation>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
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
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {/* UPDATED: Fixed new post link */}
            <Link
              href="/admin/posts/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition"
            >
              <Plus size={16} />
              New Post
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <StatCard icon={FileText} value={stats.totalPosts} label="Total Posts" />
          <StatCard icon={CheckCircle} value={stats.publishedPosts} label="Published" color="green" />
          <StatCard icon={Edit3} value={stats.draftPosts} label="Drafts" color="amber" />
          <StatCard icon={Calendar} value={stats.scheduledPosts} label="Scheduled" color="purple" />
          <StatCard icon={Eye} value={formatNumber(stats.totalViews)} label="Views" color="blue" />
          <StatCard icon={DollarSign} value={formatCurrency(stats.totalRevenue)} label="Revenue" color="green" />
          <StatCard icon={LinkIcon} value={formatNumber(stats.affiliateClicks)} label="Clicks" color="purple" />
        </div>

        {/* Unified Analytics */}
        <div className="mb-8">
          <UnifiedAnalytics 
            defaultSource="posts"
            showSourceSelector={true}
            showExport={true}
            title="Performance Overview"
            description="Quick analytics snapshot"
          />
        </div>

        {/* Three Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">Recent Posts</h3>
              </div>
              <Link href="/admin/posts-manager" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                View all <ArrowUpRight size={14} />
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
                <TrendingUp size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">Top Performing</h3>
              </div>
              <Link href="/admin/post-analytics" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                Analytics <ArrowUpRight size={14} />
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

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard href="/admin/posts-manager" icon={FileText} title="Post Manager" description="Create and manage content" color="blue" />
            <QuickActionCard href="/admin/content-calendar" icon={Calendar} title="Content Calendar" description="Plan publishing schedule" color="purple" />
            <QuickActionCard href="/admin/affiliate" icon={LinkIcon} title="Affiliate Manager" description="Track links and earnings" color="green" />
            <QuickActionCard href="/admin/revenue" icon={TrendingUp} title="Revenue Tracker" description="Monitor your income" color="amber" />
            <QuickActionCard href="/admin/post-analytics" icon={BarChart3} title="Post Analytics" description="Performance insights" color="rose" />
            <QuickActionCard href="/admin/ads" icon={Target} title="Ad Manager" description="Manage ad placements" color="indigo" />
          </div>
        </div>
      </div>
    </AdminNavigation>
  );
}