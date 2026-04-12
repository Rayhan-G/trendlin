// pages/admin/monetization.js - Revenue & Affiliate Management
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Monetization() {
  const [affiliateLinks, setAffiliateLinks] = useState([])
  const [ads, setAds] = useState([])
  const [revenue, setRevenue] = useState({
    total: 0,
    monthly: 0,
    bySource: {}
  })
  const [newLink, setNewLink] = useState({ name: '', url: '', clicks: 0 })

  useEffect(() => {
    fetchMonetizationData()
  }, [])

  const fetchMonetizationData = async () => {
    // Fetch affiliate links
    const { data: links } = await supabase.from('affiliate_links').select('*')
    setAffiliateLinks(links || [])
    
    // Fetch ad placements
    const { data: adData } = await supabase.from('ads').select('*')
    setAds(adData || [])
    
    // Calculate revenue
    const totalClicks = links?.reduce((sum, l) => sum + (l.clicks || 0), 0) || 0
    const estimatedRevenue = totalClicks * 0.05 // $0.05 per click average
    setRevenue({
      total: estimatedRevenue,
      monthly: estimatedRevenue * 0.3,
      bySource: {
        'Amazon': 245,
        'ShareASale': 189,
        'Direct': 67
      }
    })
  }

  const addAffiliateLink = async () => {
    if (!newLink.name || !newLink.url) return
    
    const { data, error } = await supabase
      .from('affiliate_links')
      .insert([newLink])
      .select()
    
    if (!error && data) {
      setAffiliateLinks([...affiliateLinks, data[0]])
      setNewLink({ name: '', url: '', clicks: 0 })
    }
  }

  const trackClick = async (id) => {
    const link = affiliateLinks.find(l => l.id === id)
    if (link) {
      await supabase
        .from('affiliate_links')
        .update({ clicks: (link.clicks || 0) + 1 })
        .eq('id', id)
      
      setAffiliateLinks(affiliateLinks.map(l => 
        l.id === id ? { ...l, clicks: (l.clicks || 0) + 1 } : l
      ))
    }
  }

  return (
    <div className="monetization">
      <div className="header">
        <h1>💰 Monetization Control</h1>
        <p>Manage affiliate links, ads, and track revenue</p>
      </div>

      {/* Revenue Dashboard */}
      <div className="revenue-dashboard">
        <div className="revenue-card">
          <h3>Total Revenue</h3>
          <div className="revenue-amount">${revenue.total.toFixed(2)}</div>
          <small>Lifetime earnings</small>
        </div>
        <div className="revenue-card">
          <h3>This Month</h3>
          <div className="revenue-amount">${revenue.monthly.toFixed(2)}</div>
          <small className="trend-up">↑ +12% from last month</small>
        </div>
        <div className="revenue-card">
          <h3>Total Clicks</h3>
          <div className="revenue-amount">
            {affiliateLinks.reduce((sum, l) => sum + (l.clicks || 0), 0)}
          </div>
          <small>Affiliate link clicks</small>
        </div>
      </div>

      {/* Revenue by Source */}
      <div className="dashboard-section">
        <h3>Revenue by Source</h3>
        <div className="source-list">
          {Object.entries(revenue.bySource).map(([source, amount]) => (
            <div key={source} className="source-item">
              <span>{source}</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${(amount / 500) * 100}%` }}></div>
              </div>
              <span>${amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate Links Management */}
      <div className="dashboard-section">
        <h3>🔗 Affiliate Links</h3>
        
        {/* Add New Link */}
        <div className="add-link-form">
          <input
            type="text"
            placeholder="Link Name (e.g., Best Headphones)"
            value={newLink.name}
            onChange={(e) => setNewLink({...newLink, name: e.target.value})}
          />
          <input
            type="url"
            placeholder="Affiliate URL"
            value={newLink.url}
            onChange={(e) => setNewLink({...newLink, url: e.target.value})}
          />
          <button onClick={addAffiliateLink}>Add Link</button>
        </div>

        {/* Links List */}
        <div className="links-table">
          <table>
            <thead>
              <tr><th>Name</th><th>URL</th><th>Clicks</th><th>Revenue</th><th>Action</th></tr>
            </thead>
            <tbody>
              {affiliateLinks.map(link => (
                <tr key={link.id}>
                  <td>{link.name}</td>
                  <td className="url-cell">{link.url.substring(0, 40)}...</td>
                  <td>{link.clicks || 0}</td>
                  <td>${((link.clicks || 0) * 0.05).toFixed(2)}</td>
                  <td>
                    <button onClick={() => trackClick(link.id)} className="track-btn">
                      Track Click
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad Management */}
      <div className="dashboard-section">
        <h3>📢 Ad Placements</h3>
        <div className="ad-grid">
          <div className="ad-card">
            <h4>Header Banner</h4>
            <p>728x90 - Top of page</p>
            <code>&lt;ins class="adsbygoogle"&gt;...&lt;/ins&gt;</code>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span>Active</span>
            </label>
          </div>
          <div className="ad-card">
            <h4>Sidebar Widget</h4>
            <p>300x250 - Right sidebar</p>
            <code>&lt;ins class="adsbygoogle"&gt;...&lt;/ins&gt;</code>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span>Active</span>
            </label>
          </div>
          <div className="ad-card">
            <h4>In-Content Ad</h4>
            <p>After 3rd paragraph</p>
            <code>&lt;ins class="adsbygoogle"&gt;...&lt;/ins&gt;</code>
            <label className="toggle">
              <input type="checkbox" />
              <span>Inactive</span>
            </label>
          </div>
        </div>
      </div>

      <style jsx>{`
        .monetization {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .header {
          margin-bottom: 2rem;
        }
        .revenue-dashboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .revenue-card {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 1.5rem;
          border-radius: 16px;
        }
        .revenue-amount {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        .dashboard-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .add-link-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .add-link-form input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .add-link-form button {
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .url-cell {
          font-family: monospace;
          font-size: 0.75rem;
          color: #666;
        }
        .track-btn {
          padding: 0.25rem 0.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .ad-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .ad-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
        }
        .ad-card code {
          display: block;
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          margin: 0.5rem 0;
          overflow-x: auto;
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          cursor: pointer;
        }
        .source-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress {
          height: 100%;
          background: #10b981;
          border-radius: 4px;
        }
        .trend-up {
          color: #10b981;
        }
      `}</style>
    </div>
  )
}