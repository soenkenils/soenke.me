/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Nordic Editorial color system
        nordic: {
          // Base tones (warm blacks/charcoals)
          void: '#0a0a0c',
          base: '#0f0f12',
          surface: '#18181c',
          elevated: '#222228',
          card: '#1c1c21',

          // Borders and lines
          border: '#2a2a32',
          'border-subtle': '#1f1f26',

          // Text hierarchy
          text: '#e8e6e3',
          'text-secondary': '#b8b6b3',
          muted: '#7a7a7f',

          // Accent colors
          amber: '#d4a853',
          'amber-dim': '#b8923d',
          'amber-glow': 'rgba(212, 168, 83, 0.15)',

          // Highlight/link colors
          sky: '#7eb5d6',
          'sky-dim': '#5a9bc4',

          // Semantic accents
          sage: '#8fae8b',
          rose: '#c48b8b',
          lavender: '#a89cc4',
          slate: '#8a9aad',
        },
        // Keep catppuccin for backwards compatibility during transition
        catppuccin: {
          rosewater: '#f5e0dc',
          flamingo: '#f2cdcd',
          pink: '#f5c2e7',
          mauve: '#cba6f7',
          red: '#f38ba8',
          maroon: '#eba0ac',
          peach: '#fab387',
          yellow: '#f9e2af',
          green: '#a6e3a1',
          teal: '#94e2d5',
          sky: '#89dceb',
          sapphire: '#74c7ec',
          blue: '#89b4fa',
          lavender: '#b4befe',
          text: '#cdd6f4',
          subtext1: '#bac2de',
          subtext0: '#a6adc8',
          overlay2: '#9399b2',
          overlay1: '#7f849c',
          overlay0: '#6c7086',
          surface2: '#585b70',
          surface1: '#45475a',
          surface0: '#313244',
          base: '#1e1e2e',
          mantle: '#181825',
          crust: '#11111b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-scale': 'fadeInScale 1s ease-out forwards',
        'grain': 'grain 8s steps(10) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'text-reveal': 'textReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'line-grow': 'lineGrow 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        textReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        lineGrow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
