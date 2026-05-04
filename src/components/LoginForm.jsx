// components/LoginForm.jsx
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)

  const sendCode = async () => {
    setLoading(true)
    const res = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    if (res.ok) {
      setStep('code')
    } else {
      const data = await res.json()
      alert(data.error)
    }
    setLoading(false)
  }

  const verifyCode = async () => {
    setLoading(true)
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    })
    
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('session', JSON.stringify(data.session))
      window.location.href = '/dashboard'
    } else {
      alert(data.error)
    }
    setLoading(false)
  }

  return (
    <div>
      {step === 'email' ? (
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      ) : (
        <input 
          type="text" 
          value={code} 
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
        />
      )}
      
      <button onClick={step === 'email' ? sendCode : verifyCode} disabled={loading}>
        {loading ? 'Processing...' : step === 'email' ? 'Send Code' : 'Verify'}
      </button>
    </div>
  )
}