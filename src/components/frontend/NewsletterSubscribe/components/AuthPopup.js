// src/components/frontend/NewsletterSubscribe/components/AuthPopup.js
import { useEffect } from 'react'
import styles from '../styles/newsletter.module.css'

export default function AuthPopup({ onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const openSignup = () => {
    onClose()
    window.dispatchEvent(new CustomEvent('openAuth', { detail: 'signup' }))
  }

  return (
    <div className={styles.authPopup}>
      <div className={styles.authPopupContent}>
        <div className={styles.popupIcon}>📬</div>
        <h4>Create a free account</h4>
        <p>Subscribe to our weekly newsletter</p>
        <div className={styles.popupActions}>
          <button onClick={openSignup} className={styles.signupBtn}>Sign up free →</button>
          <button onClick={onClose} className={styles.laterBtn}>Later</button>
        </div>
        <button onClick={onClose} className={styles.closeBtn}>✕</button>
      </div>
    </div>
  )
}