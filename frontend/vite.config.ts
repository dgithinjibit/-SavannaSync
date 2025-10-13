import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 5175,
    strictPort: false,  // This will allow Vite to find an available port if 5175 is taken
  },
  preview: {
    port: 4173,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
});