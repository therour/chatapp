import svgr from '@svgr/rollup'
import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: [{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
  },
  server: {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '3000', 10),
  },
})
