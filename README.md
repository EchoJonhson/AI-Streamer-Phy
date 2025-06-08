# 虚拟AI主播系统

这是一个基于React、Live2D和AI的虚拟主播系统，可以用于直播、虚拟助手等场景。

## 特性

- 支持Live2D模型显示和动画
- 集成AI对话功能
- 语音合成
- 直播模式
- 响应式设计

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/yourusername/virtual-ai-streamer.git
cd virtual-ai-streamer
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## Cloudflare Worker部署

为了安全地使用Hugging Face API，本项目使用Cloudflare Worker作为代理。按照以下步骤部署：

1. 安装Wrangler CLI
```bash
npm install -g wrangler
```

2. 登录Cloudflare
```bash
wrangler login
```

3. 创建一个新的Worker
```bash
wrangler init my-hf-proxy
```

4. 复制`cloudflare-worker/worker.js`到新创建的Worker项目中

5. 在worker.js中更新您的Hugging Face API密钥
```js
const HF_API_KEY = "YOUR_HUGGING_FACE_API_KEY";
```

6. 更新允许的域名列表
```js
const ALLOWED_ORIGINS = [
  "https://your-domain.com",
  "http://localhost:3000"
];
```

7. 发布Worker
```bash
wrangler publish
```

8. 更新前端项目中的Worker URL
```js
// src/services/huggingFaceService.js
const WORKER_URL = 'https://your-worker-name.your-account.workers.dev';
```

## 故障排除

### Live2D模型不显示

1. 检查浏览器控制台是否有错误
2. 确认所有必要的Live2D库文件已加载:
   - live2d.min.js
   - live2dcubismcore.min.js
   - pixi.min.js
   - pixi-live2d-display.min.js

### CORS错误

如果遇到CORS错误：
1. 确认Worker已正确部署
2. 检查Worker URL是否正确
3. 检查Worker中的ALLOWED_ORIGINS是否包含您的域名

### 语音合成错误

如果语音合成不工作：
1. 确认浏览器支持Web Speech API
2. 在语音设置中尝试不同的语音选项
3. 可能需要用户交互后才能使用语音功能

## API密钥安全

**重要**：永远不要在前端代码中直接包含API密钥。本项目使用Cloudflare Worker来保护API密钥。

## 贡献

欢迎提交Pull Request或提出Issues。

## 许可证

MIT

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
