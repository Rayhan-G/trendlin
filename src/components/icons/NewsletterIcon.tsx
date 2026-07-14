// src/components/icons/NewsletterIcon.tsx

interface NewsletterIconProps {
  category: string;
  className?: string;
  size?: number;
}

export function NewsletterIcon({ category, className = '', size = 24 }: NewsletterIconProps) {
  const icons: Record<string, string> = {
    'health-wellness': HEALTH_WELLNESS_SVG,
    'food-dining': FOOD_DINING_SVG,
    'entertainment': ENTERTAINMENT_SVG,
    'lifestyle': LIFESTYLE_SVG,
    'technology': TECHNOLOGY_SVG,
    'shopping': SHOPPING_SVG,
    'real-estate': REAL_ESTATE_SVG,
    'finance': FINANCE_SVG,
  };

  const svg = icons[category] || DEFAULT_ICON;

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ============================================
// SVG ICONS
// ============================================

const HEALTH_WELLNESS_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
  <path d="M12 7v10"/>
  <path d="M8 9.5l4 2 4-2"/>
</svg>
`;

const FOOD_DINING_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="17 8 12 3 7 8"/>
  <line x1="12" y1="3" x2="12" y2="15"/>
  <path d="M4 8h16"/>
  <path d="M8 15v4"/>
  <path d="M16 15v4"/>
</svg>
`;

const ENTERTAINMENT_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="2" width="20" height="20" rx="2.18"/>
  <line x1="8" y1="2" x2="8" y2="22"/>
  <line x1="16" y1="2" x2="16" y2="22"/>
  <line x1="2" y1="8" x2="22" y2="8"/>
  <line x1="2" y1="16" x2="22" y2="16"/>
  <circle cx="12" cy="12" r="2"/>
  <circle cx="4" cy="4" r="0.5"/>
  <circle cx="4" cy="20" r="0.5"/>
  <circle cx="20" cy="4" r="0.5"/>
  <circle cx="20" cy="20" r="0.5"/>
</svg>
`;

const LIFESTYLE_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <path d="M9 12l2 2 4-4"/>
  <path d="M12 8v4"/>
</svg>
`;

const TECHNOLOGY_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
  <line x1="8" y1="21" x2="16" y2="21"/>
  <line x1="12" y1="17" x2="12" y2="21"/>
  <circle cx="6" cy="7" r="0.5" fill="currentColor"/>
  <circle cx="10" cy="7" r="0.5" fill="currentColor"/>
  <circle cx="14" cy="7" r="0.5" fill="currentColor"/>
  <circle cx="18" cy="7" r="0.5" fill="currentColor"/>
</svg>
`;

const SHOPPING_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
  <line x1="3" y1="6" x2="21" y2="6"/>
  <path d="M16 10a4 4 0 0 1-8 0"/>
  <path d="M12 14v4"/>
  <path d="M8 18h8"/>
</svg>
`;

const REAL_ESTATE_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/>
  <path d="M8 21v-7h8v7"/>
</svg>
`;

const FINANCE_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2v4"/>
  <path d="M12 18v4"/>
  <path d="M4.93 4.93l2.83 2.83"/>
  <path d="M16.24 16.24l2.83 2.83"/>
  <path d="M2 12h4"/>
  <path d="M18 12h4"/>
  <path d="M4.93 19.07l2.83-2.83"/>
  <path d="M16.24 7.76l2.83-2.83"/>
  <circle cx="12" cy="12" r="4"/>
</svg>
`;

const DEFAULT_ICON = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>
`;