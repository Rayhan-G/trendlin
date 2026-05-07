// ============================================
// EMAIL VERIFICATION COMPONENT
// ============================================
// FILE: src/components/auth/EmailVerification.jsx

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Shield, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailVerification({ email, onVerified, onBack }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.match(/\d/g) || [];
    
    const newCode = [...code];
    digits.forEach((digit, idx) => {
      if (idx < 6) newCode[idx] = digit;
    });
    setCode(newCode);
    
    // Focus last filled input
    const lastFilledIndex = Math.min(digits.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Email verified successfully!');
        onVerified(email);
      } else {
        setError(data.error || 'Invalid verification code');
        toast.error(data.error || 'Invalid verification code');
        
        // Clear code on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('New verification code sent!');
        setCountdown(60);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.error || 'Failed to send code');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
        <p className="text-sm text-gray-500">
          We've sent a verification code to
          <br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {/* 6-Digit Code Input */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 flex items-center justify-center gap-1 bg-red-50 p-3 rounded-lg"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading || code.join('').length !== 6}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3 font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Verify Email</span>
          </>
        )}
      </button>

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Didn't receive the code?{' '}
          <button
            onClick={handleResendCode}
            disabled={resending || countdown > 0}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            {resending ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </p>
      </div>

      {/* Back to email */}
      <div className="text-center pt-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Use different email
        </button>
      </div>

      {/* Security Note */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          This code expires in 15 minutes
        </p>
      </div>
    </motion.div>
  );
}