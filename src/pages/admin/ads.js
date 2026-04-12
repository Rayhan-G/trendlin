import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AdManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adSlots, setAdSlots] = useState([])
  const [ads, setAds] = useState([])
  const [showAdModal, setShowAdModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showRotationModal, setShowRotationModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)
  const [analyticsData, setAnalyticsData] = useState([])
  const [floorPrices, setFloorPrices] = useState({})
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  const [adForm, setAdForm] = useState({
    name: '',
    slot_id: '',
    code: '',
    ad_type: 'programmatic',
    direct_amount: '',
    ab_variant: '',
    is_active: true
  })
  
  const [scheduleForm, setScheduleForm] = useState({
    ad_id: '',
    start_date: '',
    end_date: ''
  })
  
  const [rotationForm, setRotationForm] = useState({
    ad_slot_id: '',
    ad_ids: []
  })

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

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

  const fetchData = async () => {
    setLoading(true)
    
    const { data: slots } = await supabase
      .from('ad_slots')
      .select('*')
      .order('position', { ascending: true })
    
    const { data: allAds } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false })
    
    const { data: prices } = await supabase
      .from('ad_floor_prices')
      .select('*')
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: analytics } = await supabase
      .from('ad_analytics_daily')
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    
    setAdSlots(slots || [])
    setAds(allAds || [])
    setAnalyticsData(analytics || [])
    
    const priceMap = {}
    prices?.forEach(p => { priceMap[p.ad_slot_id] = p.min_rpm })
    setFloorPrices(priceMap)
    
    setLoading(false)
  }

  const addAd = async () => {
    if (!adForm.name || !adForm.code || !adForm.slot_id) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    
    const { error } = await supabase.from('ads').insert([{
      name: adForm.name,
      slot_id: adForm.slot_id,
      code: adForm.code,
      ad_type: adForm.ad_type,
      direct_amount: adForm.ad_type === 'direct' ? parseFloat(adForm.direct_amount) : 0,
      ab_variant: adForm.ab_variant || null,
      is_active: adForm.is_active,
      created_at: new Date().toISOString()
    }])
    
    if (error) {
      showToast('Error adding ad: ' + error.message, 'error')
    } else {
      showToast('Ad added successfully')
      await fetchData()
      setShowAdModal(false)
      setAdForm({
        name: '',
        slot_id: '',
        code: '',
        ad_type: 'programmatic',
        direct_amount: '',
        ab_variant: '',
        is_active: true
      })
    }
  }

  const addSchedule = async () => {
    if (!scheduleForm.ad_id || !scheduleForm.start_date || !scheduleForm.end_date) {
      showToast('Please fill in all fields', 'error')
      return
    }
    
    const { error } = await supabase.from('ad_schedules').insert([{
      ad_id: scheduleForm.ad_id,
      start_date: scheduleForm.start_date,
      end_date: scheduleForm.end_date,
      is_active: true,
      created_at: new Date().toISOString()
    }])
    
    if (error) {
      showToast('Error adding schedule', 'error')
    } else {
      showToast('Schedule added successfully')
      await fetchData()
      setShowScheduleModal(false)
      setScheduleForm({ ad_id: '', start_date: '', end_date: '' })
    }
  }

  const updateRotation = async () => {
    const { error } = await supabase
      .from('ad_rotations')
      .upsert({
        ad_slot_id: rotationForm.ad_slot_id,
        ad_ids: rotationForm.ad_ids,
        current_index: 0,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      showToast('Error updating rotation', 'error')
    } else {
      showToast('Rotation updated successfully')
      await fetchData()
      setShowRotationModal(false)
    }
  }

  const updateFloorPrice = async (slotId, minRpm) => {
    const { error } = await supabase
      .from('ad_floor_prices')
      .upsert({
        ad_slot_id: slotId,
        min_rpm: minRpm,
        updated_at: new Date().toISOString()
      })
    
    if (!error) {
      showToast('Floor price updated')
      await fetchData()
    }
  }

  const toggleAdStatus = async (adId, currentStatus) => {
    const { error } = await supabase
      .from('ads')
      .update({ is_active: !currentStatus })
      .eq('id', adId)
    
    if (!error) {
      showToast(`Ad ${!currentStatus ? 'activated' : 'deactivated'}`)
      await fetchData()
    }
  }

  const deleteAd = async (adId) => {
    if (!confirm('Delete this ad?')) return
    
    const { error } = await supabase.from('ads').delete().eq('id', adId)
    
    if (!error) {
      showToast('Ad deleted')
      await fetchData()
    }
  }

  const getAdAnalytics = (adId) => {
    const adAnalytics = analyticsData.filter(a => a.ad_id === adId)
    const totalImpressions = adAnalytics.reduce((sum, a) => sum + a.impressions, 0)
    const totalClicks = adAnalytics.reduce((sum, a) => sum + a.clicks, 0)
    const totalRevenue = adAnalytics.reduce((sum, a) => sum + a.revenue, 0)
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    return { totalImpressions, totalClicks, totalRevenue, ctr }
  }

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
    <div className="ads-page">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <h1>Ad Manager</h1>
        <p>Manage ad slots, run A/B tests, schedule campaigns, and track performance</p>
        <button onClick={() => setShowAdModal(true)} className="add-btn">+ New Ad</button>
      </div>

      {/* Ad Slots Overview */}
      <div className="slots-grid">
        {adSlots.map(slot => {
          const slotAds = ads.filter(a => a.slot_id === slot.id)
          const activeAds = slotAds.filter(a => a.is_active)
          const floorPrice = floorPrices[slot.id] || 0
          
          return (
            <div key={slot.id} className="slot-card">
              <div className="slot-header">
                <h3>{slot.name}</h3>
                <span className={`slot-status ${slot.is_active ? 'active' : 'inactive'}`}>
                  {slot.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="slot-location">{slot.location}</div>
              <div className="slot-stats">
                <span>📊 {slotAds.length} ads</span>
                <span>✅ {activeAds.length} active</span>
              </div>
              <div className="slot-floor">
                <label>Min RPM: ${floorPrice.toFixed(2)}</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={floorPrice} 
                  onChange={(e) => updateFloorPrice(slot.id, parseFloat(e.target.value))}
                  className="floor-input"
                />
              </div>
              <button 
                onClick={() => {
                  setRotationForm({ ad_slot_id: slot.id, ad_ids: slotAds.map(a => a.id) })
                  setShowRotationModal(true)
                }} 
                className="rotate-btn"
              >
                🔄 Set Rotation
              </button>
            </div>
          )
        })}
      </div>

      {/* Ads Table */}
      <div className="ads-table-container">
        <h3>All Ads</h3>
        <div className="ads-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slot</th>
                <th>Type</th>
                <th>Variant</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => {
                const slot = adSlots.find(s => s.id === ad.slot_id)
                const analytics = getAdAnalytics(ad.id)
                const ctr = analytics.ctr.toFixed(2)
                return (
                  <tr key={ad.id}>
                    <td className="ad-name">{ad.name}</td>
                    <td>{slot?.name || 'Unknown'}</td>
                    <td><span className="type-badge">{ad.ad_type}</span></td>
                    <td>{ad.ab_variant || '-'}</td>
                    <td>{analytics.totalImpressions.toLocaleString()}</td>
                    <td>{analytics.totalClicks.toLocaleString()}</td>
                    <td className={parseFloat(ctr) > 1 ? 'positive' : ''}>{ctr}%</td>
                    <td className="revenue">${analytics.totalRevenue.toFixed(2)}</td>
                    <td>
                      <button onClick={() => toggleAdStatus(ad.id, ad.is_active)} className={`status-toggle ${ad.is_active ? 'active' : 'inactive'}`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="actions">
                      <button onClick={() => {
                        setScheduleForm({ ad_id: ad.id, start_date: '', end_date: '' })
                        setShowScheduleModal(true)
                      }} className="schedule-btn">📅 Schedule</button>
                      <button onClick={() => {
                        setSelectedAd(ad)
                        setShowAnalyticsModal(true)
                      }} className="analytics-btn">📊 Analytics</button>
                      <button onClick={() => deleteAd(ad.id)} className="delete-btn">🗑️ Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ad Modal */}
      {showAdModal && (
        <div className="modal-overlay" onClick={() => setShowAdModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Ad</h2>
              <button className="close-btn" onClick={() => setShowAdModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Ad Name *</label>
                <input type="text" value={adForm.name} onChange={e => setAdForm({...adForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Ad Slot *</label>
                <select value={adForm.slot_id} onChange={e => setAdForm({...adForm, slot_id: e.target.value})}>
                  <option value="">Select slot</option>
                  {adSlots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Ad Code (HTML/JS) *</label>
                <textarea rows="5" value={adForm.code} onChange={e => setAdForm({...adForm, code: e.target.value})} placeholder="Google AdSense code or custom HTML" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ad Type</label>
                  <select value={adForm.ad_type} onChange={e => setAdForm({...adForm, ad_type: e.target.value})}>
                    <option value="programmatic">Programmatic</option>
                    <option value="direct">Direct Deal</option>
                  </select>
                </div>
                <div className="form-group">
                  {adForm.ad_type === 'direct' && (
                    <>
                      <label>Amount ($)</label>
                      <input type="number" step="0.01" value={adForm.direct_amount} onChange={e => setAdForm({...adForm, direct_amount: e.target.value})} />
                    </>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>A/B Variant</label>
                  <select value={adForm.ab_variant} onChange={e => setAdForm({...adForm, ab_variant: e.target.value})}>
                    <option value="">None</option>
                    <option value="A">Variant A</option>
                    <option value="B">Variant B</option>
                  </select>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input type="checkbox" checked={adForm.is_active} onChange={e => setAdForm({...adForm, is_active: e.target.checked})} />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAdModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={addAd} className="save-btn">Add Ad</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Ad Campaign</h2>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={scheduleForm.start_date} onChange={e => setScheduleForm({...scheduleForm, start_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={scheduleForm.end_date} onChange={e => setScheduleForm({...scheduleForm, end_date: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowScheduleModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={addSchedule} className="save-btn">Save Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation Modal */}
      {showRotationModal && (
        <div className="modal-overlay" onClick={() => setShowRotationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ad Rotation Settings</h2>
              <button className="close-btn" onClick={() => setShowRotationModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Select which ads to rotate for this slot:</p>
              {ads.filter(a => a.slot_id === rotationForm.ad_slot_id).map(ad => (
                <div key={ad.id} className="checkbox-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={rotationForm.ad_ids.includes(ad.id)} 
                      onChange={e => {
                        if (e.target.checked) {
                          setRotationForm({...rotationForm, ad_ids: [...rotationForm.ad_ids, ad.id]})
                        } else {
                          setRotationForm({...rotationForm, ad_ids: rotationForm.ad_ids.filter(id => id !== ad.id)})
                        }
                      }} 
                    /> 
                    {ad.name} ({ad.ad_type})
                  </label>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowRotationModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={updateRotation} className="save-btn">Save Rotation</button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedAd && (
        <div className="modal-overlay" onClick={() => setShowAnalyticsModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ad Analytics - {selectedAd.name}</h2>
              <button className="close-btn" onClick={() => setShowAnalyticsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="analytics-stats">
                <div className="analytics-card">
                  <div className="analytics-value">
                    {analyticsData.filter(a => a.ad_id === selectedAd.id).reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
                  </div>
                  <div className="analytics-label">Total Impressions</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-value">
                    {analyticsData.filter(a => a.ad_id === selectedAd.id).reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}
                  </div>
                  <div className="analytics-label">Total Clicks</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-value">
                    {(() => {
                      const impressions = analyticsData.filter(a => a.ad_id === selectedAd.id).reduce((sum, a) => sum + a.impressions, 0)
                      const clicks = analyticsData.filter(a => a.ad_id === selectedAd.id).reduce((sum, a) => sum + a.clicks, 0)
                      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
                      return ctr.toFixed(2) + '%'
                    })()}
                  </div>
                  <div className="analytics-label">CTR</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-value">
                    ${analyticsData.filter(a => a.ad_id === selectedAd.id).reduce((sum, a) => sum + a.revenue, 0).toFixed(2)}
                  </div>
                  <div className="analytics-label">Total Revenue</div>
                </div>
              </div>
              <div className="daily-breakdown">
                <h4>Daily Breakdown</h4>
                <div className="daily-table">
                  {analyticsData
                    .filter(a => a.ad_id === selectedAd.id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 30)
                    .map(a => (
                      <div key={a.id} className="daily-row">
                        <div>{new Date(a.date).toLocaleDateString()}</div>
                        <div>{a.impressions.toLocaleString()} imp</div>
                        <div>{a.clicks} clicks</div>
                        <div>${a.revenue.toFixed(2)}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ads-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem;
        }
        
        :global(body.dark) .ads-page {
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
          margin-bottom: 2rem;
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
          margin-bottom: 1rem;
        }
        
        .add-btn {
          padding: 0.6rem 1.25rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .slot-card {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
        }
        
        :global(body.dark) .slot-card {
          background: #1e293b;
        }
        
        .slot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .slot-header h3 {
          font-size: 1.1rem;
        }
        
        .slot-status {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .slot-status.active {
          background: #d1fae5;
          color: #065f46;
        }
        
        .slot-location {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        
        .slot-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          margin-bottom: 0.75rem;
        }
        
        .slot-floor {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .floor-input {
          width: 80px;
          padding: 0.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        
        .rotate-btn {
          width: 100%;
          padding: 0.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .ads-table-container {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        :global(body.dark) .ads-table-container {
          background: #1e293b;
        }
        
        .ads-table-container h3 {
          margin-bottom: 1rem;
        }
        
        .ads-table {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        th {
          font-weight: 600;
          color: #475569;
        }
        
        .ad-name {
          font-weight: 500;
        }
        
        .type-badge {
          padding: 0.2rem 0.5rem;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        
        .positive {
          color: #10b981;
          font-weight: 600;
        }
        
        .revenue {
          color: #10b981;
          font-weight: 600;
        }
        
        .status-toggle {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .status-toggle.active {
          background: #10b981;
          color: white;
        }
        
        .status-toggle.inactive {
          background: #ef4444;
          color: white;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .schedule-btn, .analytics-btn, .delete-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .schedule-btn {
          background: #f59e0b;
          color: white;
        }
        
        .analytics-btn {
          background: #3b82f6;
          color: white;
        }
        
        .delete-btn {
          background: #ef4444;
          color: white;
        }
        
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
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }
        
        .modal-content.large {
          max-width: 700px;
        }
        
        :global(body.dark) .modal-content {
          background: #1e293b;
        }
        
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
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .checkbox input {
          width: auto;
        }
        
        .checkbox-item {
          margin-bottom: 0.5rem;
        }
        
        .checkbox-item label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
        }
        
        .cancel-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .save-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .analytics-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .analytics-card {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
        }
        
        .analytics-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .analytics-label {
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .daily-table {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .daily-row {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .daily-row div:first-child {
          width: 100px;
        }
        
        .daily-row div:nth-child(2) {
          width: 120px;
        }
        
        .daily-row div:nth-child(3) {
          width: 80px;
        }
        
        @media (max-width: 768px) {
          .ads-page {
            padding: 1rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .analytics-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}