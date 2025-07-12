import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@libs', replacement: path.resolve(__dirname, 'src/lib') },
      // Permet les imports absolus "src/..."
      { find: 'src', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  build: {
    outDir: 'dist',
  },
  base: './',
}) 