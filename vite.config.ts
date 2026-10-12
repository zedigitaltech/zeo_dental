import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      {
        name: 'spa-lang-fallback',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url?.match(/^\/(sq|en|it|de|fr|tr|el|es)(\/|$)/) && !req.url.includes('.')) {
              req.url = '/index.html';
            }
            next();
          });
        },
      },
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Production optimizations
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
      // Minification - use esbuild (default, no extra deps)
      minify: 'esbuild',
    },
  };
});
