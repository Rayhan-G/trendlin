// src/components/frontend/NewsletterSubscribe/components/LoadingSkeleton.js
import styles from '../styles/newsletter.module.css'

export default function LoadingSkeleton({ variant = 'default' }) {
  return (
    <div className={`${styles.loadingPlaceholder} ${variant === 'footer' ? styles.footer : ''}`}>
      <div className={styles.skeletonSpinner}></div>
      <style jsx>{`
        .${styles.loadingPlaceholder} {
          background: ${variant === 'footer' ? '#f9fafb' : '#ffffff'};
          border-radius: ${variant === 'footer' ? '20px' : '24px'};
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: ${variant === 'footer' ? '120px' : '200px'};
          border: 1px solid #e5e7eb;
        }
        :global(.dark) .${styles.loadingPlaceholder} {
          background: ${variant === 'footer' ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'};
          border-color: #1f1f2a;
        }
        .${styles.skeletonSpinner} {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        :global(.dark) .${styles.skeletonSpinner} {
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #06b6d4;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}