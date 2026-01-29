import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Path aliases for cleaner imports
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@components': path.resolve(__dirname, './src/components'),
        '@features': path.resolve(__dirname, './src/features'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },

    // Development server configuration
    server: {
      port: 5173,
      host: true,
      // Proxy API requests to backend server
      proxy: {
        '/baasHome': {
          target: env.VITE_API_GATEWAY || 'http://localhost:8090/onebase',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        '/baasContent': {
          target: env.VITE_API_GATEWAY || 'http://localhost:8090/onebase',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            crypto: ['crypto-js'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },

    // Preview server configuration (for testing production build)
    preview: {
      port: 4173,
      proxy: {
        '/baasHome': {
          target: env.VITE_API_GATEWAY || 'http://localhost:8090/onebase',
          changeOrigin: true,
          secure: false,
        },
        '/baasContent': {
          target: env.VITE_API_GATEWAY || 'http://localhost:8090/onebase',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
