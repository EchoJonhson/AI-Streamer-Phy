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
    minify: 'esbuild', // 使用esbuild替代terser进行压缩
    rollupOptions: {
      output: {
        manualChunks: {
          'pixi': ['pixi.js'],
          'live2d': ['pixi-live2d-display'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
      // 处理外部脚本
      external: [
        '/live2d/core/live2dcubismcore.min.js',
        '/live2d-preload.js'
      ]
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
