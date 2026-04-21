// tailwind.config.js (COMPLETE FILE - NO CHANGES NEEDED)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#EC4899',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          dark: '#06B6D4',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        dark: {
          surface: '#0F172A',
          text: '#F8FAFC',
        },
      },
      spacing: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
        'input': '12px',
      },
      boxShadow: {
        'card': '0 20px 25px -5px rgba(0,0,0,0.1)',
        'hover': '0 25px 30px -12px rgba(139,92,246,0.3)',
        'glass': 'inset 0 1px 1px rgba(255,255,255,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale': 'scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}