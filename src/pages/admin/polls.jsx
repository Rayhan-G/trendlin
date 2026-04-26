// src/pages/admin/polls.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNavigation from '@/components/admin/AdminNavigation';
import toast from 'react-hot-toast';
import { 
  Plus, Edit, Trash2, Copy, Eye, Code, X, CheckCircle, Clock, XCircle, 
  BarChart3, Users, Share2 
} from 'lucide-react';

export default function PollManager() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [requireLogin, setRequireLogin] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPolls(data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleSavePoll = async () => {
    if (!title.trim()) {
      toast.error('Please enter a poll title');
      return;
    }
    
    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error('Please add at least 2 options');
      return;
    }
    
    setSaving(true);
    
    try {
      let pollId = editingPoll?.id;
      
      if (editingPoll) {
        const { error } = await supabase
          .from('polls')
          .update({
            title, description, status,
            allow_multiple_votes: allowMultiple,
            show_results_immediately: showResults,
            require_login_to_vote: requireLogin,
            start_date: startDate || null,
            end_date: endDate || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPoll.id);
        
        if (error) throw error;
        
        await supabase.from('poll_options').delete().eq('poll_id', editingPoll.id);
        
        const optionsToInsert = validOptions.map((opt, idx) => ({
          poll_id: editingPoll.id,
          text: opt.text,
          order_position: idx
        }));
        
        await supabase.from('poll_options').insert(optionsToInsert);
        toast.success('Poll updated successfully');
      } else {
        const { data, error } = await supabase
          .from('polls')
          .insert({
            title, description, status,
            allow_multiple_votes: allowMultiple,
            show_results_immediately: showResults,
            require_login_to_vote: requireLogin,
            start_date: startDate || null,
            end_date: endDate || null
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const optionsToInsert = validOptions.map((opt, idx) => ({
          poll_id: data.id,
          text: opt.text,
          order_position: idx
        }));
        
        await supabase.from('poll_options').insert(optionsToInsert);
        toast.success('Poll created successfully');
      }
      
      resetForm();
      setShowCreateModal(false);
      setEditingPoll(null);
      fetchPolls();
      
    } catch (error) {
      console.error('Error saving poll:', error);
      toast.error('Failed to save poll');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOptions([{ text: '' }, { text: '' }]);
    setStatus('draft');
    setAllowMultiple(false);
    setShowResults(true);
    setRequireLogin(false);
    setStartDate('');
    setEndDate('');
  };

  const handleEditPoll = async (poll) => {
    setEditingPoll(poll);
    setTitle(poll.title);
    setDescription(poll.description || '');
    setStatus(poll.status);
    setAllowMultiple(poll.allow_multiple_votes);
    setShowResults(poll.show_results_immediately);
    setRequireLogin(poll.require_login_to_vote);
    setStartDate(poll.start_date?.split('T')[0] || '');
    setEndDate(poll.end_date?.split('T')[0] || '');
    
    const { data: optionsData } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', poll.id)
      .order('order_position');
    
    if (optionsData?.length) {
      setOptions(optionsData.map(opt => ({ id: opt.id, text: opt.text })));
    }
    
    setShowCreateModal(true);
  };

  const handleDeletePoll = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    
    try {
      const { error } = await supabase.from('polls').delete().eq('id', pollId);
      if (error) throw error;
      setPolls(polls.filter(p => p.id !== pollId));
      toast.success('Poll deleted');
    } catch (error) {
      toast.error('Failed to delete poll');
    }
  };

  const getEmbedCode = (pollId) => {
    return `<div data-poll-id="${pollId}" id="trendlin-poll-${pollId}"></div>
<script src="https://trendlin.com/embed/poll.js" async></script>`;
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { icon: CheckCircle, class: 'bg-green-100 text-green-700', label: 'Active' },
      draft: { icon: Clock, class: 'bg-gray-100 text-gray-700', label: 'Draft' },
      closed: { icon: XCircle, class: 'bg-red-100 text-red-700', label: 'Closed' }
    };
    const c = config[status] || config.draft;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.class}`}>
        <Icon size={12} /> {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminNavigation>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminNavigation>
    );
  }

  return (
    <AdminNavigation>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Poll Manager</h1>
            <p className="text-gray-500 mt-1">Create and manage interactive polls for your audience</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingPoll(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg"
          >
            <Plus size={18} /> Create Poll
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><BarChart3 size={20} className="text-purple-600" /></div>
              <div><div className="text-2xl font-bold">{polls.length}</div><div className="text-xs text-gray-500">Total Polls</div></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle size={20} className="text-green-600" /></div>
              <div><div className="text-2xl font-bold">{polls.filter(p => p.status === 'active').length}</div><div className="text-xs text-gray-500">Active</div></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Users size={20} className="text-blue-600" /></div>
              <div><div className="text-2xl font-bold">{polls.reduce((sum, p) => sum + (p.total_votes || 0), 0).toLocaleString()}</div><div className="text-xs text-gray-500">Total Votes</div></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Share2 size={20} className="text-yellow-600" /></div>
              <div><div className="text-2xl font-bold">{polls.reduce((sum, p) => sum + (p.share_count || 0), 0).toLocaleString()}</div><div className="text-xs text-gray-500">Shares</div></div>
            </div>
          </div>
        </div>

        {/* Polls Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poll</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Votes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {polls.map((poll) => (
                  <tr key={poll.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{poll.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{poll.poll_type || 'standard'} poll</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(poll.status)}</td>
                    <td className="px-6 py-4 text-center font-semibold">{poll.total_votes?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {poll.start_date ? new Date(poll.start_date).toLocaleDateString() : 'No schedule'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setShowEmbedModal(poll.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Get Embed Code">
                          <Code size={16} />
                        </button>
                        <button onClick={() => handleEditPoll(poll)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeletePoll(poll.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {polls.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No polls yet. Click "Create Poll" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingPoll ? 'Edit Poll' : 'Create New Poll'}</h2>
              <button onClick={() => { setShowCreateModal(false); setEditingPoll(null); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poll Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What would you like to ask?"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more context to your poll..."
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poll Options *</label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {options.length > 2 && (
                        <button onClick={() => handleRemoveOption(index)} className="px-3 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={handleAddOption} className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Plus size={14} /> Add Option
                </button>
              </div>
              
              {/* Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              
              {/* Settings */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} className="rounded" />
                    <span className="text-sm">Allow multiple votes per user</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={showResults} onChange={(e) => setShowResults(e.target.checked)} className="rounded" />
                    <span className="text-sm">Show results immediately after voting</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={requireLogin} onChange={(e) => setRequireLogin(e.target.checked)} className="rounded" />
                    <span className="text-sm">Require login to vote</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => { setShowCreateModal(false); setEditingPoll(null); resetForm(); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSavePoll} disabled={saving} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : (editingPoll ? 'Update Poll' : 'Create Poll')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Embed Poll</h3>
              <button onClick={() => setShowEmbedModal(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium mb-2">Copy this code to embed the poll anywhere:</label>
              <textarea 
                readOnly 
                value={getEmbedCode(showEmbedModal)} 
                rows={4} 
                className="w-full p-3 bg-gray-50 border rounded-lg font-mono text-sm"
              />
              <button 
                onClick={() => { 
                  navigator.clipboard.writeText(getEmbedCode(showEmbedModal)); 
                  toast.success('Code copied to clipboard!');
                }} 
                className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminNavigation>
  );
}