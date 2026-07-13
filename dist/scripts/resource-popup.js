// ============================================================
// RESOURCE POPUP CONTROLLER - Global (FIXED)
// ============================================================

(function() {
  'use strict';
  
  // Icon definitions
  const popupIcons = {
    reddit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 15.5c-.7.7-2 .8-2.5.8s-1.8-.1-2.5-.8a.5.5 0 1 1 .7-.7c.4.4 1.3.6 1.8.6s1.4-.2 1.8-.6a.5.5 0 1 1 .7.7zM9.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1.2a2.2 2.2 0 0 0-3.7-1.6c-1.3-.9-3-1.5-4.8-1.6l.8-3 2.1.5a1.8 1.8 0 1 0 .3-1l-2.6-.6a.5.5 0 0 0-.6.4l-.9 3.5c-1.9.1-3.6.7-4.9 1.6A2.2 2.2 0 0 0 2.5 10.8c0 .9.5 1.7 1.2 2-.1.3-.2.7-.2 1 0 3.2 3.7 5.8 8.5 5.8s8.5-2.6 8.5-5.8c0-.3-.1-.7-.2-1 .7-.3 1.2-1.1 1.2-2z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C19.1 3.3 12 3.3 12 3.3s-7.1 0-9.1.5C1.7 4.1.8 5 .5 6.2 0 8.2 0 12 0 12s0 3.8.5 5.8c.3 1.2 1.2 2.1 2.4 2.4 2 .5 9.1.5 9.1.5s7.1 0 9.1-.5c1.2-.3 2.1-1.2 2.4-2.4.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8zM9.5 15.5v-7l6 3.5-6 3.5z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3.1v13.2a2.8 2.8 0 1 1-2.8-2.8c.3 0 .6 0 .9.1V9.3a6 6 0 1 0 5.9 6V8.9c1.2.9 2.7 1.5 4.3 1.6V7.4c-2-.1-3.8-1.7-4.2-3.9V2z"/></svg>`,
    amazon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.2 14h9.9c.8 0 1.5-.5 1.8-1.2l3-6.8A1 1 0 0 0 21 4H6.2L5.3 2H2v2h2l3.6 7.6-1.3 2.4A2 2 0 0 0 8 17h12v-2H8l1.2-2z"/></svg>`
  };
  
  const popupConfig = {
    reddit: { 
      icon: 'reddit', 
      label: 'Reddit', 
      emptyTitle: 'No Reddit discussions available', 
      emptyDesc: 'Check back later for community discussions.' 
    },
    youtube: { 
      icon: 'youtube', 
      label: 'YouTube', 
      emptyTitle: 'No YouTube reviews available', 
      emptyDesc: 'Check back later for video reviews.' 
    },
    tiktok: { 
      icon: 'tiktok', 
      label: 'TikTok', 
      emptyTitle: 'No TikTok videos available', 
      emptyDesc: 'Check back later for short-form content.' 
    },
    amazon: { 
      icon: 'amazon', 
      label: 'Amazon', 
      emptyTitle: 'Not available on Amazon', 
      emptyDesc: 'This product may be available from other retailers.' 
    }
  };
  
  // Flag to prevent close-on-click when popup is opening
  let isOpening = false;
  let isClosing = false;
  
  // Open popup
  window.openPopup = function(event, platform, resourcesJson) {
    // Prevent event from bubbling
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Prevent multiple rapid opens
    if (isOpening) return;
    isOpening = true;
    
    // Close any existing popup
    window.closePopup();
    
    const popup = document.getElementById('resource-popup');
    const body = document.getElementById('popup-body');
    
    if (!popup || !body) {
      console.error('Popup elements not found!');
      isOpening = false;
      return;
    }
    
    const config = popupConfig[platform];
    let resources = [];
    try {
      resources = JSON.parse(resourcesJson) || [];
    } catch (e) {
      console.warn('Failed to parse resources JSON:', e);
      resources = [];
    }
    
    const hasResources = resources.length > 0;
    let html = '';
    
    // Header
    html += `
      <div class="popup-header">
        <span class="popup-icon ${config.icon}">${popupIcons[config.icon]}</span>
        <span class="popup-title">${config.label}</span>
        ${hasResources ? `<span class="popup-count">${resources.length}</span>` : ''}
      </div>
    `;
    
    // Body
    if (hasResources) {
      if (platform === 'amazon') {
        const r = resources[0];
        html += `
          <div class="amazon-info">
            <div class="amazon-row">
              <span class="amazon-label">Price</span>
              <span class="amazon-value">Check on Amazon</span>
            </div>
            <div class="amazon-row">
              <span class="amazon-label">Seller</span>
              <span class="amazon-value">Amazon.com</span>
            </div>
            <div class="amazon-row">
              <span class="amazon-label">Prime</span>
              <span class="amazon-value">✓ Eligible</span>
            </div>
          </div>
          <a href="${r.url || '#'}" target="_blank" rel="noopener noreferrer" class="amazon-cta">
            <span class="amazon-cta-icon">${popupIcons.amazon}</span>
            <span class="amazon-cta-text">View on Amazon</span>
            <span class="amazon-cta-arrow">→</span>
          </a>
        `;
      } else {
        html += `<div class="resource-list">`;
        resources.forEach(r => {
          html += `
            <a href="${r.url || '#'}" target="_blank" rel="noopener noreferrer" class="resource-item">
              <span class="resource-icon-wrap">${popupIcons[platform]}</span>
              <span class="resource-info">
                <span class="resource-title">${r.title || 'Discussion'}</span>
                ${r.author ? `<span class="resource-author">${r.author}</span>` : ''}
              </span>
              <span class="resource-arrow">→</span>
            </a>
          `;
        });
        html += `</div>`;
      }
    } else {
      html += `
        <div class="empty-state">
          <div class="empty-title">${config.emptyTitle}</div>
          <div class="empty-description">${config.emptyDesc}</div>
        </div>
      `;
    }
    
    body.innerHTML = html;
    popup.style.display = 'flex';
    
    // Reset opening flag after a short delay
    setTimeout(() => {
      isOpening = false;
    }, 100);
  };
  
  // Close popup
  window.closePopup = function() {
    if (isClosing) return;
    isClosing = true;
    
    const popup = document.getElementById('resource-popup');
    if (popup) {
      popup.style.display = 'none';
    }
    
    setTimeout(() => {
      isClosing = false;
    }, 100);
  };
  
  // Close on ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closePopup();
    }
  });
  
  // Close on outside click (with proper targeting)
  document.addEventListener('click', function(e) {
    const popup = document.getElementById('resource-popup');
    if (!popup || popup.style.display !== 'flex') return;
    
    // If clicking directly on overlay or outside content
    const content = popup.querySelector('.resource-popup-content');
    const overlay = popup.querySelector('.resource-popup-overlay');
    
    if (e.target === overlay || (content && !content.contains(e.target) && !e.target.closest('.social-btn'))) {
      window.closePopup();
    }
  });
  
  console.log('✅ Resource Popup Controller initialized (FIXED)!');
})();