import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './', // 确保使用相对路径
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
        // 排除在构建之外的外部依赖
        '/live2d/core/live2d.min.js',
        '/live2d/core/live2dcubismcore.min.js',
        '/live2d/core/index-live2d.js',
        '/live2d/core/live2d-preload.js',
      ]
    },
    // 复制live2d核心库到输出目录
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    host: true, // 允许外部访问
    // 开发环境HTTPS配置（语音识别需要）
    https: process.env.HTTPS === 'true',
    // 如果需要自定义证书，可以这样配置：
    // https: process.env.HTTPS === 'true' ? {
    //   key: fs.readFileSync('./ssl/private.key'),
    //   cert: fs.readFileSync('./ssl/certificate.crt')
    // } : false,
  },
  publicDir: 'public',
})