// src/components/frontend/NewsletterSubscribe/components/SuccessModal.js
import styles from '../styles/newsletter.module.css'

export default function SuccessModal({ onClose, email }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.successIcon}>✅</div>
        <h3>Successfully Subscribed!</h3>
        <p>Newsletters will be sent to:</p>
        <p className={styles.emailHighlight}>{email}</p>
        <button onClick={onClose}>
          Got it, thanks →
        </button>
      </div>
    </div>
  )
}