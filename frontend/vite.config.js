import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/patients-api': { target: 'http://patient-service:8081', rewrite: p => p.replace(/^\/patients-api/, ''), changeOrigin: true },
      '/appointments-api': { target: 'http://appointment-service:8082', rewrite: p => p.replace(/^\/appointments-api/, ''), changeOrigin: true },
      '/doctors-api': { target: 'http://doctor-service:8083', rewrite: p => p.replace(/^\/doctors-api/, ''), changeOrigin: true },
    }
  }
})
