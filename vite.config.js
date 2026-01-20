import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({

  theme: {
    extend: {
      keyframes: {
        'slide-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'slide-right': 'slide-right 5s linear infinite',
      },
    },
  },
  plugins: [react(),
    tailwindcss(),
  ],
})
