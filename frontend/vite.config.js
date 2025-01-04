import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        // eslint-disable-next-line no-undef
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      }
    }
  },
  plugins: [react()],
})