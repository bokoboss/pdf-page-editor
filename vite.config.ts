
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // สำคัญมาก: บอกให้ใช้ relative path เพื่อให้รันบน GitHub Pages ได้
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000
  }
});
