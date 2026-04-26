// src/components/admin/AdDisplay.js
import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdDisplay({ slotId, postId, sessionId }) {
  const adContainerRef = useRef(null)

  useEffect(() => {
    // Fetch ad code for this slot
    const fetchAd = async () => {
      try {
        const { data: slotCode, error } = await supabase
          .from('ad_slot_codes')
          .select('code_id, ad_codes(code)')
          .eq('slot_id', slotId)
          .eq('is_active', true)
          .single()
        
        if (error) throw error
        
        if (slotCode && adContainerRef.current) {
          // Track impression
          await supabase.rpc('track_ad_impression', {
            p_slot_id: slotId,
            p_code_id: slotCode.code_id,
            p_post_id: postId,
            p_session_id: sessionId,
            p_ip_address: '',
            p_user_agent: navigator.userAgent
          })
          
          // Render ad with mobile optimizations
          const adHtml = slotCode.ad_codes.code
          
          // Check if ad needs responsive wrapper
          const responsiveAd = `
            <div class="ad-responsive-wrapper" style="
              max-width: 100%;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              margin: 0 auto;
            ">
              ${adHtml}
            </div>
          `
          
          adContainerRef.current.innerHTML = responsiveAd
          
          // Force responsive iframes
          const iframes = adContainerRef.current.querySelectorAll('iframe')
          iframes.forEach(iframe => {
            iframe.style.maxWidth = '100%'
            iframe.style.height = 'auto'
            iframe.style.width = '100%'
          })
          
          // Force responsive images
          const images = adContainerRef.current.querySelectorAll('img')
          images.forEach(img => {
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
          })
        }
      } catch (error) {
        console.error('Error loading ad:', error)
      }
    }
    
    fetchAd()
  }, [slotId, postId, sessionId])
  
  return (
    <div 
      ref={adContainerRef}
      id={`ad-${slotId}`}
      className="ad-container"
      style={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '10px auto',
        position: 'relative',
        clear: 'both'
      }}
    />
  )
}