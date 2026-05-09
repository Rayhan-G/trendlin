// src/components/frontend/NewsletterSubscribe/components/EmailManager.js
import { useState } from 'react'
import { useEmailVerification } from '../hooks/useEmailVerification'
import styles from '../styles/newsletter.module.css'

export default function EmailManager({ state, dispatch, userId }) {
  const [localNewEmail, setLocalNewEmail] = useState(state.newEmailInput)
  const { sendCode, verifyCodeAndUpdate, isSending, isVerifying } = useEmailVerification({
    dispatch,
    currentEmail: state.newsletterEmail,
    userId
  })

  const handleSendCode = async () => {
    const success = await sendCode(localNewEmail)
    if (success) {
      setLocalNewEmail('')
    }
  }

  const handleVerify = async () => {
    const success = await verifyCodeAndUpdate(
      state.verificationCode,
      state.verificationId,
      state.pendingNewEmail
    )
    if (success) {
      // Clear local state
      setLocalNewEmail('')
    }
  }

  if (state.showVerificationModal) {
    return (
      <div className={styles.manageCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <h4>Verify New Email</h4>
          </div>
        </div>
        
        <div className={styles.verificationSection}>
          <button 
            onClick={() => dispatch({ type: 'RESET_EMAIL_STATE' })}
            className={styles.backBtn}
          >
            ← Back
          </button>
          
          <div className={styles.verificationEmailDisplay}>
            {state.pendingNewEmail}
          </div>
          
          <div className={styles.codeInputGroup}>
            <input 
              type="text" 
              maxLength="6"
              value={state.verificationCode} 
              onChange={(e) => dispatch({ type: 'SET_VERIFICATION_CODE', payload: e.target.value.replace(/\D/g, '') })} 
              placeholder="Enter 6-digit code"
              className={styles.codeInput}
              disabled={isVerifying}
              autoFocus
            />
            <button 
              onClick={handleVerify} 
              disabled={isVerifying || state.verificationCode.length !== 6}
              className={styles.verifyBtn}
            >
              {isVerifying ? <span className={styles.spinnerSmall}></span> : 'Verify & Update'}
            </button>
          </div>
          
          <div className={styles.resendSection}>
            <button 
              onClick={() => sendCode(state.pendingNewEmail)}
              disabled={isSending}
              className={styles.resendBtn}
            >
              Resend code
            </button>
            <span className={styles.expiryNote}>Code expires in 10 minutes</span>
          </div>
          
          {state.emailError && <p className={styles.errorMsg}>{state.emailError}</p>}
          
          <p className={styles.devNote}>
            💡 Check your console for the verification code (development mode only)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.manageCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <h4>Newsletter Delivery Email</h4>
        </div>
      </div>
      
      <div className={styles.emailSection}>
        <div className={styles.currentEmail}>
          <label>Current delivery email</label>
          <div className={styles.emailDisplay}>
            <span className={styles.emailValue}>{state.newsletterEmail}</span>
          </div>
        </div>
        
        <div className={styles.accountNote}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Your account email (<strong>{state.accountEmail}</strong>) remains unchanged. This only changes where you receive newsletter deliveries.</span>
        </div>
        
        <div className={styles.emailChangeForm}>
          <label>New delivery email address</label>
          <div className={styles.emailInputGroup}>
            <input 
              type="email" 
              value={localNewEmail} 
              onChange={(e) => setLocalNewEmail(e.target.value)} 
              placeholder="Enter new email for newsletter delivery"
              className={styles.emailInput}
              disabled={isSending}
            />
            <button 
              onClick={handleSendCode} 
              disabled={isSending || !localNewEmail || localNewEmail === state.newsletterEmail}
              className={styles.updateEmailBtn}
            >
              {isSending ? <span className={styles.spinnerSmall}></span> : 'Send Verification'}
            </button>
          </div>
          {state.emailError && <p className={styles.errorMsg}>{state.emailError}</p>}
        </div>
      </div>
    </div>
  )
}