// src/pages/admin/revenue.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import UnifiedAnalytics from '@/components/admin/UnifiedAnalytics';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
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
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
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
            {isEditing ? 'Update' : 'Add'} Entry
          </button>
        </div>
      </div>
    </div>
  );
};

// Source options
const SOURCE_OPTIONS = [
  { value: 'ad_revenue', label: '💰 Ad Revenue' },
  { value: 'affiliate_revenue', label: '🔗 Affiliate Revenue' },
  { value: 'sponsored', label: '📝 Sponsored Post' },
  { value: 'other', label: '🎁 Other' },
];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function RevenueTracker() {
  const router = useRouter();
  const [revenueEntries, setRevenueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('entries');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    source: 'ad_revenue',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Auth check
  useEffect(() => {
    const sessionToken = localStorage.getItem('admin_session_token');
    if (!sessionToken) {
      router.push('/admin/login');
      return;
    }
    fetchRevenueEntries();
  }, [selectedMonth, selectedYear]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchRevenueEntries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
      
      const { data, error } = await supabase
        .from('revenue_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      if (error) throw error;
      setRevenueEntries(data || []);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setError('Failed to load revenue data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return false;
    if (num <= 0) return false;
    if (num > 1000000) return false;
    return true;
  };

  const handleSave = async () => {
    if (!validateAmount(formData.amount)) {
      showToast('Please enter a valid amount (greater than 0, less than $1,000,000)', 'error');
      return;
    }
    
    const entryData = {
      source: formData.source,
      amount: parseFloat(formData.amount),
      date: formData.date,
      note: formData.note || null,
      updated_at: new Date().toISOString()
    };
    
    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('revenue_entries')
          .update(entryData)
          .eq('id', editingEntry.id);
        if (error) throw error;
        showToast('Revenue entry updated');
      } else {
        const { error } = await supabase
          .from('revenue_entries')
          .insert([{ ...entryData, created_at: new Date().toISOString() }]);
        if (error) throw error;
        showToast('Revenue entry added');
      }
      
      await fetchRevenueEntries();
      setShowModal(false);
      setEditingEntry(null);
      setFormData({
        source: 'ad_revenue',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
    } catch (err) {
      console.error('Error saving revenue:', err);
      showToast('Error saving revenue entry', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this revenue entry?')) return;
    
    try {
      const { error } = await supabase.from('revenue_entries').delete().eq('id', id);
      if (error) throw error;
      showToast('Revenue entry deleted');
      await fetchRevenueEntries();
    } catch (err) {
      console.error('Error deleting revenue:', err);
      showToast('Error deleting revenue entry', 'error');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      source: entry.source,
      amount: entry.amount.toString(),
      date: entry.date,
      note: entry.note || ''
    });
    setShowModal(true);
  };

  const exportToCSV = () => {
    if (revenueEntries.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    
    const headers = ['Date', 'Source', 'Amount', 'Note'];
    const rows = revenueEntries.map(entry => [
      entry.date,
      entry.source.replace('_', ' '),
      entry.amount.toFixed(2),
      entry.note || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_${selectedYear}_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export complete');
  };

  // Calculate metrics
  const totalRevenue = revenueEntries.reduce((sum, e) => sum + e.amount, 0);
  const dailyAverage = revenueEntries.length > 0 ? totalRevenue / revenueEntries.length : 0;
  
  const dates = [...new Set(revenueEntries.map(e => e.date))].sort();
  let bestDay = { date: '', amount: 0 };
  dates.forEach(date => {
    const dayTotal = revenueEntries.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0);
    if (dayTotal > bestDay.amount) bestDay = { date, amount: dayTotal };
  });

  const revenueBySource = {
    ad_revenue: revenueEntries.filter(e => e.source === 'ad_revenue').reduce((sum, e) => sum + e.amount, 0),
    affiliate_revenue: revenueEntries.filter(e => e.source === 'affiliate_revenue').reduce((sum, e) => sum + e.amount, 0),
    sponsored: revenueEntries.filter(e => e.source === 'sponsored').reduce((sum, e) => sum + e.amount, 0),
    other: revenueEntries.filter(e => e.source === 'other').reduce((sum, e) => sum + e.amount, 0)
  };

  const tabs = [
    { id: 'entries', label: '📋 Revenue Entries', icon: '📋' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
  ];

  if (loading) {
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
          <button onClick={fetchRevenueEntries} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg">Retry</button>
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
            <h1 className="text-2xl font-bold text-gray-900">💰 Revenue Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">Track your earnings and monitor performance</p>
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
              onClick={() => {
                setEditingEntry(null);
                setFormData({
                  source: 'ad_revenue',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  note: ''
                });
                setShowModal(true);
              }}
            >
              + Add Revenue
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-6 border border-gray-100">
          <button 
            onClick={() => {
              let newMonth = selectedMonth - 1;
              let newYear = selectedYear;
              if (newMonth < 1) { newMonth = 12; newYear--; }
              setSelectedMonth(newMonth);
              setSelectedYear(newYear);
            }} 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            ←
          </button>
          <h3 className="font-semibold">{monthNames[selectedMonth - 1]} {selectedYear}</h3>
          <button 
            onClick={() => {
              let newMonth = selectedMonth + 1;
              let newYear = selectedYear;
              if (newMonth > 12) { newMonth = 1; newYear++; }
              setSelectedMonth(newMonth);
              setSelectedYear(newYear);
            }} 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            →
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="green" />
          <StatCard label="Total Entries" value={revenueEntries.length.toString()} />
          <StatCard label="Daily Average" value={formatCurrency(dailyAverage)} color="blue" />
          <StatCard 
            label="Best Day" 
            value={bestDay.amount > 0 ? formatCurrency(bestDay.amount) : '$0'} 
            color="purple"
          />
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
        {activeTab === 'entries' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {revenueEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No revenue entries for {monthNames[selectedMonth - 1]} {selectedYear}
                      </td>
                    </tr>
                  ) : (
                    revenueEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="p-3 text-sm capitalize">{entry.source.replace('_', ' ')}</td>
                        <td className="p-3 text-sm font-semibold text-green-600">{formatCurrency(entry.amount)}</td>
                        <td className="p-3 text-sm text-gray-500">{entry.note || '-'}</td>
                        <td className="p-3 text-sm">
                          <div className="flex gap-3">
                            <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:underline text-xs">Edit</button>
                            <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <UnifiedAnalytics 
            defaultSource="revenue"
            showSourceSelector={false}
            title="Revenue Analytics"
            description="Track your earnings over time"
          />
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <Modal 
            title="Revenue Entry" 
            onClose={() => setShowModal(false)} 
            onSave={handleSave} 
            isEditing={!!editingEntry}
          >
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select 
                value={formData.source} 
                onChange={(e) => setFormData({...formData, source: e.target.value})} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {SOURCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Q1 campaign, Google Adsense..." 
                value={formData.note} 
                onChange={(e) => setFormData({...formData, note: e.target.value})} 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </Modal>
        )}
      </div>
    </AdminNavigation>
  );
}