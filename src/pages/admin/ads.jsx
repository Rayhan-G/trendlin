import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import UnifiedAnalytics from '@/components/admin/UnifiedAnalytics';
import { formatNumber } from '@/utils/formatters';

// Helper function to format currency
const formatCurrency = (amount) => {
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
    <div className={`${colors[color]} rounded-xl p-5 border border-gray-100`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

// Modal Component
const Modal = ({ title, onClose, children, onSave, isEditing }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="font-semibold text-lg">{isEditing ? `Edit ${title}` : `New ${title}`}</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-500">&times;</button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} className="flex-1 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800">
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LOCATION_OPTIONS = [
  { value: 'header', label: 'Header', icon: '📌' },
  { value: 'sidebar', label: 'Sidebar', icon: '📁' },
  { value: 'in_content', label: 'In Content', icon: '📝' },
  { value: 'footer', label: 'Footer', icon: '🔻' },
];

export default function AdManager() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [codes, setCodes] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('slots');
  const [error, setError] = useState(null);

  const [slotForm, setSlotForm] = useState({
    name: '', description: '', location: 'sidebar',
    width: 300, height: 250, priority: 0, is_active: true
  });

  const [codeForm, setCodeForm] = useState({
    name: '', description: '', code: '', is_active: true
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const getDateFilter = () => {
    const now = new Date();
    const startDate = new Date();
    if (dateRange === '7days') startDate.setDate(now.getDate() - 7);
    else if (dateRange === '30days') startDate.setDate(now.getDate() - 30);
    else if (dateRange === '90days') startDate.setDate(now.getDate() - 90);
    return { start: startDate.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured');
      }

      // Load slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('ad_slots')
        .select('*')
        .order('priority', { ascending: false });
      
      if (slotsError) throw slotsError;
      setSlots(slotsData || []);

      // Load codes
      const { data: codesData, error: codesError } = await supabase
        .from('ad_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (codesError) throw codesError;
      setCodes(codesData || []);

      // Load revenue data
      const { start, end } = getDateFilter();
      const { data: revenueData, error: revenueError } = await supabase
        .from('ad_revenue')
        .select('*')
        .gte('revenue_date', start)
        .lte('revenue_date', end)
        .order('revenue_date', { ascending: true });
      
      if (revenueError) throw revenueError;
      setRevenueData(revenueData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      showToast('Failed to load data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const saveSlot = async () => {
    if (!slotForm.name.trim()) {
      showToast('Slot name is required', 'error');
      return;
    }

    const slug = slotForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const data = { ...slotForm, slug, updated_at: new Date().toISOString() };
    
    try {
      if (editingSlot) {
        const { error } = await supabase.from('ad_slots').update(data).eq('id', editingSlot.id);
        if (error) throw error;
        showToast('Slot updated');
      } else {
        const { error } = await supabase.from('ad_slots').insert([{ ...data, created_at: new Date().toISOString() }]);
        if (error) throw error;
        showToast('Slot created');
      }
      
      setShowSlotModal(false);
      setEditingSlot(null);
      setSlotForm({ name: '', description: '', location: 'sidebar', width: 300, height: 250, priority: 0, is_active: true });
      loadAllData();
    } catch (err) {
      showToast('Error saving slot: ' + err.message, 'error');
    }
  };

  const saveCode = async () => {
    if (!codeForm.name.trim()) {
      showToast('Code name is required', 'error');
      return;
    }
    if (!codeForm.code.trim()) {
      showToast('Ad code is required', 'error');
      return;
    }

    const data = { ...codeForm, updated_at: new Date().toISOString() };
    
    try {
      if (editingCode) {
        const { error } = await supabase.from('ad_codes').update(data).eq('id', editingCode.id);
        if (error) throw error;
        showToast('Code updated');
      } else {
        const { error } = await supabase.from('ad_codes').insert([{ ...data, created_at: new Date().toISOString() }]);
        if (error) throw error;
        showToast('Code created');
      }
      
      setShowCodeModal(false);
      setEditingCode(null);
      setCodeForm({ name: '', description: '', code: '', is_active: true });
      loadAllData();
    } catch (err) {
      showToast('Error saving code: ' + err.message, 'error');
    }
  };

  const toggleSlot = async (slot) => {
    try {
      const { error } = await supabase.from('ad_slots').update({ is_active: !slot.is_active }).eq('id', slot.id);
      if (error) throw error;
      showToast(`${slot.name} ${!slot.is_active ? 'activated' : 'deactivated'}`);
      loadAllData();
    } catch (err) {
      showToast('Error updating slot', 'error');
    }
  };

  const toggleCode = async (code) => {
    try {
      const { error } = await supabase.from('ad_codes').update({ is_active: !code.is_active }).eq('id', code.id);
      if (error) throw error;
      showToast(`${code.name} ${!code.is_active ? 'activated' : 'deactivated'}`);
      loadAllData();
    } catch (err) {
      showToast('Error updating code', 'error');
    }
  };

  const deleteSlot = async (id) => {
    if (!confirm('Delete this ad slot?')) return;
    try {
      const { error } = await supabase.from('ad_slots').delete().eq('id', id);
      if (error) throw error;
      showToast('Slot deleted');
      loadAllData();
    } catch (err) {
      showToast('Error deleting slot', 'error');
    }
  };

  const deleteCode = async (id) => {
    if (!confirm('Delete this ad code?')) return;
    try {
      const { error } = await supabase.from('ad_codes').delete().eq('id', id);
      if (error) throw error;
      showToast('Code deleted');
      loadAllData();
    } catch (err) {
      showToast('Error deleting code', 'error');
    }
  };

  const totalImpressions = revenueData.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const totalClicks = revenueData.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const totalRevenue = revenueData.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00';

  const tabs = [
    { id: 'slots', label: '📍 Ad Slots' },
    { id: 'codes', label: '💻 Ad Codes' },
    { id: 'analytics', label: '📊 Analytics' },
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
        <div className="p-6 text-center">
          <div className="bg-red-50 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadAllData} className="px-4 py-2 bg-black text-white rounded-lg">
              Retry
            </button>
          </div>
        </div>
      </AdminNavigation>
    );
  }

  return (
    <AdminNavigation>
      <div className="p-6 max-w-7xl mx-auto">
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        )}

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎨 Ad Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Manage ad slots, codes, and track performance</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setEditingSlot(null); setSlotForm({ name: '', description: '', location: 'sidebar', width: 300, height: 250, priority: 0, is_active: true }); setShowSlotModal(true); }} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm hover:bg-gray-200">+ New Ad Slot</button>
            <button onClick={() => { setEditingCode(null); setCodeForm({ name: '', description: '', code: '', is_active: true }); setShowCodeModal(true); }} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800">+ New Ad Code</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Impressions" value={formatNumber(totalImpressions)} />
          <StatCard label="Total Clicks" value={formatNumber(totalClicks)} />
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="green" />
          <StatCard label="CTR" value={`${avgCTR}%`} color="purple" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {['7days', '30days', '90days'].map(range => (
              <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-2 rounded-full text-sm ${dateRange === range ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'slots' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map(slot => (
              <div key={slot.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{slot.name}</h4>
                    <p className="text-xs text-gray-500">{slot.location} • {slot.width}x{slot.height}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${slot.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {slot.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {slot.description && <p className="text-sm text-gray-600 mb-3">{slot.description}</p>}
                <div className="flex gap-3 pt-3 border-t">
                  <button onClick={() => { setEditingSlot(slot); setSlotForm(slot); setShowSlotModal(true); }} className="text-sm text-blue-600">Edit</button>
                  <button onClick={() => toggleSlot(slot)} className="text-sm text-amber-600">{slot.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => deleteSlot(slot.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="grid md:grid-cols-2 gap-4">
            {codes.map(code => (
              <div key={code.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{code.name}</h4>
                    {code.description && <p className="text-xs text-gray-500">{code.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${code.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {code.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-3 overflow-x-auto">
                  <code className="text-xs break-all">{code.code?.substring(0, 150)}...</code>
                </div>
                <div className="flex gap-3 pt-3 border-t">
                  <button onClick={() => { setEditingCode(code); setCodeForm(code); setShowCodeModal(true); }} className="text-sm text-blue-600">Edit</button>
                  <button onClick={() => toggleCode(code)} className="text-sm text-amber-600">{code.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => deleteCode(code.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <UnifiedAnalytics defaultSource="ads" showSourceSelector={false} />
        )}

        {showSlotModal && (
          <Modal title="Ad Slot" onClose={() => setShowSlotModal(false)} onSave={saveSlot} isEditing={!!editingSlot}>
            <input type="text" placeholder="Slot Name *" value={slotForm.name} onChange={(e) => setSlotForm({...slotForm, name: e.target.value})} className="w-full p-3 border rounded-lg" />
            <textarea placeholder="Description" value={slotForm.description} onChange={(e) => setSlotForm({...slotForm, description: e.target.value})} rows={2} className="w-full p-3 border rounded-lg" />
            <select value={slotForm.location} onChange={(e) => setSlotForm({...slotForm, location: e.target.value})} className="w-full p-3 border rounded-lg">
              {LOCATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
            </select>
            <div className="flex gap-3">
              <input type="number" placeholder="Width" value={slotForm.width} onChange={(e) => setSlotForm({...slotForm, width: parseInt(e.target.value) || 0})} className="flex-1 p-3 border rounded-lg" />
              <input type="number" placeholder="Height" value={slotForm.height} onChange={(e) => setSlotForm({...slotForm, height: parseInt(e.target.value) || 0})} className="flex-1 p-3 border rounded-lg" />
            </div>
            <input type="number" placeholder="Priority" value={slotForm.priority} onChange={(e) => setSlotForm({...slotForm, priority: parseInt(e.target.value) || 0})} className="w-full p-3 border rounded-lg" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={slotForm.is_active} onChange={(e) => setSlotForm({...slotForm, is_active: e.target.checked})} /> Active</label>
          </Modal>
        )}

        {showCodeModal && (
          <Modal title="Ad Code" onClose={() => setShowCodeModal(false)} onSave={saveCode} isEditing={!!editingCode}>
            <input type="text" placeholder="Code Name *" value={codeForm.name} onChange={(e) => setCodeForm({...codeForm, name: e.target.value})} className="w-full p-3 border rounded-lg" />
            <textarea placeholder="Description" value={codeForm.description} onChange={(e) => setCodeForm({...codeForm, description: e.target.value})} rows={2} className="w-full p-3 border rounded-lg" />
            <textarea placeholder="Ad Code (HTML/JavaScript) *" value={codeForm.code} onChange={(e) => setCodeForm({...codeForm, code: e.target.value})} rows={5} className="w-full p-3 font-mono text-xs border rounded-lg" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={codeForm.is_active} onChange={(e) => setCodeForm({...codeForm, is_active: e.target.checked})} /> Active</label>
          </Modal>
        )}
      </div>
    </AdminNavigation>
  );
}