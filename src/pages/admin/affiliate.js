// src/pages/admin/affiliate.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import UnifiedAnalytics from '@/components/admin/UnifiedAnalytics';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`}>
      {message}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color = 'default' }) => {
  const colors = {
    default: 'bg-gray-50',
    green: 'bg-emerald-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
  };
  
  return (
    <div className={`${colors[color]} rounded-xl p-4 border border-gray-100`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

// Modal Component
const Modal = ({ title, onClose, children, onSave, isEditing }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="font-semibold text-lg">{isEditing ? `Edit ${title}` : `Add ${title}`}</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-500">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          {children}
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onSave} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
            {isEditing ? 'Update' : 'Add'} Link
          </button>
        </div>
      </div>
    </div>
  );
};

// Category options
const CATEGORY_OPTIONS = [
  { value: 'amazon', label: 'Amazon', icon: '🛒' },
  { value: 'shareasale', label: 'ShareASale', icon: '📊' },
  { value: 'cj', label: 'CJ Affiliate', icon: '🔗' },
  { value: 'direct', label: 'Direct', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '📁' },
];

export default function AffiliateManager() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('links');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    cloaked_url: '',
    link_category: 'other',
    commission_type: 'percentage',
    commission_value: '',
    cookie_duration: 30,
    is_active: true
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchLinks = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured');
      }

      let query = supabase.from('affiliate_links').select('*');
      
      if (selectedCategory !== 'all') {
        query = query.eq('link_category', selectedCategory);
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setLinks(data || []);
    } catch (err) {
      console.error('Error fetching links:', err);
      setError('Failed to load affiliate links');
      showToast('Failed to load affiliate links', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks();
    }
  }, [isAuthenticated, selectedCategory]);

  const generateCloakedUrl = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `/go/${slug}`;
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const saveLink = async () => {
    if (!formData.name || !formData.url) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    if (!validateUrl(formData.url)) {
      showToast('Please enter a valid URL (including https://)', 'error');
      return;
    }
    
    const cloakedUrl = formData.cloaked_url || generateCloakedUrl(formData.name);
    
    try {
      if (editingLink) {
        const { error } = await supabase
          .from('affiliate_links')
          .update({
            name: formData.name,
            url: formData.url,
            cloaked_url: cloakedUrl,
            link_category: formData.link_category,
            commission_type: formData.commission_type,
            commission_value: parseFloat(formData.commission_value) || 0,
            cookie_duration: parseInt(formData.cookie_duration),
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLink.id);
        
        if (error) throw error;
        showToast('Link updated successfully');
      } else {
        const { error } = await supabase.from('affiliate_links').insert([{
          name: formData.name,
          url: formData.url,
          cloaked_url: cloakedUrl,
          link_category: formData.link_category,
          commission_type: formData.commission_type,
          commission_value: parseFloat(formData.commission_value) || 0,
          cookie_duration: parseInt(formData.cookie_duration),
          is_active: formData.is_active,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          created_at: new Date().toISOString()
        }]);
        
        if (error) throw error;
        showToast('Link added successfully');
      }
      
      await fetchLinks();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving link:', err);
      showToast('Error saving link: ' + err.message, 'error');
    }
  };

  const deleteLink = async (id) => {
    if (!confirm('Delete this affiliate link? This will also delete all click data.')) return;
    
    try {
      const { error } = await supabase.from('affiliate_links').delete().eq('id', id);
      
      if (error) throw error;
      showToast('Link deleted');
      await fetchLinks();
    } catch (err) {
      console.error('Error deleting link:', err);
      showToast('Error deleting link', 'error');
    }
  };

  const toggleLinkStatus = async (link) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);
      
      if (error) throw error;
      showToast(`${link.name} ${!link.is_active ? 'activated' : 'deactivated'}`);
      fetchLinks();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      cloaked_url: '',
      link_category: 'other',
      commission_type: 'percentage',
      commission_value: '',
      cookie_duration: 30,
      is_active: true
    });
    setEditingLink(null);
  };

  const editLink = (link) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      cloaked_url: link.cloaked_url || '',
      link_category: link.link_category || 'other',
      commission_type: link.commission_type || 'percentage',
      commission_value: link.commission_value || '',
      cookie_duration: link.cookie_duration || 30,
      is_active: link.is_active
    });
    setShowModal(true);
  };

  const exportToCSV = () => {
    if (links.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    
    const headers = ['Name', 'URL', 'Category', 'Clicks', 'Conversions', 'Revenue', 'EPC', 'Status'];
    const rows = links.map(link => [
      link.name,
      link.url,
      link.link_category,
      link.clicks || 0,
      link.conversions || 0,
      (link.revenue || 0).toFixed(2),
      ((link.revenue || 0) / ((link.clicks || 1))).toFixed(2),
      link.is_active ? 'Active' : 'Inactive'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate_links_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export complete');
  };

  const getCategoryLabel = (category) => {
    const found = CATEGORY_OPTIONS.find(c => c.value === category);
    return found ? `${found.icon} ${found.label}` : category;
  };

  // Calculate stats
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalRevenue = links.reduce((sum, l) => sum + (l.revenue || 0), 0);
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
  const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

  const tabs = [
    { id: 'links', label: '🔗 Manage Links', icon: '🔗' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
  ];

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <AdminNavigation>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </AdminNavigation>
    );
  }

  if (error) {
    return (
      <AdminNavigation>
        <div className="p-4 text-center text-red-500">
          <p>{error}</p>
          <button onClick={fetchLinks} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg">Retry</button>
        </div>
      </AdminNavigation>
    );
  }

  return (
    <AdminNavigation>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Toast */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ ...toast, show: false })} 
          />
        )}

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔗 Affiliate Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Manage affiliate links, track performance, and optimize earnings</p>
          </div>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50 transition"
              onClick={exportToCSV}
            >
              📥 Export CSV
            </button>
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition"
              onClick={() => { resetForm(); setShowModal(true); }}
            >
              + Add Link
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="green" />
          <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} />
          <StatCard label="Conversions" value={totalConversions.toString()} />
          <StatCard label="EPC (Avg)" value={formatCurrency(epc)} color="blue" />
          <StatCard label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} color="purple" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'links' && (
          <>
            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap mb-4">
              <button 
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`} 
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {CATEGORY_OPTIONS.map(cat => (
                <button 
                  key={cat.value}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    selectedCategory === cat.value ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`} 
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Links Table */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Clicks</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Conv.</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">EPC</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {links.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">
                          No affiliate links yet. Click "Add Link" to get started.
                        </td>
                      </tr>
                    ) : (
                      links.map(link => (
                        <tr key={link.id} className="hover:bg-gray-50 transition">
                          <td className="p-3 text-sm font-medium text-gray-900">{link.name}</td>
                          <td className="p-3 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {getCategoryLabel(link.link_category)}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{link.clicks || 0}</td>
                          <td className="p-3 text-sm">{link.conversions || 0}</td>
                          <td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(link.revenue || 0)}</td>
                          <td className="p-3 text-sm">{formatCurrency((link.revenue || 0) / ((link.clicks || 1)))}</td>
                          <td className="p-3 text-sm">
                            <button
                              onClick={() => toggleLinkStatus(link)}
                              className={`px-2 py-1 rounded-full text-xs transition ${
                                link.is_active 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {link.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex gap-2">
                              <button onClick={() => editLink(link)} className="text-blue-600 hover:underline text-xs">Edit</button>
                              <button onClick={() => deleteLink(link.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <UnifiedAnalytics 
            defaultSource="affiliate"
            showSourceSelector={false}
            title="Affiliate Analytics"
            description="Track clicks, revenue, and performance"
          />
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <Modal 
            title="Affiliate Link" 
            onClose={() => setShowModal(false)} 
            onSave={saveLink} 
            isEditing={!!editingLink}
          >
            <input 
              type="text" 
              placeholder="Link Name *" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input 
              type="url" 
              placeholder="Affiliate URL * (https://...)" 
              value={formData.url} 
              onChange={(e) => setFormData({...formData, url: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input 
              type="text" 
              placeholder="Cloaked URL (optional)" 
              value={formData.cloaked_url} 
              onChange={(e) => setFormData({...formData, cloaked_url: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <select 
              value={formData.link_category} 
              onChange={(e) => setFormData({...formData, link_category: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select 
                value={formData.commission_type} 
                onChange={(e) => setFormData({...formData, commission_type: e.target.value})} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Commission Value" 
                value={formData.commission_value} 
                onChange={(e) => setFormData({...formData, commission_value: e.target.value})} 
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <input 
              type="number" 
              placeholder="Cookie Duration (days)" 
              value={formData.cookie_duration} 
              onChange={(e) => setFormData({...formData, cookie_duration: e.target.value})} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.is_active} 
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
              />
              <span className="text-sm">Active (link is working and trackable)</span>
            </label>
          </Modal>
        )}
      </div>
    </AdminNavigation>
  );
}