import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@libs', replacement: path.resolve(__dirname, 'src/lib') }
    ]
  },
  build: {
    outDir: 'dist',
  },
  base: './',
}) 