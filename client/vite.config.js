// 📁 vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // 유저용
        admin: path.resolve(__dirname, 'admin.html'), // 관리자용
      },
    },
  },
  server: {
   host: '0.0.0.0',  // 외부 접속 허용
    port: 5173,
    proxy: {
      '/api': 'http://54.85.128.211:4000',
      '/socket.io': {
        target: 'http://54.85.128.211:4000',
        ws: true,
        strictPort: true,
        host: true,
      },
    },
  },
});
