# AI心理医生 - 前端应用

## 📁 目录结构

```
frontend/
├── src/                # 源代码
│   ├── pages/          # 页面组件
│   │   ├── HomePage.jsx
│   │   ├── LivePage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── LibraryHelp.jsx
│   ├── components/     # 组件库
│   │   ├── Live2DModel.jsx
│   │   ├── ApiSettings.jsx
│   │   ├── LiveBackground.jsx
│   │   └── layout/     # 布局组件
│   ├── services/       # 前端服务
│   │   ├── apiService.js
│   │   ├── configService.js
│   │   ├── speechService.js
│   │   └── modelControlService.js
│   ├── hooks/          # React Hooks
│   │   └── useLive2DModel.js
│   ├── styles/         # 样式文件
│   │   ├── App.css
│   │   └── index.css
│   ├── App.jsx         # 主应用组件
│   └── main.jsx        # 应用入口
└── public/             # 静态资源
    ├── assets/         # 静态资源
    ├── backgrounds/    # 背景图片
    ├── libs/           # 第三方库
    └── live2d/         # Live2D模型
        ├── core/       # 核心文件
        └── models/     # 模型文件
            └── wuwuwu/ # 小雨模型
```

## 🎨 技术栈

- **React 18**：现代化的前端框架
- **Vite**：快速的构建工具
- **PIXI.js**：高性能2D渲染引擎
- **Live2D Cubism SDK**：虚拟形象渲染
- **React Router**：路由管理
- **WebSocket**：实时通信

## 🚀 重构进展

- [x] 创建目录结构框架
- [ ] 迁移前端源代码
- [ ] 迁移静态资源
- [ ] 更新构建配置
- [ ] 更新导入路径
- [ ] 功能测试验证