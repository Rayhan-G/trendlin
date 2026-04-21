// src/components/admin/AdDisplay.js
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdDisplay({ slotId, postId, sessionId }) {
  useEffect(() => {
    // Fetch ad code for this slot
    const fetchAd = async () => {
      const { data: slotCode } = await supabase
        .from('ad_slot_codes')
        .select('code_id, ad_codes(code)')
        .eq('slot_id', slotId)
        .eq('is_active', true)
        .single()
      
      if (slotCode) {
        // Track impression
        await supabase.rpc('track_ad_impression', {
          p_slot_id: slotId,
          p_code_id: slotCode.code_id,
          p_post_id: postId,
          p_session_id: sessionId,
          p_ip_address: '',
          p_user_agent: navigator.userAgent
        })
        
        // Render ad
        const adContainer = document.getElementById(`ad-${slotId}`)
        if (adContainer) {
          adContainer.innerHTML = slotCode.ad_codes.code
        }
      }
    }
    
    fetchAd()
  }, [slotId, postId, sessionId])
  
  return <div id={`ad-${slotId}`}></div>
}