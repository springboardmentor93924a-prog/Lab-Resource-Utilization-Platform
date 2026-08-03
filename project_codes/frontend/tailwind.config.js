/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#10151A',
        panel: '#161C24',
        panel2: '#1C2430',
        line: '#232B35',
        bg: '#F5F6F8',
        surface: '#FFFFFF',
        border: '#E3E6EA',
        muted: '#6B7280',
        primary: {
          DEFAULT: '#1D4E89',
          dark: '#163C69',
          light: '#EAF1F8',
        },
        accent: {
          DEFAULT: '#2FA6A2',
          light: '#E6F5F3',
        },
        warn: {
          DEFAULT: '#C88719',
          light: '#FBF0DD',
        },
        danger: {
          DEFAULT: '#C0392B',
          light: '#FBEAE8',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 21, 26, 0.04), 0 1px 3px 0 rgba(16, 21, 26, 0.06)',
        popover: '0 8px 24px -4px rgba(16, 21, 26, 0.18)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
}
