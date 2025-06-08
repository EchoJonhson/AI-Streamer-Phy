import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import * as PIXI from 'pixi.js'
import './index.css'
import App from './App.jsx'
import HomePage from './pages/HomePage'
import LivePage from './pages/LivePage'
import SettingsPage from './pages/SettingsPage'
import LibraryHelp from './pages/LibraryHelp'
import MainLayout from './components/layout/MainLayout'

// 将PIXI暴露给window，以便pixi-live2d-display能够自动更新Live2D模型
window.PIXI = PIXI;

// 创建路由配置
const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'live',
        element: <LivePage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'library-help',
        element: <LibraryHelp />
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
