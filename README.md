# 虚拟AI主播项目

这是一个使用React和Vite构建的虚拟AI主播项目，包含Live2D模型展示和互动功能。

[![部署状态](https://img.shields.io/badge/部署-Vercel-blue)](https://virtual-ai-streamer.vercel.app/)

## 功能特点

- 响应式设计，适配各种设备
- Live2D模型展示与互动
- 弹幕系统
- 霓虹赛博朋克风格UI

## 页面说明

- **首页**: 用户输入昵称并进入直播间
- **直播间**: 包含Live2D模型展示区和互动区域
- **设置页**: 调整AI主播和界面设置

## 技术栈

- React
- Vite
- React Router
- PIXI.js
- pixi-live2d-display

## 部署信息

项目已部署到Vercel，可通过以下链接访问：
[虚拟AI主播](https://virtual-ai-streamer.vercel.app/)

## 开发说明

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

## Live2D模型互动说明

- 点击模型触发动作
- 拖动模型改变位置
- 滚轮缩放模型大小

## 项目结构

```
virtual-ai-streamer/
├── public/            # 静态资源
├── src/
│   ├── components/    # 组件
│   │   └── layout/    # 布局组件
│   ├── pages/         # 页面组件
│   ├── App.jsx        # 应用入口
│   └── main.jsx       # 主入口
└── vercel.json        # Vercel配置
```

## 联系方式

邮箱: 3485573766@qq.com
GitHub: [https://github.com/tsurumiyakwa/virtual-ai-streamer](https://github.com/tsurumiyakwa/virtual-ai-streamer)
