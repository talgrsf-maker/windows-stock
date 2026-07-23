import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative assets allow the production build to run from Electron's file:// URL.
  base: './',
  plugins: [react()],
});
