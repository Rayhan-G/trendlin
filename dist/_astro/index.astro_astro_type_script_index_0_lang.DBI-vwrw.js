const y=[{id:"too-many",label:"Too many emails",value:"Too many emails"},{id:"not-relevant",label:"Content not relevant",value:"Content not relevant"},{id:"no-value",label:"Not getting value",value:"Not getting value"},{id:"spam",label:"Marked as spam",value:"Marked as spam"},{id:"temporary",label:"Temporary (will resubscribe later)",value:"Temporary (will resubscribe later)"},{id:"other",label:"Other",value:"Other"}],c=new URLSearchParams(window.location.search),s=c.get("email"),n=c.get("token"),d=document.getElementById("loading-state"),u=document.getElementById("error-state"),p=document.getElementById("error-message"),f=document.getElementById("success-state"),v=document.getElementById("success-message"),x=document.getElementById("modal-container");let l=null,i=!1;async function h(){if(!s||!n){a("Invalid unsubscribe link. Please contact support.");return}try{const t=await(await fetch(`/api/newsletter/verify-unsubscribe?email=${encodeURIComponent(s)}&token=${encodeURIComponent(n)}`)).json();t.success?(l=t.data,k()):a(t.message||"Invalid unsubscribe link.")}catch{a("An error occurred. Please try again.")}finally{d?.classList.add("hidden")}}function k(){l&&(x.innerHTML=`
      <div id="modal-wrapper">
        ${w(l.email)}
      </div>
    `,document.addEventListener("unsubscribe-confirm",C),document.addEventListener("unsubscribe-close",B))}function w(e){return`
      <div id="unsubscribe-modal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div id="modal-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <button
            id="modal-close"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="text-center mb-6">
            <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Unsubscribe from Trendlin?</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">We're sorry to see you go, ${e}</p>
          </div>
          <form id="unsubscribe-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Why are you unsubscribing?
              </label>
              <div class="space-y-2" id="reason-options">
                ${y.map(t=>`
                  <label class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
                    <input
                      type="radio"
                      name="unsubscribeReason"
                      value="${t.value}"
                      class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">${t.label}</span>
                  </label>
                `).join("")}
              </div>
            </div>
            <div id="other-reason-container" class="hidden animate-slide-down">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Please specify</label>
              <input
                id="other-reason"
                type="text"
                placeholder="Tell us why you're leaving..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Any additional feedback? <span class="text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                id="feedback"
                rows="3"
                placeholder="We'd love to hear how we can improve..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>
            <div class="flex gap-3 pt-2">
              <button
                id="modal-cancel"
                type="button"
                class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                id="modal-confirm"
                type="submit"
                class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                Yes, Unsubscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    `}async function C(e){const{reason:t,feedback:m}=e.detail;if(!s||!n)return;i=!0;const r=document.getElementById("modal-confirm");r&&(r.disabled=!0,r.innerHTML=`
        <span class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      `);try{const o=await(await fetch("/api/newsletter/unsubscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s,token:n,reason:t,feedback:m})})).json();o.success?(L(o.message),b()):alert(o.message||"Failed to unsubscribe. Please try again.")}catch{alert("An error occurred. Please try again.")}finally{i=!1,r&&(r.disabled=!1,r.textContent="Yes, Unsubscribe")}}function B(){b(),i||a("Unsubscribe cancelled.")}function b(){const e=document.getElementById("unsubscribe-modal");e&&e.remove()}function a(e){d?.classList.add("hidden"),u?.classList.remove("hidden"),p.textContent=e}function L(e){d?.classList.add("hidden"),u?.classList.add("hidden"),f?.classList.remove("hidden"),v.textContent=e}h();
