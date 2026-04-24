// src/components/frontend/AuthModal.js
import React, { useState, useEffect, useRef } from 'react'

export default function AuthModal({ isOpen, mode: propMode, onClose, onLogin }) {
  const [mode, setMode] = useState(propMode || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Verification states
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [verificationId, setVerificationId] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  // Create refs for verification code inputs
  const inputRefs = useRef([])

  useEffect(() => {
    if (propMode) setMode(propMode)
  }, [propMode])

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRememberMe(false)
      setError('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setShowVerification(false)
      setVerificationCode(['', '', '', '', '', ''])
      setVerificationId('')
      setCountdown(0)
    }
  }, [isOpen])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && verificationId) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, verificationId])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  // Professional email validation
  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return { valid: false, message: 'Email address is required' }
    }
    
    const fakeDomains = [
      'tempmail.com', '10minutemail.com', 'throwaway.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'tempinbox.com', 'fakeinbox.com',
      'getairmail.com', 'mailnator.com', 'trashmail.com', 'dispostable.com',
      'temp-mail.org', 'tempemail.net', 'fake-mail.net', 'spambox.us',
      'mailtemp.net', 'tempinbox.co', 'tempmailaddress.com', 'throwawaymail.com'
    ]
    
    const emailDomain = email.split('@')[1]
    if (fakeDomains.includes(emailDomain?.toLowerCase())) {
      return { valid: false, message: 'Please use a real email address' }
    }
    
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Enter a valid email address' }
    }
    
    if (email.includes('..')) {
      return { valid: false, message: 'Email cannot contain consecutive dots' }
    }
    
    return { valid: true, message: '' }
  }

  const sendVerificationEmail = async (email) => {
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email')
      }

      return { success: true, verificationId: data.verificationId }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }
  }

  const verifyCode = async (email, code, verificationId) => {
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, verificationId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      return { success: true }
    } catch (error) {
      console.error('Verification error:', error)
      return { success: false, error: error.message }
    }
  }

  const handleSignup = async () => {
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.message)
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain an uppercase letter')
      return
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain a lowercase letter')
      return
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain a number')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    const result = await sendVerificationEmail(email)
    
    if (result.success) {
      setVerificationId(result.verificationId)
      setShowVerification(true)
      setCountdown(60)
      setCanResend(false)
      setError('')
    } else {
      setError(result.error || 'Failed to send verification email')
    }
    
    setLoading(false)
  }

  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    
    if (code.length !== 6) {
      setError('Enter the complete 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    const result = await verifyCode(email, code, verificationId)

    if (result.success) {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, emailVerified: true })
        })

        const data = await res.json()

        if (res.ok) {
          if (onLogin) onLogin(data.user)
          onClose()
        } else {
          setError(data.error || 'Signup failed')
        }
      } catch (err) {
        console.error('Network error:', err)
        setError('Network error. Please check your connection.')
      }
    } else {
      setError(result.error || 'Invalid verification code')
    }
    
    setLoading(false)
  }

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return
    
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const resendVerificationCode = async () => {
    if (!canResend) return
    
    setLoading(true)
    const result = await sendVerificationEmail(email)
    
    if (result.success) {
      setVerificationId(result.verificationId)
      setCountdown(60)
      setCanResend(false)
      setError('New code sent!')
      setTimeout(() => setError(''), 3000)
    } else {
      setError('Failed to resend code')
    }
    
    setLoading(false)
  }

  const handleLogin = async () => {
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.message)
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      })

      const data = await res.json()

      if (res.ok) {
        if (onLogin) onLogin(data.user)
        onClose()
      } else {
        if (data.error === 'Email not verified') {
          const result = await sendVerificationEmail(email)
          if (result.success) {
            setVerificationId(result.verificationId)
            setShowVerification(true)
            setCountdown(60)
            setError('Please verify your email. A code has been sent.')
          } else {
            setError('Failed to send verification code')
          }
        } else {
          setError(data.error || 'Invalid email or password')
        }
      }
    } catch (err) {
      console.error('Network error:', err)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (mode === 'login') {
      await handleLogin()
    } else {
      await handleSignup()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="logo-icon">{showVerification ? '✉️' : '📬'}</div>
          <h2>
            {showVerification 
              ? 'Verify email' 
              : mode === 'login' 
                ? 'Welcome back' 
                : 'Sign up'
            }
          </h2>
          {showVerification && (
            <p className="verification-subtitle">
              Code sent to <strong>{email}</strong>
            </p>
          )}
        </div>

        {!showVerification ? (
          <>
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
                type="button"
                disabled={loading}
              >
                Sign in
              </button>
              <button 
                className={`mode-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
                type="button"
                disabled={loading}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
              
              {/* Password field with show/hide */}
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="3" y1="3" x2="21" y2="21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {mode === 'signup' && (
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="3" y1="3" x2="21" y2="21" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              )}

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </>
        ) : (
          <div className="verification-container">
            <div className="code-inputs">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  disabled={loading}
                  className="code-digit"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              onClick={handleVerifyCode} 
              disabled={loading || verificationCode.join('').length !== 6}
              className="verify-btn"
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>

            <div className="resend-section">
              {canResend ? (
                <button onClick={resendVerificationCode} className="resend-btn">
                  Resend code
                </button>
              ) : (
                <p className="countdown-text">Resend in {countdown}s</p>
              )}
            </div>

            <button 
              onClick={() => {
                setShowVerification(false)
                setVerificationCode(['', '', '', '', '', ''])
                setError('')
              }}
              className="back-btn"
            >
              ← Back
            </button>
          </div>
        )}

        {!showVerification && mode === 'signup' && (
          <p className="terms-text">
            By signing up, you agree to our Terms
          </p>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          padding: 16px;
        }

        .modal-container {
          background: var(--modal-bg, #ffffff);
          border-radius: 24px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
          position: relative;
          animation: slideUp 0.2s ease;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border: var(--modal-border, none);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--close-btn-bg, #f1f5f9);
          border: none;
          font-size: 18px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--close-btn-color, #64748b);
          transition: all 0.2s;
        }

        .close-btn:active {
          transform: scale(0.95);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .logo-icon {
          font-size: 40px;
          margin-bottom: 8px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--title-color, #0f172a);
        }

        .verification-subtitle {
          font-size: 13px;
          color: var(--label-color, #64748b);
          margin-top: 6px;
        }

        .mode-toggle {
          display: flex;
          gap: 8px;
          background: var(--toggle-bg, #f1f5f9);
          padding: 4px;
          border-radius: 48px;
          margin-bottom: 20px;
        }

        .mode-btn {
          flex: 1;
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 40px;
          color: var(--toggle-btn-color, #64748b);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-btn.active {
          background: var(--toggle-active-bg, #ffffff);
          color: var(--toggle-active-color, #06b6d4);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        input {
          width: 100%;
          padding: 10px 14px;
          margin-bottom: 12px;
          border: 1.5px solid var(--input-border, #e2e8f0);
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s;
          box-sizing: border-box;
          background: var(--input-bg, #ffffff);
          color: var(--input-text, #0f172a);
        }

        input::placeholder {
          color: var(--placeholder-color, #94a3b8);
        }

        input:focus {
          outline: none;
          border-color: var(--input-focus, #06b6d4);
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.1);
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Password wrapper styles */
        .password-wrapper {
          position: relative;
          margin-bottom: 12px;
        }

        .password-wrapper input {
          margin-bottom: 0;
          padding-right: 40px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--placeholder-color, #94a3b8);
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: var(--input-focus, #06b6d4);
        }

        .password-toggle:active {
          transform: translateY(-50%) scale(0.95);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px 0;
          cursor: pointer;
          color: var(--label-color, #64748b);
          font-size: 13px;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          margin: 0;
          cursor: pointer;
        }

        .error-message {
          background: var(--error-bg, #fef2f2);
          color: var(--error-text, #ef4444);
          padding: 10px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 12px;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 10px;
          background: var(--submit-bg, #06b6d4);
          color: var(--submit-text, #ffffff);
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .terms-text {
          text-align: center;
          font-size: 11px;
          color: var(--benefits-color, #94a3b8);
          margin-top: 16px;
          line-height: 1.4;
        }

        /* Verification Styles */
        .verification-container {
          text-align: center;
        }

        .code-inputs {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .code-digit {
          width: 44px;
          height: 50px;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 0;
        }

        @media (max-width: 480px) {
          .code-digit {
            width: 40px;
            height: 46px;
            font-size: 18px;
          }
          
          .code-inputs {
            gap: 6px;
          }
        }

        .verify-btn {
          width: 100%;
          padding: 10px;
          background: var(--submit-bg, #06b6d4);
          color: var(--submit-text, #ffffff);
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        }

        .verify-btn:active {
          transform: scale(0.98);
        }

        .verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resend-section {
          margin-bottom: 12px;
        }

        .resend-btn {
          background: transparent;
          border: none;
          color: var(--input-focus, #06b6d4);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }

        .resend-btn:active {
          opacity: 0.7;
        }

        .countdown-text {
          color: var(--label-color, #64748b);
          font-size: 13px;
        }

        .back-btn {
          background: transparent;
          border: none;
          color: var(--label-color, #64748b);
          cursor: pointer;
          font-size: 13px;
          transition: color 0.2s;
        }

        .back-btn:active {
          opacity: 0.7;
        }

        /* Dark mode variables */
        :root {
          --modal-bg: #ffffff;
          --modal-border: none;
          --close-btn-bg: #f1f5f9;
          --close-btn-color: #64748b;
          --title-color: #0f172a;
          --toggle-bg: #f1f5f9;
          --toggle-btn-color: #64748b;
          --toggle-active-bg: #ffffff;
          --toggle-active-color: #06b6d4;
          --input-border: #e2e8f0;
          --input-bg: #ffffff;
          --input-text: #0f172a;
          --placeholder-color: #94a3b8;
          --input-focus: #06b6d4;
          --label-color: #64748b;
          --error-bg: #fef2f2;
          --error-text: #ef4444;
          --submit-bg: #06b6d4;
          --submit-text: #ffffff;
          --benefits-color: #94a3b8;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --modal-bg: #1e293b;
            --modal-border: 1px solid #334155;
            --close-btn-bg: #334155;
            --close-btn-color: #cbd5e1;
            --title-color: #f1f5f9;
            --toggle-bg: #0f172a;
            --toggle-btn-color: #94a3b8;
            --toggle-active-bg: #1e293b;
            --toggle-active-color: #06b6d4;
            --input-border: #334155;
            --input-bg: #0f172a;
            --input-text: #f1f5f9;
            --placeholder-color: #64748b;
            --input-focus: #06b6d4;
            --label-color: #94a3b8;
            --error-bg: #450a0a;
            --error-text: #f87171;
            --submit-bg: #06b6d4;
            --submit-text: #ffffff;
            --benefits-color: #94a3b8;
          }
        }

        :global(.dark) {
          --modal-bg: #1e293b;
          --modal-border: 1px solid #334155;
          --close-btn-bg: #334155;
          --close-btn-color: #cbd5e1;
          --title-color: #f1f5f9;
          --toggle-bg: #0f172a;
          --toggle-btn-color: #94a3b8;
          --toggle-active-bg: #1e293b;
          --toggle-active-color: #06b6d4;
          --input-border: #334155;
          --input-bg: #0f172a;
          --input-text: #f1f5f9;
          --placeholder-color: #64748b;
          --input-focus: #06b6d4;
          --label-color: #94a3b8;
          --error-bg: #450a0a;
          --error-text: #f87171;
          --submit-bg: #06b6d4;
          --submit-text: #ffffff;
          --benefits-color: #94a3b8;
        }
      `}</style>
    </div>
  )
}