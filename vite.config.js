import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Domaine custom GitHub Pages :
  // https://digiy-audio.digiylyfe.com/
  // => base à "/" (ou tu peux l’omettre)
  base: '/',

  server: {
    port: 5173,
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
