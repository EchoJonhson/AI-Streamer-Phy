import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    // 优化构建配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 保留console以便调试
        drop_debugger: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'pixi': ['pixi.js'],
          'live2d': ['pixi-live2d-display'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // 复制live2d核心库到输出目录
    copyPublicDir: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
  base: '/',
  publicDir: 'public',
})
