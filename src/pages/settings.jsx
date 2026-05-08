// src/pages/settings.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, password
  
  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCurrentPasswordField, setShowCurrentPasswordField] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.full_name || '');
    }
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Update Display Name
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });
      
      if (error) throw error;
      
      showMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change Email - requires current password verification
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail || newEmail === email) {
      showMessage('Please enter a new email address', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        showMessage('Current password is incorrect. Please try again.', 'error');
        setLoading(false);
        return;
      }
      
      // Update email
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      showMessage('Verification email sent! Please check your new email to confirm the change.', 'success');
      setNewEmail('');
      setCurrentPassword('');
      setIsChangingEmail(false);
      
    } catch (error) {
      console.error('Error changing email:', error);
      showMessage(error.message || 'Failed to change email', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Change Password - requires current password verification
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      showMessage('Please enter your current password', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      showMessage('New password must be at least 6 characters', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        showMessage('Current password is incorrect. Please try again.', 'error');
        setLoading(false);
        return;
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      showMessage('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPasswordField(false);
      
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password - Send reset email
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      showMessage('Password reset email sent! Check your inbox.', 'success');
      setShowForgotPassword(false);
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      showMessage(error.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-6">Please sign in to access your profile settings.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }))}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings • Edit Profile</title>
        <meta name="description" content="Manage your account settings" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your profile and security</p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔒 Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Your display name"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This name will be displayed on your profile
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              {/* Email Change Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Email Address</h3>
                
                {!isChangingEmail ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Current email: <span className="font-medium">{email}</span>
                    </p>
                    <button
                      onClick={() => setIsChangingEmail(true)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                      Change email →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangeEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="newemail@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Enter your current password"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        For security, please confirm your current password
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Update Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingEmail(false);
                          setNewEmail('');
                          setCurrentPassword('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Security / Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {!showCurrentPasswordField ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    You'll need to verify your current password to set a new one
                  </p>
                  <button
                    onClick={() => setShowCurrentPasswordField(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Continue →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCurrentPasswordField(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Forgot Password Modal */}
              {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-xl max-w-md w-full p-6">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🔑</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Forgot Password?</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        We'll send a password reset link to your email
                      </p>
                    </div>

                    {!resetEmailSent ? (
                      <form onSubmit={handleForgotPassword}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Reset link will be sent to: {email}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl">📧</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Password reset email sent! Check your inbox for the link.
                        </p>
                        <button
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetEmailSent(false);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}