// src/components/shared/EmptyState.jsx
export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || '📭'}</div>
      <h3>{title || 'No data found'}</h3>
      <p>{message || 'Create your first item to get started'}</p>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          background: white;
          border-radius: 20px;
          margin: 2rem auto;
          max-width: 400px;
        }
        :global(body.dark) .empty-state {
          background: #1e293b;
        }
        .empty-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .empty-state p {
          color: #64748b;
          font-size: 0.85rem;
        }
        .btn-primary {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  )
}