// src/components/shared/StatsCard.jsx
export default function StatsCard({ icon, value, label, trend }) {
  const getTrendColor = () => {
    if (!trend) return ''
    if (trend > 0) return '#10b981'
    if (trend < 0) return '#ef4444'
    return '#6b7280'
  }

  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value || 0}</div>
        <div className="stat-label">{label}</div>
        {trend !== undefined && (
          <div style={{ fontSize: '11px', marginTop: '4px', color: getTrendColor() }}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <style jsx>{`
        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        :global(body.dark) .stat-card {
          background: #1e293b;
        }
        .stat-icon {
          font-size: 1.5rem;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }
        :global(body.dark) .stat-value {
          color: #f1f5f9;
        }
        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}