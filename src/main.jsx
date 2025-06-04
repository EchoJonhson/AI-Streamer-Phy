import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as PIXI from 'pixi.js'
import './index.css'
import App from './App.jsx'

// 将PIXI暴露给window，以便pixi-live2d-display能够自动更新Live2D模型
window.PIXI = PIXI;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
