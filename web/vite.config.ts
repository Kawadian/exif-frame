import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project sites are served under /<repo>/
  base: process.env.BASE_PATH || '/',
});
