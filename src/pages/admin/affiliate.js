import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AffiliateManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [links, setLinks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    cloaked_url: '',
    link_category: 'other',
    commission_type: 'percentage',
    commission_value: '',
    cookie_duration: 30,
    is_active: true
  })

  useEffect(() => {
    checkAuth()
    fetchLinks()
  }, [selectedCategory])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const checkAuth = () => {
    const sessionToken = localStorage.getItem('admin_session_token')
    const sessionExpiry = localStorage.getItem('admin_session_expiry')
    
    if (!sessionToken || !sessionExpiry) {
      router.push('/')
      return
    }
    
    const now = Date.now()
    if (now > parseInt(sessionExpiry)) {
      localStorage.removeItem('admin_session_token')
      localStorage.removeItem('admin_session_expiry')
      router.push('/')
    }
  }

  const fetchLinks = async () => {
    setLoading(true)
    let query = supabase.from('affiliate_links').select('*')
    
    if (selectedCategory !== 'all') {
      query = query.eq('link_category', selectedCategory)
    }
    
    const { data } = await query.order('created_at', { ascending: false })
    setLinks(data || [])
    setLoading(false)
  }

  const generateCloakedUrl = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `/go/${slug}`
  }

  const saveLink = async () => {
    if (!formData.name || !formData.url) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    const cloakedUrl = formData.cloaked_url || generateCloakedUrl(formData.name)
    
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
        .eq('id', editingLink.id)
      
      if (error) {
        showToast('Error updating link: ' + error.message, 'error')
      } else {
        showToast('Link updated successfully')
        await fetchLinks()
        setShowModal(false)
        resetForm()
      }
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
        created_at: new Date().toISOString()
      }])
      
      if (error) {
        showToast('Error adding link: ' + error.message, 'error')
      } else {
        showToast('Link added successfully')
        await fetchLinks()
        setShowModal(false)
        resetForm()
      }
    }
  }

  const deleteLink = async (id) => {
    if (!confirm('Delete this affiliate link? This will also delete all click data.')) return
    
    const { error } = await supabase.from('affiliate_links').delete().eq('id', id)
    
    if (!error) {
      showToast('Link deleted')
      await fetchLinks()
    }
  }

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
    })
    setEditingLink(null)
  }

  const editLink = (link) => {
    setEditingLink(link)
    setFormData({
      name: link.name,
      url: link.url,
      cloaked_url: link.cloaked_url || '',
      link_category: link.link_category || 'other',
      commission_type: link.commission_type || 'percentage',
      commission_value: link.commission_value || '',
      cookie_duration: link.cookie_duration || 30,
      is_active: link.is_active
    })
    setShowModal(true)
  }

  const getCategoryLabel = (category) => {
    const labels = {
      amazon: '🛒 Amazon',
      shareasale: '📊 ShareASale',
      cj: '🔗 CJ Affiliate',
      direct: '🤝 Direct',
      other: '📁 Other'
    }
    return labels[category] || category
  }

  // Calculate stats from real data
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0)
  const totalRevenue = links.reduce((sum, l) => sum + (l.revenue || 0), 0)
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0)
  const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0

  const topLinks = [...links].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5)
  const underperformingLinks = [...links]
    .filter(l => (l.clicks || 0) > 10 && (l.revenue || 0) < 10)
    .sort((a, b) => (a.clicks || 0) - (b.clicks || 0))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="affiliate-page">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-left">
          <h1>Affiliate Manager</h1>
          <p>Manage your affiliate links, track performance, and optimize earnings</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="add-btn">
          + Add Link
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👆</div>
          <div className="stat-info">
            <div className="stat-value">{totalClicks.toLocaleString()}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{totalConversions}</div>
            <div className="stat-label">Conversions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">${epc.toFixed(2)}</div>
            <div className="stat-label">EPC (Earnings per Click)</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="filters-bar">
        <button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => setSelectedCategory('all')}>All</button>
        <button className={selectedCategory === 'amazon' ? 'active' : ''} onClick={() => setSelectedCategory('amazon')}>Amazon</button>
        <button className={selectedCategory === 'shareasale' ? 'active' : ''} onClick={() => setSelectedCategory('shareasale')}>ShareASale</button>
        <button className={selectedCategory === 'cj' ? 'active' : ''} onClick={() => setSelectedCategory('cj')}>CJ</button>
        <button className={selectedCategory === 'direct' ? 'active' : ''} onClick={() => setSelectedCategory('direct')}>Direct</button>
        <button className={selectedCategory === 'other' ? 'active' : ''} onClick={() => setSelectedCategory('other')}>Other</button>
      </div>

      {/* Links Table */}
      <div className="links-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Clicks</th>
              <th>Conv.</th>
              <th>Revenue</th>
              <th>EPC</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">No affiliate links yet. Click "Add Link" to get started.</td>
              </tr>
            ) : (
              links.map(link => (
                <tr key={link.id}>
                  <td className="link-name">{link.name}</td>
                  <td><span className="category-badge">{getCategoryLabel(link.link_category)}</span></td>
                  <td>{link.clicks || 0}</td>
                  <td>{link.conversions || 0}</td>
                  <td className="revenue-cell">${(link.revenue || 0).toFixed(2)}</td>
                  <td>${((link.revenue || 0) / ((link.clicks || 1))).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${link.is_active ? 'active' : 'inactive'}`}>
                      {link.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => editLink(link)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteLink(link.id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Top Performers & Underperformers */}
      <div className="performance-section">
        <div className="top-performers">
          <h3>🏆 Top Performing Links</h3>
          <div className="top-list">
            {topLinks.length === 0 ? (
              <div className="empty-message">No data yet</div>
            ) : (
              topLinks.map((link, index) => (
                <div key={link.id} className="top-item">
                  <div className="top-rank">{index + 1}</div>
                  <div className="top-info">
                    <div className="top-name">{link.name}</div>
                    <div className="top-meta">{link.clicks || 0} clicks • ${(link.revenue || 0).toFixed(2)} revenue</div>
                  </div>
                  <div className="top-value">${(link.revenue || 0).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="underperformers">
          <h3>⚠️ Underperforming Links (10+ clicks, &lt;$10 revenue)</h3>
          <div className="under-list">
            {underperformingLinks.length === 0 ? (
              <div className="empty-message">No underperforming links</div>
            ) : (
              underperformingLinks.map(link => (
                <div key={link.id} className="under-item">
                  <div className="under-name">{link.name}</div>
                  <div className="under-stats">{link.clicks || 0} clicks • ${(link.revenue || 0).toFixed(2)} revenue</div>
                  <button onClick={() => editLink(link)} className="optimize-btn">Optimize →</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLink ? 'Edit Affiliate Link' : 'Add Affiliate Link'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Link Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Best Noise Cancelling Headphones"
                />
              </div>
              <div className="form-group">
                <label>Affiliate URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://amazon.com/..."
                />
              </div>
              <div className="form-group">
                <label>Cloaked URL (optional)</label>
                <input
                  type="text"
                  value={formData.cloaked_url}
                  onChange={(e) => setFormData({...formData, cloaked_url: e.target.value})}
                  placeholder="/go/your-link"
                />
                <small>Leave empty to auto-generate</small>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.link_category} onChange={(e) => setFormData({...formData, link_category: e.target.value})}>
                    <option value="amazon">Amazon</option>
                    <option value="shareasale">ShareASale</option>
                    <option value="cj">CJ Affiliate</option>
                    <option value="direct">Direct</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Commission Type</label>
                  <select value={formData.commission_type} onChange={(e) => setFormData({...formData, commission_type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Commission Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission_value}
                    onChange={(e) => setFormData({...formData, commission_value: e.target.value})}
                    placeholder="10 for 10% or 5.00 for $5"
                  />
                </div>
                <div className="form-group">
                  <label>Cookie Duration (days)</label>
                  <input
                    type="number"
                    value={formData.cookie_duration}
                    onChange={(e) => setFormData({...formData, cookie_duration: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  Active (link is working and trackable)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={saveLink} className="save-btn">{editingLink ? 'Update' : 'Add'} Link</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .affiliate-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem;
        }
        
        :global(body.dark) .affiliate-page {
          background: #0f172a;
        }
        
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border-radius: 12px;
          z-index: 1100;
        }
        
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-success { border-left: 4px solid #10b981; }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
        }
        
        :global(body.dark) .page-header h1 {
          color: #f1f5f9;
        }
        
        .page-header p {
          color: #64748b;
        }
        
        .add-btn {
          padding: 0.6rem 1.25rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        :global(body.dark) .stat-card {
          background: #1e293b;
        }
        
        .stat-icon { font-size: 2rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }
        .stat-label { font-size: 0.75rem; color: #64748b; }
        
        .filters-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .filters-bar button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .filters-bar button.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }
        
        .links-table {
          background: white;
          border-radius: 16px;
          overflow-x: auto;
          margin-bottom: 2rem;
        }
        
        :global(body.dark) .links-table {
          background: #1e293b;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        th {
          font-weight: 600;
          color: #475569;
        }
        
        .link-name { font-weight: 500; }
        .revenue-cell { color: #10b981; font-weight: 600; }
        
        .category-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          background: #f1f5f9;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .status-badge.active { background: #d1fae5; color: #065f46; }
        .status-badge.inactive { background: #fee2e2; color: #991b1b; }
        
        .actions-cell { display: flex; gap: 0.5rem; }
        
        .edit-btn, .delete-btn {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .edit-btn { background: #3b82f6; color: white; }
        .delete-btn { background: #ef4444; color: white; }
        
        .empty-row { text-align: center; padding: 2rem; color: #64748b; }
        
        .performance-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .top-performers, .underperformers {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
        }
        
        :global(body.dark) .top-performers,
        :global(body.dark) .underperformers {
          background: #1e293b;
        }
        
        .top-performers h3, .underperformers h3 { margin-bottom: 1rem; }
        
        .top-item, .under-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .top-rank {
          width: 32px;
          height: 32px;
          background: #667eea;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        
        .top-info, .under-name { flex: 1; }
        .top-name { font-weight: 600; }
        .top-meta, .under-stats { font-size: 0.7rem; color: #64748b; }
        .top-value { font-weight: 700; color: #10b981; }
        
        .optimize-btn {
          padding: 0.25rem 0.75rem;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .empty-message { text-align: center; padding: 2rem; color: #64748b; }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
        }
        
        :global(body.dark) .modal-content { background: #1e293b; }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .modal-body { padding: 1.5rem; }
        
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .form-group.checkbox input { width: auto; }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        small { display: block; margin-top: 0.25rem; color: #64748b; font-size: 0.7rem; }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .cancel-btn, .save-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .cancel-btn { background: #ef4444; color: white; }
        .save-btn { background: #10b981; color: white; }
        
        @media (max-width: 768px) {
          .affiliate-page { padding: 1rem; }
          .stats-dashboard { grid-template-columns: repeat(2, 1fr); }
          .performance-section { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .links-table { font-size: 0.8rem; }
          th, td { padding: 0.5rem; }
        }
      `}</style>
    </div>
  )
}