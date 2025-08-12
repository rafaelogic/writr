/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './resources/views/**/*.blade.php',
    './resources/js/**/*.js',
    './resources/js/**/*.ts',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        writr: {
          primary: 'var(--writr-primary-color, #3b82f6)',
          bg: 'var(--writr-bg-color, #ffffff)',
          text: 'var(--writr-text-color, #1f2937)',
          border: 'var(--writr-border-color, #e5e7eb)',
          focus: 'var(--writr-focus-color, #60a5fa)',
          muted: 'var(--writr-muted-color, #6b7280)',
          accent: 'var(--writr-accent-color, #f3f4f6)',
        },
      },
      fontFamily: {
        writr: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'writr-xs': '0.25rem',
        'writr-sm': '0.5rem',
        'writr-md': '1rem',
        'writr-lg': '1.5rem',
        'writr-xl': '2rem',
      },
      borderRadius: {
        'writr': '0.375rem',
        'writr-lg': '0.5rem',
      },
      boxShadow: {
        'writr': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'writr-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'writr-focus': '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
      animation: {
        'writr-fade-in': 'writr-fade-in 0.2s ease-out',
        'writr-slide-up': 'writr-slide-up 0.3s ease-out',
        'writr-pulse': 'writr-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'writr-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'writr-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'writr-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      zIndex: {
        'writr-dropdown': '1000',
        'writr-modal': '1050',
        'writr-tooltip': '1070',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    
    // Custom plugin for Writr-specific utilities
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.writr-scrollbar-hide': {
          /* Hide scrollbar for Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          /* Hide scrollbar for IE, Edge and Firefox */
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.writr-transition': {
          transition: 'all 0.2s ease-in-out',
        },
        '.writr-focus-ring': {
          '&:focus': {
            outline: 'none',
            'box-shadow': theme('boxShadow.writr-focus'),
          },
        },
      });

      addComponents({
        '.writr-btn': {
          '@apply inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-writr transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2': {},
        },
        '.writr-btn-primary': {
          '@apply writr-btn bg-writr-primary text-white hover:bg-opacity-90 focus:ring-writr-primary': {},
        },
        '.writr-btn-secondary': {
          '@apply writr-btn bg-writr-accent text-writr-text hover:bg-opacity-80 focus:ring-writr-border': {},
        },
        '.writr-input': {
          '@apply block w-full px-3 py-2 text-sm bg-writr-bg border border-writr-border rounded-writr focus:ring-2 focus:ring-writr-focus focus:border-transparent': {},
        },
        '.writr-card': {
          '@apply bg-writr-bg border border-writr-border rounded-writr-lg shadow-writr': {},
        },
        '.writr-dropdown': {
          '@apply absolute z-writr-dropdown mt-1 bg-writr-bg border border-writr-border rounded-writr shadow-writr-lg': {},
        },
      });
    },
  ],
  // Scope all styles to prevent conflicts
  corePlugins: {
    preflight: false,
  },
  prefix: '',
  important: '.writr-editor-wrapper',
};
