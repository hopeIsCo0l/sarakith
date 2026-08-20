/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sara: {
          red: '#6f0f10',
          redLight: '#8f1416',
          redDark: '#4a0a0b',
          redHover: '#841213',
          redGlow: 'rgba(111, 15, 16, 0.5)',
        },
        kith: {
          bg: 'var(--kith-bg)',
          subBg: 'var(--kith-sub-bg)',
          card: 'var(--kith-card)',
          innerCard: 'var(--kith-inner-card)',
          border: 'var(--kith-border)',
          borderLight: 'var(--kith-border-light)',
          bone: 'var(--kith-bone)',
          offwhite: 'var(--kith-offwhite)',
          muted: 'var(--kith-muted)',
          darkMuted: 'var(--kith-dark-muted)',
          accent: 'var(--kith-accent)',
          btnPrimaryBg: 'var(--kith-btn-primary-bg)',
          btnPrimaryText: 'var(--kith-btn-primary-text)',
          btnPrimaryHover: 'var(--kith-btn-primary-hover)',
          btnSecondaryBg: 'var(--kith-btn-secondary-bg)',
          btnSecondaryText: 'var(--kith-btn-secondary-text)',
          btnSecondaryBorder: 'var(--kith-btn-secondary-border)',
          btnSecondaryHover: 'var(--kith-btn-secondary-hover)',
          overlayBg: 'var(--kith-overlay-bg)',
        },
      },
      fontFamily: {
        sans: ['Mostin', 'var(--font-mostin)', 'Montserrat', 'sans-serif'],
        mono: ['Mostin', 'var(--font-mostin)', 'Space Mono', 'monospace'],
        display: ['Mostin', 'var(--font-mostin)', 'Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        kith: '0.15em',
        superwide: '0.3em',
      },
    },
  },
  plugins: [],
};
