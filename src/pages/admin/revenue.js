import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function RevenueTracker() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [revenueEntries, setRevenueEntries] = useState([])
  const [goals, setGoals] = useState([])
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [posts, setPosts] = useState([])
  const [affiliateLinks, setAffiliateLinks] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [calculatorInput, setCalculatorInput] = useState({ additionalViews: 0, rpm: 5 })
  
  const [entryForm, setEntryForm] = useState({
    source: 'ad_revenue',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    post_id: '',
    affiliate_link_id: '',
    note: ''
  })
  
  const [goalForm, setGoalForm] = useState({
    month: selectedMonth,
    year: selectedYear,
    goal_amount: ''
  })

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [selectedMonth, selectedYear])

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
    
    // Fetch revenue entries for selected month
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`
    
    const { data: entries } = await supabase
      .from('revenue_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    // Fetch posts for dropdown
    const { data: allPosts } = await supabase
      .from('posts')
      .select('id, title, category')
      .order('created_at', { ascending: false })
    
    // Fetch affiliate links for dropdown
    const { data: links } = await supabase
      .from('affiliate_links')
      .select('id, name')
      .eq('is_active', true)
    
    // Fetch goals
    const { data: allGoals } = await supabase
      .from('revenue_goals')
      .select('*')
      .eq('year', selectedYear)
    
    setRevenueEntries(entries || [])
    setPosts(allPosts || [])
    setAffiliateLinks(links || [])
    setGoals(allGoals || [])
    setLoading(false)
  }

  const addRevenueEntry = async () => {
    if (!entryForm.amount || parseFloat(entryForm.amount) <= 0) {
      showToast('Please enter a valid amount', 'error')
      return
    }
    
    const { error } = await supabase.from('revenue_entries').insert([{
      source: entryForm.source,
      amount: parseFloat(entryForm.amount),
      post_id: entryForm.post_id || null,
      affiliate_link_id: entryForm.affiliate_link_id || null,
      date: entryForm.date,
      note: entryForm.note,
      created_at: new Date().toISOString()
    }])
    
    if (error) {
      showToast('Error adding revenue entry', 'error')
    } else {
      showToast('Revenue entry added successfully')
      await fetchData()
      setShowEntryModal(false)
      setEntryForm({
        source: 'ad_revenue',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        post_id: '',
        affiliate_link_id: '',
        note: ''
      })
    }
  }

  const setGoal = async () => {
    if (!goalForm.goal_amount || parseFloat(goalForm.goal_amount) <= 0) {
      showToast('Please enter a valid goal amount', 'error')
      return
    }
    
    const existing = goals.find(g => g.month === goalForm.month && g.year === goalForm.year)
    
    if (existing) {
      const { error } = await supabase
        .from('revenue_goals')
        .update({ goal_amount: parseFloat(goalForm.goal_amount), updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      
      if (error) {
        showToast('Error updating goal', 'error')
      } else {
        showToast('Goal updated successfully')
        await fetchData()
        setShowGoalModal(false)
      }
    } else {
      const { error } = await supabase.from('revenue_goals').insert([{
        month: goalForm.month,
        year: goalForm.year,
        goal_amount: parseFloat(goalForm.goal_amount),
        created_at: new Date().toISOString()
      }])
      
      if (error) {
        showToast('Error setting goal', 'error')
      } else {
        showToast('Goal set successfully')
        await fetchData()
        setShowGoalModal(false)
      }
    }
  }

  // Calculate real metrics
  const totalRevenue = revenueEntries.reduce((sum, e) => sum + e.amount, 0)
  
  const revenueBySource = {
    ad_revenue: revenueEntries.filter(e => e.source === 'ad_revenue').reduce((sum, e) => sum + e.amount, 0),
    affiliate_revenue: revenueEntries.filter(e => e.source === 'affiliate_revenue').reduce((sum, e) => sum + e.amount, 0),
    sponsored: revenueEntries.filter(e => e.source === 'sponsored').reduce((sum, e) => sum + e.amount, 0),
    digital_products: revenueEntries.filter(e => e.source === 'digital_products').reduce((sum, e) => sum + e.amount, 0),
    memberships: revenueEntries.filter(e => e.source === 'memberships').reduce((sum, e) => sum + e.amount, 0)
  }
  
  const revenueByPost = {}
  revenueEntries.forEach(entry => {
    if (entry.post_id) {
      const post = posts.find(p => p.id === entry.post_id)
      if (post) {
        if (!revenueByPost[post.title]) revenueByPost[post.title] = 0
        revenueByPost[post.title] += entry.amount
      }
    }
  })
  const topPosts = Object.entries(revenueByPost)
    .map(([title, revenue]) => ({ title, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  
  const revenueByCategory = {}
  revenueEntries.forEach(entry => {
    if (entry.post_id) {
      const post = posts.find(p => p.id === entry.post_id)
      if (post && post.category) {
        if (!revenueByCategory[post.category]) revenueByCategory[post.category] = 0
        revenueByCategory[post.category] += entry.amount
      }
    }
  })
  
  // Daily revenue for chart
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const dailyRevenue = {}
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    dailyRevenue[dateStr] = revenueEntries.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0)
  }
  
  const currentGoal = goals.find(g => g.month === selectedMonth && g.year === selectedYear)
  const goalAmount = currentGoal?.goal_amount || 0
  const progress = goalAmount > 0 ? (totalRevenue / goalAmount) * 100 : 0
  
  // Calculate projected month end based on current pace
  const daysPassed = new Date().getDate()
  const avgDailyRevenue = daysPassed > 0 ? totalRevenue / daysPassed : 0
  const projectedEnd = avgDailyRevenue * daysInMonth
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748b' } }
    }
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
    <div className="revenue-page">
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-left">
          <h1>Revenue Tracker</h1>
          <p>Track earnings, set goals, and analyze performance</p>
        </div>
        <div className="header-right">
          <button onClick={() => setShowCalculator(true)} className="calc-btn">📊 What-If Calculator</button>
          <button onClick={() => setShowGoalModal(true)} className="goal-btn">🎯 Set Goal</button>
          <button onClick={() => setShowEntryModal(true)} className="add-btn">+ Add Revenue</button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="month-selector">
        <button onClick={() => {
          let newMonth = selectedMonth - 1
          let newYear = selectedYear
          if (newMonth < 1) { newMonth = 12; newYear-- }
          setSelectedMonth(newMonth)
          setSelectedYear(newYear)
        }}>←</button>
        <h2>{new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}</h2>
        <button onClick={() => {
          let newMonth = selectedMonth + 1
          let newYear = selectedYear
          if (newMonth > 12) { newMonth = 1; newYear++ }
          setSelectedMonth(newMonth)
          setSelectedYear(newYear)
        }}>→</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">${goalAmount.toFixed(2)}</div>
            <div className="stat-label">Monthly Goal</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">{progress.toFixed(1)}%</div>
            <div className="stat-label">Progress to Goal</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-info">
            <div className="stat-value">${projectedEnd.toFixed(2)}</div>
            <div className="stat-label">Projected Month End</div>
          </div>
        </div>
      </div>

      {/* Revenue by Source */}
      <div className="sources-section">
        <h3>Revenue by Source</h3>
        <div className="sources-grid">
          <div className="source-card"><span>📢 Ad Revenue</span><strong>${revenueBySource.ad_revenue.toFixed(2)}</strong></div>
          <div className="source-card"><span>🔗 Affiliate</span><strong>${revenueBySource.affiliate_revenue.toFixed(2)}</strong></div>
          <div className="source-card"><span>🤝 Sponsored</span><strong>${revenueBySource.sponsored.toFixed(2)}</strong></div>
          <div className="source-card"><span>💻 Digital Products</span><strong>${revenueBySource.digital_products.toFixed(2)}</strong></div>
          <div className="source-card"><span>👥 Memberships</span><strong>${revenueBySource.memberships.toFixed(2)}</strong></div>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="chart-card">
        <h3>Daily Revenue - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })}</h3>
        <div className="chart-container">
          <Line
            data={{
              labels: Object.keys(dailyRevenue).map(d => d.split('-')[2]),
              datasets: [{ label: 'Revenue ($)', data: Object.values(dailyRevenue), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 }]
            }}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Top Posts & Category Performance */}
      <div className="two-columns">
        <div className="top-posts">
          <h3>🏆 Top Earning Posts</h3>
          {topPosts.length === 0 ? <div className="empty">No data yet</div> : (
            topPosts.map((post, i) => (
              <div key={i} className="post-item"><div className="post-rank">{i + 1}</div><div className="post-name">{post.title}</div><div className="post-revenue">${post.revenue.toFixed(2)}</div></div>
            ))
          )}
        </div>
        <div className="category-performance">
          <h3>📁 Revenue by Category</h3>
          {Object.keys(revenueByCategory).length === 0 ? <div className="empty">No data yet</div> : (
            Object.entries(revenueByCategory).sort((a, b) => b[1] - a[1]).map(([cat, rev]) => (
              <div key={cat} className="category-item"><div className="cat-name">{cat}</div><div className="cat-revenue">${rev.toFixed(2)}</div><div className="cat-percent">{((rev / totalRevenue) * 100).toFixed(1)}%</div></div>
            ))
          )}
        </div>
      </div>

      {/* Recent Revenue Entries */}
      <div className="entries-section">
        <h3>Recent Revenue Entries</h3>
        <div className="entries-table">
          {revenueEntries.length === 0 ? <div className="empty">No entries yet</div> : (
            revenueEntries.slice(-10).reverse().map(entry => (
              <div key={entry.id} className="entry-row">
                <div className="entry-date">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="entry-source">{entry.source.replace('_', ' ').toUpperCase()}</div>
                <div className="entry-amount">${entry.amount.toFixed(2)}</div>
                <div className="entry-note">{entry.note || '-'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Revenue Modal */}
      {showEntryModal && (
        <div className="modal-overlay" onClick={() => setShowEntryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Revenue Entry</h2><button className="close-btn" onClick={() => setShowEntryModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Source</label><select value={entryForm.source} onChange={e => setEntryForm({...entryForm, source: e.target.value})}><option value="ad_revenue">Ad Revenue</option><option value="affiliate_revenue">Affiliate Revenue</option><option value="sponsored">Sponsored Post</option><option value="digital_products">Digital Product</option><option value="memberships">Membership</option></select></div>
              <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={entryForm.amount} onChange={e => setEntryForm({...entryForm, amount: e.target.value})} /></div>
              <div className="form-group"><label>Date</label><input type="date" value={entryForm.date} onChange={e => setEntryForm({...entryForm, date: e.target.value})} /></div>
              <div className="form-group"><label>Associated Post (optional)</label><select value={entryForm.post_id} onChange={e => setEntryForm({...entryForm, post_id: e.target.value})}><option value="">None</option>{posts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
              <div className="form-group"><label>Note (optional)</label><input type="text" value={entryForm.note} onChange={e => setEntryForm({...entryForm, note: e.target.value})} placeholder="e.g., Mediavine payment" /></div>
            </div>
            <div className="modal-footer"><button onClick={() => setShowEntryModal(false)} className="cancel-btn">Cancel</button><button onClick={addRevenueEntry} className="save-btn">Add Entry</button></div>
          </div>
        </div>
      )}

      {/* Set Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Set Monthly Revenue Goal</h2><button className="close-btn" onClick={() => setShowGoalModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-row"><div className="form-group"><label>Month</label><select value={goalForm.month} onChange={e => setGoalForm({...goalForm, month: parseInt(e.target.value)})}>{Array(12).fill().map((_, i) => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>)}</select></div><div className="form-group"><label>Year</label><input type="number" value={goalForm.year} onChange={e => setGoalForm({...goalForm, year: parseInt(e.target.value)})} /></div></div>
              <div className="form-group"><label>Goal Amount ($)</label><input type="number" step="100" value={goalForm.goal_amount} onChange={e => setGoalForm({...goalForm, goal_amount: e.target.value})} placeholder="e.g., 5000" /></div>
            </div>
            <div className="modal-footer"><button onClick={() => setShowGoalModal(false)} className="cancel-btn">Cancel</button><button onClick={setGoal} className="save-btn">Save Goal</button></div>
          </div>
        </div>
      )}

      {/* What-If Calculator Modal */}
      {showCalculator && (
        <div className="modal-overlay" onClick={() => setShowCalculator(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>What-If Calculator</h2><button className="close-btn" onClick={() => setShowCalculator(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Additional Views</label><input type="number" value={calculatorInput.additionalViews} onChange={e => setCalculatorInput({...calculatorInput, additionalViews: parseInt(e.target.value) || 0})} /></div>
              <div className="form-group"><label>RPM (Revenue per 1000 views)</label><input type="number" step="0.5" value={calculatorInput.rpm} onChange={e => setCalculatorInput({...calculatorInput, rpm: parseFloat(e.target.value) || 0})} /><small>Average RPM from your current data: ${(totalRevenue / (revenueEntries.length * 1000) || 5).toFixed(2)}</small></div>
              <div className="calculator-result">
                <div className="result-item"><span>Additional Revenue:</span><strong>${((calculatorInput.additionalViews / 1000) * calculatorInput.rpm).toFixed(2)}</strong></div>
                <div className="result-item"><span>Projected Total:</span><strong>${(totalRevenue + (calculatorInput.additionalViews / 1000) * calculatorInput.rpm).toFixed(2)}</strong></div>
              </div>
            </div>
            <div className="modal-footer"><button onClick={() => setShowCalculator(false)} className="close-modal-btn">Close</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .revenue-page { min-height: 100vh; background: #f8fafc; padding: 2rem; }
        :global(body.dark) .revenue-page { background: #0f172a; }
        
        .toast { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; background: white; border-radius: 12px; z-index: 1100; }
        .toast-error { border-left: 4px solid #ef4444; }
        .toast-success { border-left: 4px solid #10b981; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; }
        :global(body.dark) .page-header h1 { color: #f1f5f9; }
        .page-header p { color: #64748b; }
        
        .header-right { display: flex; gap: 0.75rem; }
        .calc-btn, .goal-btn, .add-btn { padding: 0.6rem 1.25rem; border: none; border-radius: 10px; cursor: pointer; }
        .calc-btn { background: #8b5cf6; color: white; }
        .goal-btn { background: #f59e0b; color: white; }
        .add-btn { background: #10b981; color: white; }
        
        .month-selector { display: flex; justify-content: center; align-items: center; gap: 2rem; margin-bottom: 2rem; }
        .month-selector button { padding: 0.5rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
        .month-selector h2 { font-size: 1.25rem; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; }
        :global(body.dark) .stat-card { background: #1e293b; }
        .stat-icon { font-size: 2rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }
        .stat-label { font-size: 0.75rem; color: #64748b; }
        .progress-bar { width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 0.5rem; overflow: hidden; }
        .progress-fill { height: 100%; background: #10b981; border-radius: 2px; transition: width 0.3s; }
        
        .sources-section { background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
        :global(body.dark) .sources-section { background: #1e293b; }
        .sources-section h3 { margin-bottom: 1rem; }
        .sources-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
        .source-card { display: flex; justify-content: space-between; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
        :global(body.dark) .source-card { background: #0f172a; }
        
        .chart-card { background: white; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
        :global(body.dark) .chart-card { background: #1e293b; }
        .chart-container { height: 300px; }
        
        .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .top-posts, .category-performance { background: white; border-radius: 16px; padding: 1.5rem; }
        :global(body.dark) .top-posts, :global(body.dark) .category-performance { background: #1e293b; }
        .top-posts h3, .category-performance h3 { margin-bottom: 1rem; }
        
        .post-item, .category-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        .post-rank { width: 32px; height: 32px; background: #667eea; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .post-name { flex: 1; }
        .post-revenue, .cat-revenue { font-weight: 600; color: #10b981; }
        .cat-percent { color: #64748b; font-size: 0.8rem; width: 60px; text-align: right; }
        .cat-name { flex: 1; text-transform: capitalize; }
        
        .entries-section { background: white; border-radius: 16px; padding: 1.5rem; }
        :global(body.dark) .entries-section { background: #1e293b; }
        .entries-section h3 { margin-bottom: 1rem; }
        .entry-row { display: flex; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        .entry-date { width: 100px; }
        .entry-source { width: 150px; text-transform: capitalize; }
        .entry-amount { width: 100px; font-weight: 600; color: #10b981; }
        .entry-note { flex: 1; color: #64748b; }
        
        .empty { text-align: center; padding: 2rem; color: #64748b; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: white; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow: auto; }
        :global(body.dark) .modal-content { background: #1e293b; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .modal-body { padding: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
        .form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 8px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; }
        .cancel-btn, .save-btn, .close-modal-btn { padding: 0.5rem 1rem; border: none; border-radius: 8px; cursor: pointer; }
        .cancel-btn { background: #ef4444; color: white; }
        .save-btn { background: #10b981; color: white; }
        .close-modal-btn { background: #3b82f6; color: white; }
        
        .calculator-result { background: #f8fafc; border-radius: 12px; padding: 1rem; margin-top: 1rem; }
        .result-item { display: flex; justify-content: space-between; padding: 0.5rem 0; }
        
        @media (max-width: 768px) {
          .revenue-page { padding: 1rem; }
          .two-columns { grid-template-columns: 1fr; }
          .header-right { flex-wrap: wrap; }
          .entry-row { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  )
}