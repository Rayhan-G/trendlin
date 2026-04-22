// pages/newsletter/manage.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

export default function ManageSubscription() {
  const router = useRouter();
  const { token, email } = router.query;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscriber, setSubscriber] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [frequency, setFrequency] = useState('weekly');
  const [maxPosts, setMaxPosts] = useState(3);

  const categories = [
    { id: 'health', name: 'Health & Wellness', icon: '🌿' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'growth', name: 'Personal Growth', icon: '🌱' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
    { id: 'tech', name: 'Technology', icon: '⚡' },
    { id: 'wealth', name: 'Wealth', icon: '💰' },
    { id: 'world', name: 'World News', icon: '🌍' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: '📅 Daily' },
    { value: 'weekly', label: '📆 Weekly' },
    { value: 'biweekly', label: '📑 Bi-weekly' },
    { value: 'monthly', label: '📘 Monthly' }
  ];

  // Verify magic link token
  useEffect(() => {
    if (token && email) {
      verifyToken();
    }
  }, [token, email]);

  const verifyToken = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', decodeURIComponent(email))
      .eq('auth_token', token)
      .single();

    if (error || !data) {
      setMessage('Invalid or expired link. Please request a new one.');
      setShowAuthForm(true);
      setLoading(false);
      return;
    }

    // Check expiry
    const expiresAt = new Date(data.auth_token_expires_at);
    if (expiresAt < new Date()) {
      setMessage('Link expired. Request a new magic link.');
      setShowAuthForm(true);
      setLoading(false);
      return;
    }

    // Clear token after use (one-time)
    await supabase
      .from('newsletter_subscribers')
      .update({ auth_token: null, auth_token_expires_at: null })
      .eq('email', data.email);

    setSubscriber(data);
    setSelectedCategories(data.categories || []);
    setFrequency(data.delivery_frequency || 'weekly');
    setMaxPosts(data.max_posts_per_week || 3);
    setIsAuthenticated(true);
    setShowAuthForm(false);
    setLoading(false);
  };

  const sendMagicLink = async () => {
    if (!authEmail) {
      setMessage('Enter your email address');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Magic link sent! Check your email.');
      setTimeout(() => setMessage(''), 5000);
    } else {
      setMessage(data.error || '❌ Failed to send. Is this email subscribed?');
    }
    setLoading(false);
  };

  const updatePreferences = async () => {
    if (selectedCategories.length === 0) {
      setMessage('Please select at least one category.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        categories: selectedCategories,
        delivery_frequency: frequency,
        max_posts_per_week: maxPosts,
        updated_at: new Date().toISOString()
      })
      .eq('email', subscriber.email);

    if (error) {
      setMessage('Failed to update. Try again.');
    } else {
      setMessage('✅ Preferences updated!');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    if (!confirm('Unsubscribe from all emails? This cannot be undone.')) return;

    setLoading(true);
    await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', subscriber.email);

    setMessage('✅ Unsubscribed. Redirecting...');
    setTimeout(() => router.push('/'), 2000);
    setLoading(false);
  };

  // Auth form (magic link request)
  if (showAuthForm) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
        <h1 style={{ marginBottom: '12px' }}>Manage Your Subscription</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Enter your email to receive a secure magic link.
        </p>

        <input
          type="email"
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '16px'
          }}
          onKeyPress={(e) => e.key === 'Enter' && sendMagicLink()}
        />

        <button
          onClick={sendMagicLink}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#06b6d4',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send Magic Link →'}
        </button>

        {message && (
          <p style={{ marginTop: '24px', color: message.includes('✅') ? '#10b981' : '#ef4444' }}>
            {message}
          </p>
        )}

        <p style={{ fontSize: '12px', color: '#999', marginTop: '32px' }}>
          We'll email you a one-time link. No password needed.
        </p>
      </div>
    );
  }

  // Authenticated preference manager
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{
        background: 'white',
        borderRadius: '28px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚙️</div>
          <h1 style={{ margin: '0 0 8px' }}>Your Preferences</h1>
          <p style={{ color: '#666', margin: 0 }}>{subscriber?.email}</p>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>📌 Topics you follow</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {categories.map(cat => (
              <label
                key={cat.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: selectedCategories.includes(cat.id) ? '#06b6d4' : '#f1f5f9',
                  color: selectedCategories.includes(cat.id) ? 'white' : '#334155',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => {
                    if (selectedCategories.includes(cat.id)) {
                      setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                    } else {
                      setSelectedCategories([...selectedCategories, cat.id]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>⏰ How often?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {frequencyOptions.map(opt => (
              <label
                key={opt.value}
                style={{
                  padding: '10px 20px',
                  background: frequency === opt.value ? '#06b6d4' : '#f1f5f9',
                  color: frequency === opt.value ? 'white' : '#334155',
                  borderRadius: '40px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={opt.value}
                  checked={frequency === opt.value}
                  onChange={() => setFrequency(opt.value)}
                  style={{ display: 'none' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Max Posts */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>📊 Max posts per week</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[1, 2, 3, 5, 7].map(num => (
              <label
                key={num}
                style={{
                  padding: '10px 20px',
                  background: maxPosts === num ? '#06b6d4' : '#f1f5f9',
                  color: maxPosts === num ? 'white' : '#334155',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '60px'
                }}
              >
                <input
                  type="radio"
                  name="maxPosts"
                  value={num}
                  checked={maxPosts === num}
                  onChange={() => setMaxPosts(num)}
                  style={{ display: 'none' }}
                />
                <div style={{ fontWeight: 'bold' }}>{num}</div>
                <div style={{ fontSize: '10px' }}>{num === 1 ? 'post' : 'posts'}</div>
              </label>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
            {maxPosts <= 2 ? '👍 Light reader' : maxPosts <= 4 ? '📖 Regular reader' : '📚 Heavy reader'}
          </p>
        </div>

        {message && (
          <div style={{
            padding: '12px',
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={updatePreferences}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <button
            onClick={unsubscribe}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Unsubscribe from all emails →
          </button>
        </div>
      </div>
    </div>
  );
}