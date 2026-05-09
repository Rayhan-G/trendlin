// src/components/frontend/NewsletterSubscribe/hooks/useEmailVerification.js
import { useState, useCallback } from 'react'
import { sendVerificationCode, verifyCode, updateNewsletterEmail } from '../utils/api'

export function useEmailVerification({ dispatch, currentEmail, userId }) {
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const sendCode = useCallback(async (newEmail) => {
    if (!newEmail || !newEmail.includes('@')) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Please enter a valid email address' })
      return false
    }

    if (newEmail === currentEmail) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'New email must be different from current newsletter email' })
      return false
    }

    setIsSending(true)
    dispatch({ type: 'SET_EMAIL_ERROR', payload: '' })

    try {
      const result = await sendVerificationCode(newEmail)
      
      dispatch({ type: 'SET_VERIFICATION_ID', payload: result.verificationId })
      dispatch({ type: 'SET_PENDING_NEW_EMAIL', payload: newEmail })
      dispatch({ type: 'SET_SHOW_VERIFICATION_MODAL', payload: true })
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Verification code sent! Check your email or console.', type: 'success' }
      }))
      
      return true
    } catch (err) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: err.message })
      return false
    } finally {
      setIsSending(false)
    }
  }, [currentEmail, dispatch])

  const verifyCodeAndUpdate = useCallback(async (verificationCode, verificationId, pendingEmail) => {
    if (!verificationCode || verificationCode.length !== 6) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Please enter the 6-digit verification code' })
      return false
    }

    setIsVerifying(true)
    dispatch({ type: 'SET_EMAIL_ERROR', payload: '' })

    try {
      // First verify the code
      const verification = await verifyCode({
        verificationId,
        code: verificationCode
      })
      
      if (!verification.verified) {
        throw new Error('Verification failed')
      }
      
      // Then update the email in the database
      await updateNewsletterEmail({
        userId,
        email: pendingEmail
      })
      
      dispatch({ type: 'SET_NEWSLETTER_EMAIL', payload: pendingEmail })
      dispatch({ type: 'SET_NEW_EMAIL_INPUT', payload: pendingEmail })
      dispatch({ type: 'RESET_EMAIL_STATE' })
      
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Newsletter delivery email updated successfully!', type: 'success' }
      }))
      
      // Dispatch subscription change event
      window.dispatchEvent(new CustomEvent('subscriptionChange', { 
        detail: { 
          isSubscribed: true,
          action: 'email_updated',
          newsletterEmail: pendingEmail,
          timestamp: Date.now()
        }
      }))
      
      return true
    } catch (err) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: err.message })
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [dispatch, userId])

  return {
    sendCode,
    verifyCodeAndUpdate,
    isSending,
    isVerifying
  }
}