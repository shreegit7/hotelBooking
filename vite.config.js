import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // allow network access
    allowedHosts: [
      'depauperate-overtolerant-jene.ngrok-free.dev', // your ngrok URL
      'localhost',
    ],
  },
})
