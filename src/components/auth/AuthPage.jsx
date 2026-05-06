// ============================================
// COMPLETE AUTH PAGE - ALL FEATURES PRESERVED
// ============================================
// FILE: src/components/auth/AuthPage.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, 
  Apple, Github, Chrome, Shield, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmailVerification from './EmailVerification';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState('auth'); // 'auth' or 'verify'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (mode === 'signup' && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'signup') {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter';
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain a number';
      }
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrors({ email: 'Email and password are required' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password, 
          rememberMe 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Welcome back!');
        
        if (data.user?.is_admin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        if (data.error?.includes('verify') || data.error?.includes('verified')) {
          setPendingData({ email: formData.email });
          setStep('verify');
          toast.info('Please verify your email first');
        } else {
          setErrors({ general: data.error || 'Invalid email or password' });
          toast.error(data.error || 'Login failed');
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup - send verification first
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setPendingData({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        });
        setStep('verify');
        toast.success('Verification code sent! Check your email.');
      } else {
        setErrors({ general: data.error || 'Failed to send verification' });
        toast.error(data.error || 'Failed to send verification');
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // After verification success - create the account
  const handleVerified = async (verifiedEmail) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: pendingData.fullName,
          email: verifiedEmail,
          password: pendingData.password,
          emailVerified: true
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to create account');
        setStep('auth');
      }
    } catch (error) {
      toast.error('Failed to create account');
      setStep('auth');
    } finally {
      setLoading(false);
    }
  };

  // Handle back to auth form
  const handleBackToAuth = () => {
    setStep('auth');
    setPendingData(null);
    setErrors({});
  };

  // Social login handlers
  const handleSocialLogin = (provider) => {
    toast.loading(`Redirecting to ${provider}...`);
    setTimeout(() => {
      window.location.href = `/api/auth/${provider.toLowerCase()}`;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="grid lg:grid-cols-2 min-h-screen">
        
        {/* ============================================ */}
        {/* LEFT SIDE - BRAND EXPERIENCE (FULL FEATURES) */}
        {/* ============================================ */}
        <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
          {/* Abstract Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400 rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Readora</span>
            </div>

            {/* Main Content - Animated */}
            <div className="max-w-md mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-white/20 to-white/5 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl font-bold text-white mb-4"
              >
                Your Premium Content Library
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/80 text-lg mb-8"
              >
                Join thousands of creators and readers discovering exceptional content daily
              </motion.p>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-3"
              >
                {['Save unlimited bookmarks', 'Advanced organization tools', 'AI-powered recommendations'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 text-white/60 text-xs">
              <span>🔒 256-bit SSL</span>
              <span>⭐ Trusted by 50k+ users</span>
              <span>🌍 GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* RIGHT SIDE - AUTHENTICATION CARD (FULL) */}
        {/* ============================================ */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Readora
                </span>
              </div>
            </div>

            {/* Auth Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 md:p-10">
              <AnimatePresence mode="wait">
                {step === 'auth' ? (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {mode === 'login' ? 'Welcome back' : 'Create an account'}
                      </h1>
                      <p className="text-gray-500">
                        {mode === 'login' 
                          ? "Enter your credentials to access your account" 
                          : "Start your journey with Readora today"}
                      </p>
                    </div>

                    {/* Social Buttons - ALL THREE */}
                    <div className="space-y-3 mb-6">
                      <SocialButton
                        icon={<Chrome className="w-5 h-5" />}
                        text="Continue with Google"
                        onClick={() => handleSocialLogin('Google')}
                      />
                      <SocialButton
                        icon={<Apple className="w-5 h-5" />}
                        text="Continue with Apple"
                        onClick={() => handleSocialLogin('Apple')}
                      />
                      <SocialButton
                        icon={<Github className="w-5 h-5" />}
                        text="Continue with GitHub"
                        onClick={() => handleSocialLogin('GitHub')}
                      />
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or continue with email</span>
                      </div>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 text-center">{errors.general}</p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={mode === 'login' ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
                      {/* Full Name - Signup only */}
                      <AnimatePresence>
                        {mode === 'signup' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <InputField
                              icon={<User className="w-5 h-5" />}
                              type="text"
                              name="fullName"
                              placeholder="Full name"
                              value={formData.fullName}
                              onChange={handleChange}
                              error={errors.fullName}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Email */}
                      <InputField
                        icon={<Mail className="w-5 h-5" />}
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                      />

                      {/* Password with toggle */}
                      <InputField
                        icon={<Lock className="w-5 h-5" />}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        showToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                      />

                      {/* Confirm Password - Signup only */}
                      <AnimatePresence>
                        {mode === 'signup' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <InputField
                              icon={<Lock className="w-5 h-5" />}
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              placeholder="Confirm password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              error={errors.confirmPassword}
                              showToggle
                              showPassword={showConfirmPassword}
                              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Login extras - Remember me & Forgot password */}
                      {mode === 'login' && (
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Remember me</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => router.push('/forgot-password')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      {/* Submit Button with loading state */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-3 font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Switch Mode Link */}
                    <div className="text-center mt-6">
                      <p className="text-sm text-gray-600">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                          onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setErrors({});
                            setFormData({
                              fullName: '',
                              email: '',
                              password: '',
                              confirmPassword: ''
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                      </p>
                    </div>

                    {/* Terms & Privacy */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        By continuing, you agree to our{' '}
                        <a href="/terms" className="text-gray-500 hover:text-gray-700">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy Policy</a>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <EmailVerification
                      email={pendingData?.email}
                      onVerified={handleVerified}
                      onBack={handleBackToAuth}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SOCIAL BUTTON COMPONENT
// ============================================

function SocialButton({ icon, text, onClick, bgColor = "hover:bg-gray-50" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 transition-all duration-200 ${bgColor} hover:border-gray-300 hover:shadow-md`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

// ============================================
// INPUT FIELD COMPONENT (FULL FEATURES)
// ============================================

function InputField({ 
  icon, 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  error,
  showToggle = false,
  showPassword = false,
  onTogglePassword
}) {
  return (
    <div className="space-y-1">
      <div className={`relative flex items-center transition-all duration-200 rounded-xl border ${error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10'}`}>
        <div className="absolute left-3 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-12 py-3 bg-transparent rosunded-xl outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}