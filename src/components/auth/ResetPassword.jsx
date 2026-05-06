// ============================================
// RESET PASSWORD WITH TOKEN VALIDATION (OPTIMIZED)
// ============================================
// FILE: src/components/auth/ResetPassword.jsx

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Validate token on component mount
  useEffect(() => {
    // Don't validate if token is undefined (router still loading)
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-token?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setTokenData(data);
        } else {
          setTokenValid(false);
          setError(data.error || 'Invalid or expired reset link');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setValidating(false);
      }
    };

    // Small delay to ensure token is fully loaded from URL
    const timer = setTimeout(validateToken, 100);
    return () => clearTimeout(timer);
  }, [token]);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const validatePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return false;
    }
    
    return true;
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setMessage('Password reset successful!');
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Validating your reset link...</p>
        </motion.div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to login</span>
          </Link>
          
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 text-sm mb-6">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <Link 
              href="/forgot-password" 
              className="inline-block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3 font-semibold text-center hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Request New Link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to login</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-white/80 text-sm">
              Create a new secure password for your account
            </p>
            {tokenData?.timeRemaining && (
              <p className="text-white/60 text-xs mt-2">
                This link expires in {tokenData.timeRemaining.minutes} minutes
                {tokenData.timeRemaining.seconds > 0 && ` and ${tokenData.timeRemaining.seconds} seconds`}
              </p>
            )}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className={`relative flex items-center transition-all duration-200 rounded-xl border ${
                        error && error.includes('password') ? 'border-red-300 bg-red-50/50' : 'border-gray-200 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10'
                      }`}>
                        <div className="absolute left-3 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (error) setError('');
                          }}
                          className="w-full pl-10 pr-12 py-3 bg-transparent rounded-xl outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                          placeholder={!isMobile ? "Min 8 characters, 1 uppercase, 1 number" : "Enter new password"}
                          required
                          disabled={loading}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {newPassword && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs ${getStrengthColor().replace('bg-', 'text-')}`}>
                            Password strength: {getStrengthText()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <div className={`relative flex items-center transition-all duration-200 rounded-xl border ${
                        error === 'Passwords do not match' ? 'border-red-300 bg-red-50/50' : 'border-gray-200 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10'
                      }`}>
                        <div className="absolute left-3 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (error) setError('');
                          }}
                          className="w-full pl-10 pr-12 py-3 bg-transparent rounded-xl outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                          placeholder="Confirm your new password"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-500 mb-1">Password requirements:</p>
                      <div className="space-y-0.5">
                        <Requirement met={newPassword.length >= 8} text="At least 8 characters" />
                        <Requirement met={/[A-Z]/.test(newPassword)} text="One uppercase letter" />
                        <Requirement met={/[0-9]/.test(newPassword)} text="One number" />
                      </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-red-500 flex items-center gap-1 bg-red-50 p-3 rounded-lg"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3 font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Password Reset Success!</h3>
                  <p className="text-gray-600 text-sm">
                    Your password has been successfully reset.
                    <br />
                    Redirecting you to login...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  </div>
                  <Link href="/login" className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                    Click here if not redirected →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// REQUIREMENT COMPONENT
// ============================================

function Requirement({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-gray-300" />
      )}
      <span className="text-xs">{text}</span>
    </div>
  );
}