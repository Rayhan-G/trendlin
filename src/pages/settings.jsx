// src/pages/settings.jsx
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function SettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  
  // Email state
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      setBio(user.user_metadata?.bio || '');
    }
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showMessage('Please upload an image file', 'error');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showMessage('Image must be less than 2MB', 'error');
      return;
    }
    
    setSaving(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: reader.result }
        });
        if (error) throw error;
        setAvatarUrl(reader.result);
        showMessage('Avatar updated');
        refreshUser?.();
        setSaving(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showMessage(error.message || 'Upload failed', 'error');
      setSaving(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, bio }
      });
      if (error) throw error;
      showMessage('Profile updated');
      refreshUser?.();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateEmail = async () => {
    if (!newEmail || newEmail === email) {
      showMessage('Enter a new email address', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailPassword,
      });
      
      if (signInError) {
        showMessage('Current password is incorrect', 'error');
        setSaving(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      setShowEmailForm(false);
      setNewEmail('');
      setEmailPassword('');
      showMessage('Verification email sent! Check your inbox.');
      
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        showMessage('Current password is incorrect', 'error');
        setSaving(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password changed');
      
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordReset = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      showMessage('Reset email sent! Check your inbox.');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-medium mb-2">Sign in required</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to manage your settings</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }))}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
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
        <title>Settings</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Toast */}
        {message && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
            message.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
          }`}>
            {message.type === 'error' ? '⚠️ ' : '✓ '}{message.text}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your account</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <nav className="w-full md:w-48 flex md:flex-col gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition ${
                  activeTab === 'profile'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition ${
                  activeTab === 'security'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Security
              </button>
            </nav>

            {/* Main content */}
            <div className="flex-1 space-y-5">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  {/* Avatar */}
                  <div className="bg-white rounded-xl border p-5">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-xl font-medium">
                              {fullName ? fullName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border shadow-sm flex items-center justify-center text-xs hover:bg-gray-50"
                        >
                          📷
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Profile picture</p>
                        <p className="text-xs text-gray-500">JPG or PNG. Max 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-medium mb-4">Profile information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                          placeholder="Tell us about yourself"
                        />
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t flex justify-end">
                      <button
                        onClick={updateProfile}
                        disabled={saving}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-xl border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Email address</h3>
                      {!showEmailForm && (
                        <button
                          onClick={() => setShowEmailForm(true)}
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{email}</p>
                    
                    {showEmailForm && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="New email address"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <input
                          type="password"
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                          placeholder="Current password"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateEmail}
                            disabled={saving}
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setShowEmailForm(false);
                              setNewEmail('');
                              setEmailPassword('');
                            }}
                            className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <>
                  {/* Password */}
                  <div className="bg-white rounded-xl border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Last updated: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}</p>
                      </div>
                      {!showPasswordForm && (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    
                    {showPasswordForm && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password (min 8 characters)"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updatePassword}
                            disabled={saving}
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="pt-1">
                          <button
                            onClick={sendPasswordReset}
                            className="text-xs text-gray-500 hover:text-gray-900"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Session */}
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-medium mb-3">Active session</h3>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-sm">
                        💻
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Current device</p>
                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>

                  {/* Danger */}
                  <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-red-600">Delete account</h3>
                        <p className="text-xs text-red-500 mt-0.5">Permanently delete your account</p>
                      </div>
                      <button
                        onClick={() => showMessage('Contact support to delete your account', 'info')}
                        className="px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}