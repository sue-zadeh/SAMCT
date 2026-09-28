import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    proxy: {
      '/api': { target: process.env.SAMCT_API_PROXY || 'http://127.0.0.1:5072' },
      '/uploads': { target: process.env.SAMCT_API_PROXY || 'http://127.0.0.1:5072' },
    },
  },
})
