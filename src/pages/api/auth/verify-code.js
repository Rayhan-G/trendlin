// ============================================
// VERIFY CODE API
// ============================================
// FILE: pages/api/auth/verify-code.js

import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Find verification record
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('verified', false)
      .single();

    if (fetchError || !verification) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempts
    if (verification.attempts >= 5) {
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new code.' });
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ 
        verified: true, 
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', normalizedEmail)
      .eq('code', code);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      // Update existing user as verified
      await supabase
        .from('users')
        .update({ 
          email_verified: true, 
          email_verified_at: new Date().toISOString() 
        })
        .eq('email', normalizedEmail);
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      email: normalizedEmail
    });

  } catch (error) {
    console.error('Verification error:', error);
    
    // Increment attempts on error
    await supabase
      .from('email_verifications')
      .update({ attempts: supabase.raw('attempts + 1') })
      .eq('email', normalizedEmail);
    
    return res.status(500).json({ error: 'Failed to verify code' });
  }
}