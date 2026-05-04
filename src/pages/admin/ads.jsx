// src/pages/admin/ads.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdDisplay from '@/components/ads/AdDisplay';

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

// Preview Modal
const PreviewModal = ({ slot, onClose }) => {
  const previewSessionId = `preview_${Date.now()}`;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="font-semibold text-lg">Preview: {slot.name}</h3>
          <button onClick={onClose} className="text-2xl hover:text-gray-500">&times;</button>
        </div>
        <div className="p-5">
          <AdDisplay 
            slotId={slot.id} 
            postId="preview" 
            sessionId={previewSessionId}
          />
        </div>
      </div>
    </div>
  );
};

export default function AdManager() {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [codes, setCodes] = useState([]);
  const [slotCodes, setSlotCodes] = useState([]);
  const [previewSlot, setPreviewSlot] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('slots');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Load slots with search
      let slotsQuery = supabase.from('ad_slots').select('*', { count: 'exact' });
      if (searchTerm) {
        slotsQuery = slotsQuery.ilike('name', `%${searchTerm}%`);
      }
      
      const { data: slotsData, error: slotsError } = await slotsQuery
        .order('priority', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (slotsError) throw slotsError;
      setSlots(slotsData || []);

      // Load codes
      const { data: codesData, error: codesError } = await supabase
        .from('ad_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (codesError) throw codesError;
      setCodes(codesData || []);

      // Load slot-code relationships
      const { data: slotCodesData, error: slotCodesError } = await supabase
        .from('ad_slot_codes')
        .select('*, ad_slots(*), ad_codes(*)')
        .eq('is_active', true);
      
      if (slotCodesError) throw slotCodesError;
      setSlotCodes(slotCodesData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const assignCodeToSlot = async (slotId, codeId) => {
    try {
      const { error } = await supabase
        .from('ad_slot_codes')
        .insert([{ slot_id: slotId, code_id: codeId }]);
      
      if (error) throw error;
      showToast('Code assigned to slot');
      loadAllData();
    } catch (err) {
      showToast('Error assigning code', 'error');
    }
  };

  const removeCodeFromSlot = async (slotCodeId) => {
    try {
      const { error } = await supabase
        .from('ad_slot_codes')
        .delete()
        .eq('id', slotCodeId);
      
      if (error) throw error;
      showToast('Code removed from slot');
      loadAllData();
    } catch (err) {
      showToast('Error removing code', 'error');
    }
  };

  const toggleSlotStatus = async (slot) => {
    try {
      const { error } = await supabase
        .from('ad_slots')
        .update({ is_active: !slot.is_active })
        .eq('id', slot.id);
      
      if (error) throw error;
      showToast(`${slot.name} ${!slot.is_active ? 'activated' : 'deactivated'}`);
      loadAllData();
    } catch (err) {
      showToast('Error updating slot', 'error');
    }
  };

  // Get assigned codes for a slot
  const getAssignedCodes = (slotId) => {
    return slotCodes.filter(sc => sc.slot_id === slotId);
  };

  return (
    <AdminNavigation>
      <div className="p-6 max-w-7xl mx-auto">
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ad Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage ad slots, assign codes, and preview ads</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-5 py-3 text-sm font-medium ${activeTab === 'slots' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
          >
            Ad Slots
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-5 py-3 text-sm font-medium ${activeTab === 'codes' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
          >
            Ad Codes
          </button>
        </div>

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div>
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="search"
                placeholder="Search slots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Slots Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {slots.map(slot => (
                <div key={slot.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{slot.name}</h4>
                      <p className="text-xs text-gray-500">{slot.location} • {slot.width}x{slot.height}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${slot.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {slot.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {slot.description && (
                    <p className="text-sm text-gray-600 mb-3">{slot.description}</p>
                  )}

                  {/* Assigned Codes */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Assigned Codes:</p>
                    {getAssignedCodes(slot.id).length === 0 ? (
                      <p className="text-xs text-gray-400">No codes assigned</p>
                    ) : (
                      <div className="space-y-1">
                        {getAssignedCodes(slot.id).map(sc => (
                          <div key={sc.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                            <span>{sc.ad_codes.name}</span>
                            <button
                              onClick={() => removeCodeFromSlot(sc.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assign New Code */}
                  <div className="mb-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignCodeToSlot(slot.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg"
                      defaultValue=""
                    >
                      <option value="">Assign a code...</option>
                      {codes.filter(code => 
                        code.is_active && !getAssignedCodes(slot.id).some(sc => sc.code_id === code.id)
                      ).map(code => (
                        <option key={code.id} value={code.id}>{code.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3 border-t">
                    <button
                      onClick={() => setPreviewSlot(slot)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => toggleSlotStatus(slot)}
                      className="text-sm text-amber-600 hover:text-amber-700"
                    >
                      {slot.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {slots.length === itemsPerPage && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Codes Tab */}
        {activeTab === 'codes' && (
          <div className="grid md:grid-cols-2 gap-4">
            {codes.map(code => (
              <div key={code.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{code.name}</h4>
                    {code.description && <p className="text-xs text-gray-500">{code.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${code.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {code.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mb-3 overflow-x-auto">
                  <code className="text-xs break-all">{code.code?.substring(0, 100)}...</code>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewSlot && (
          <PreviewModal slot={previewSlot} onClose={() => setPreviewSlot(null)} />
        )}

        {/* CSS for loading animation */}
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </AdminNavigation>
  );
}