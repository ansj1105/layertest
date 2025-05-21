// 📁 vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default ({ mode }) => {
  // 1) Load all .env files for this mode (development/production)
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_HOST,      // now defined
          changeOrigin: true,
          ws: false,
        },
        '/chat': {
          target: env.VITE_WS_HOST,       // now defined
          changeOrigin: true,
          ws: true,
        },
      },
    },
  })
}
