import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    headers: {
      'Content-Security-Policy':
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: data:; connect-src 'self' http://localhost:8085"
    },
  },
})