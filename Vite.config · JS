import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ IMPORTANT pour GitHub Pages (repo: BEAUVILLE/digiy-audio)
  base: '/digiy-audio/',

  server: {
    port: 5173,
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
