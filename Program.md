# AI心理医生 - 完整项目结构文档

## 🎯 项目概述

**AI心理医生** 是一个基于GPT-SoVITS和Live2D技术的AI心理疏导师系统，提供专业的心理咨询服务。项目采用前后端分离架构，后端使用Python + aiohttp，前端使用React + Vite。

### 核心特性
- 🎭 **专业心理医生人设**：AI心理医生小雨，具备专业心理咨询背景
- 🔊 **高质量语音合成**：基于GPT-SoVITS的本地语音合成，支持Arona预训练模型
- 🎨 **Live2D虚拟形象**：可爱的虚拟形象，实时表情和动作交互
- 🗣️ **实时语音交互**：支持语音输入(ASR)和语音输出(TTS)
- 🤖 **智能对话系统**：基于Qwen大模型的智能对话，专业心理咨询风格
- 🎵 **训练完成自动播放**：SoVITS模型训练完成后自动播放训练音频

---

## 📁 项目结构

### 根目录文件

```
AI-Streamer-Phy/
├── 📄 run.py                        # 主程序入口
├── 📄 config.yaml                   # 核心配置文件
├── 📄 requirements.txt              # Python依赖
├── 📄 package.json                  # Node.js依赖
├── 📄 vite.config.js               # Vite构建配置
├── 📄 eslint.config.js             # ESLint配置
├── 📄 vercel.json                  # Vercel部署配置
├── 📄 README.md                    # 项目说明
├── 📄 LICENSE                      # 许可证
├── 📄 index.html                   # 前端入口HTML
```

### 核心模块

#### 1. 后端Python模块 (`src/open_llm_vtuber/`)

```
src/open_llm_vtuber/
├── 📄 __init__.py                  # 模块初始化
├── 📄 server.py                    # 核心服务器 (1099行)
├── 📄 config.py                    # 配置管理器 (202行)
├── 📄 routes.py                    # 路由配置
├── 📄 websocket_handler.py         # WebSocket处理
├── 📄 service_context.py           # 服务上下文
├── 📄 chat_history.py              # 聊天记录管理
├── 📄 live2d_model.py              # Live2D模型管理
├── 📄 llm_manager.py               # 大语言模型管理
├── 📄 llm_api.py                   # LLM API接口
├── 📄 qwen_client.py               # Qwen API客户端
├── 📄 asr_manager.py               # 语音识别管理
├── 📄 tts_manager.py               # 语音合成管理
├── 📄 voice_api.py                 # 语音API接口
├── 📄 premium_tts.py               # 高级TTS功能
├── 📄 pretrained_sovits_tts.py     # 预训练SoVITS TTS
├── 📄 simple_sovits_tts.py         # 简单SoVITS TTS
├── 📄 sovits_tts.py                # SoVITS TTS核心
├── 📄 sovits_inference_engine.py   # SoVITS推理引擎
├── 📄 gpt_sovits_official.py       # GPT-SoVITS官方接口
├── 📄 agent/                       # 智能体相关
├── 📄 config_manager/              # 配置管理模块
├── 📄 conversations/               # 对话管理
├── 📄 translate/                   # 翻译功能
├── 📄 tts/                         # TTS模块
├── 📄 utils/                       # 工具函数
├── 📄 vad/                         # 语音活动检测
└── 📄 voice_cloning/               # 语音克隆功能
```

#### 2. 前端React模块 (`src/`)

```
src/
├── 📄 App.jsx                      # React主组件
├── 📄 App.css                      # 主样式
├── 📄 main.jsx                     # React入口
├── 📄 index.css                    # 全局样式
├── 📄 assets/                      # 静态资源
├── 📄 components/                  # React组件
│   ├── 📄 ApiSettings.jsx          # API设置组件
│   ├── 📄 Live2DModel.jsx          # Live2D模型组件
│   ├── 📄 LiveBackground.jsx       # 背景组件
│   └── 📄 layout/                  # 布局组件
├── 📄 pages/                       # 页面组件
│   ├── 📄 HomePage.jsx             # 首页
│   ├── 📄 LivePage.jsx             # 直播页面 (552行)
│   ├── 📄 SettingsPage.jsx         # 设置页面
│   └── 📄 LibraryHelp.jsx          # 库帮助页面
├── 📄 hooks/                       # React Hooks
│   └── 📄 useLive2DModel.js        # Live2D模型Hook
├── 📄 services/                    # 前端服务
│   ├── 📄 apiService.js            # API服务
│   ├── 📄 configService.js         # 配置服务
│   ├── 📄 huggingFaceService.js    # HuggingFace服务
│   ├── 📄 modelControlService.js   # 模型控制服务
│   └── 📄 speechService.js         # 语音服务
└── 📄 styles/                      # 样式文件
```

#### 3. 静态资源 (`public/`)

```
public/
├── 📄 index.html                   # 前端HTML入口
├── 📄 vite.svg                     # Vite图标
├── 📄 voice_recording.html         # 语音录制页面
├── 📄 voice-training.html          # 语音训练页面
├── 📄 1.png                        # 图标文件
├── 📄 assets/                      # 静态资源
│   └── 📄 models/                  # 模型文件
├── 📄 backgrounds/                 # 背景图片
│   ├── 📄 custom-bg.png            # 自定义背景
│   └── 📄 default-bg.gif           # 默认背景
├── 📄 libs/                        # 第三方库
│   ├── 📄 README.txt               # 库说明
│   ├── 📄 live2d.min.js            # Live2D库
│   ├── 📄 pixi.min.js              # PIXI.js库
│   ├── 📄 pixi-live2d-display.min.js # PIXI Live2D显示库
│   ├── 📄 pixi-live2d-initialize.js # PIXI Live2D初始化
│   ├── 📄 pixi-live2d-loader.js    # PIXI Live2D加载器
│   └── 📄 cubism4/                 # Cubism4核心库
├── 📄 live2d/                      # Live2D模型
│   ├── 📄 core/                    # 核心文件
│   └── 📄 models/wuwuwu/           # 小雨模型
│       ├── 📄 wuwuwu.model3.json   # 模型配置
│       ├── 📄 wuwuwu.moc3          # 模型文件
│       ├── 📄 wuwuwu.physics3.json # 物理配置
│       ├── 📄 wuwuwu.cdi3.json     # CDI配置
│       ├── 📄 icon.png             # 图标
│       └── 📄 texture_00.png       # 纹理文件
└── 📄 live2d-preload.js           # Live2D预加载
```

#### 4. GPT-SoVITS语音合成模块 (`GPT-SoVITS/`)

```
GPT-SoVITS/
└── (GPT-SoVITS官方代码库)
```

#### 5. FFmpeg多媒体工具 (`ffmpeg-master-latest-win64-gpl-shared/`)

```
ffmpeg-master-latest-win64-gpl-shared/
├── 📄 LICENSE.txt                  # 许可证
├── 📄 doc/                         # 文档
└── 📄 include/                     # 头文件
    ├── 📄 libavcodec/              # 编解码库
    ├── 📄 libavdevice/             # 设备库
    ├── 📄 libavfilter/             # 滤镜库
    ├── 📄 libavformat/             # 格式库
    ├── 📄 libavutil/               # 工具库
    ├── 📄 libswresample/           # 重采样库
    └── 📄 libswscale/              # 缩放库
```

#### 6. Cloudflare Worker部署 (`cloudflare-worker/`)

```
cloudflare-worker/
├── 📄 DEPLOYMENT.md               # 部署文档
└── 📄 worker.js                   # Worker脚本
```

#### 7. 文档和测试文件

```
# 核心文档
├── 📄 QUICK_START.md              # 快速开始
├── 📄 ARONA_CONFIGURATION_SUMMARY.md # Arona配置总结
├── 📄 CHARACTER_PERSONALITY_SUMMARY.md # 角色人设总结
├── 📄 FFMPEG_QUICK_INSTALL.md     # FFmpeg安装指南
├── 📄 LIBRARY_FIX_README.md       # 库修复说明
├── 📄 PRETRAINED_SOVITS_GUIDE.md  # 预训练SoVITS指南
├── 📄 SOVITS_CONFIGURATION_SUMMARY.md # SoVITS配置总结
├── 📄 SOVITS_INTEGRATION_GUIDE.md # SoVITS集成指南
├── 📄 SYSTEM_STATUS.md            # 系统状态
├── 📄 TECHNICAL_DOCUMENTATION.md  # 技术文档
├── 📄 TOOLS_INSTALLATION_GUIDE.md # 工具安装指南
├── 📄 TRAINING_AUTO_PLAY_SUMMARY.md # 训练自动播放总结
├── 📄 TTS_SETUP_GUIDE.md          # TTS设置指南
├── 📄 VOICE_CLONING_CONFIG_GUIDE.md # 语音克隆配置指南
├── 📄 VOICE_CLONING_GUIDE.md      # 语音克隆指南
├── 📄 模型下载说明.md              # 模型下载说明
└── 📄 项目结构.md                  # 项目结构说明

# 测试文件
├── 📄 test_arona_config.py        # Arona配置测试
├── 📄 test_arona_fixed.py         # Arona修复测试
├── 📄 test_frontend_backend.py    # 前后端测试
├── 📄 test_pretrained_sovits.py   # 预训练SoVITS测试
├── 📄 test_qwen_integration.py    # Qwen集成测试
├── 📄 test_sovits_inference.py    # SoVITS推理测试
├── 📄 test_sovits_only.py         # SoVITS单独测试
├── 📄 test_sovits_system.py       # SoVITS系统测试
├── 📄 test_training_workflow.py   # 训练流程测试
└── 📄 test_user_models.py         # 用户模型测试

# 工具脚本
├── 📄 check_audio_content.py      # 音频内容检查
├── 📄 copy_ffmpeg.py              # FFmpeg复制工具
├── 📄 download_models.bat         # 模型下载批处理
├── 📄 download_models.ps1         # 模型下载PowerShell
├── 📄 download_pretrained_models.py # 预训练模型下载
├── 📄 install_ffmpeg.py           # FFmpeg安装脚本
└── 📄 install_ffmpeg_files.bat    # FFmpeg文件安装批处理
```

---

## 🏗️ 技术架构

### 后端架构 (Python)

#### 核心服务器 (server.py)
- **AIVTuberServer类**：核心服务器类，处理所有WebSocket和HTTP请求
- **WebSocket处理**：实时通信，支持聊天、语音、模型控制等
- **路由系统**：RESTful API接口，提供配置、状态查询等功能
- **静态文件服务**：处理Live2D模型、音频文件等静态资源

#### 配置管理 (config.py)
- **ConfigManager类**：统一配置管理，支持YAML格式
- **多层配置合并**：默认配置 + 文件配置 + 运行时配置
- **配置验证**：确保配置项的完整性和正确性

#### 大语言模型 (llm_manager.py, qwen_client.py)
- **Qwen API集成**：通过DashScope API调用Qwen模型
- **心理医生人设**：专业心理咨询风格，禁用emoji和非正式表达
- **对话上下文管理**：维护聊天历史和上下文信息

#### 语音合成系统 (tts_manager.py, sovits_*.py)
- **多模式TTS**：支持预训练SoVITS、自定义训练、浏览器TTS
- **GPT-SoVITS集成**：高质量语音合成，支持Arona预训练模型
- **训练自动播放**：模型训练完成后自动播放训练音频
- **语音文件管理**：临时文件清理，音频格式转换

#### Live2D模型管理 (live2d_model.py)
- **模型配置**：支持表情、动作、缩放等参数
- **实时表情控制**：根据对话内容自动调整表情
- **交互响应**：点击模型触发随机表情和动作

### 前端架构 (React)

#### React应用结构
- **路由系统**：使用React Router进行页面导航
- **组件化设计**：模块化的UI组件，易于维护和扩展
- **状态管理**：使用React Hooks管理应用状态
- **实时通信**：WebSocket连接，实现实时消息交互

#### Live2D渲染 (Live2DModel.jsx)
- **PIXI.js集成**：使用PIXI.js作为渲染引擎
- **Cubism SDK**：支持Cubism 2和Cubism 4模型
- **实时交互**：响应用户操作和AI响应

#### 服务层 (services/)
- **API服务**：封装后端API调用
- **配置服务**：前端配置管理
- **语音服务**：语音识别和合成
- **模型控制**：Live2D模型操作

---

## 🔧 核心功能模块

### 1. 智能对话系统

#### 技术实现
- **Qwen API调用**：通过DashScope API调用Qwen-turbo模型
- **专业人设**：AI心理医生小雨，严格禁用emoji和非正式表达
- **上下文管理**：维护聊天历史，支持多轮对话
- **情感分析**：分析用户情绪，调整回复风格

#### 关键文件
- `src/open_llm_vtuber/qwen_client.py`：Qwen API客户端
- `src/open_llm_vtuber/llm_manager.py`：LLM管理器
- `src/open_llm_vtuber/chat_history.py`：聊天历史管理

### 2. 语音合成系统

#### 技术实现
- **GPT-SoVITS集成**：高质量语音合成，支持情感表达
- **Arona预训练模型**：使用预训练的Arona语音模型
- **自定义训练**：用户可以训练自己的语音模型
- **多模式切换**：预训练模式、自定义模式、浏览器TTS

#### 关键文件
- `src/open_llm_vtuber/tts_manager.py`：TTS管理器
- `src/open_llm_vtuber/sovits_inference_engine.py`：SoVITS推理引擎
- `src/open_llm_vtuber/pretrained_sovits_tts.py`：预训练SoVITS TTS

### 3. Live2D虚拟形象

#### 技术实现
- **PIXI.js渲染**：使用PIXI.js进行高性能渲染
- **Cubism SDK**：支持官方Cubism 2和4模型
- **实时表情**：根据对话内容自动调整表情
- **交互响应**：支持点击、拖拽等用户交互

#### 关键文件
- `src/components/Live2DModel.jsx`：Live2D模型组件
- `src/open_llm_vtuber/live2d_model.py`：Live2D模型管理
- `public/libs/`：Live2D核心库文件

### 4. 语音交互系统

#### 技术实现
- **WebRTC录音**：浏览器端语音录制
- **实时识别**：支持连续语音识别
- **语音合成**：TTS语音输出
- **语音训练**：用户可以录制语音进行模型训练

#### 关键文件
- `src/open_llm_vtuber/asr_manager.py`：语音识别管理
- `src/open_llm_vtuber/voice_api.py`：语音API接口
- `src/services/speechService.js`：前端语音服务

---

## 🗂️ 配置文件详解

### 主配置文件 (config.yaml)

```yaml
# 应用基础配置
app:
  name: "AI心理医生"
  version: "2.0.0"
  host: "0.0.0.0"
  port: 8001
  debug: true

# 角色配置 - 专业心理医生人设
character:
  name: "小雨"
  title: "AI心理医生"
  personality: "专业、温暖、理解、严谨的心理医生"
  # 详细的专业背景和沟通原则...

# Live2D模型配置
live2d:
  model_name: wuwuwu
  model_path: /path/to/model/wuwuwu.model3.json
  scale: 0.6
  expressions: # 表情配置
  auto_expression: true

# SoVITS语音合成配置
sovits:
  sovits_path: "/path/to/GPT-SoVITS"
  use_pretrained: true
  pretrained_gpt_model: "/path/to/gpt_model.ckpt"
  pretrained_sovits_model: "/path/to/sovits_model.pth"
  reference_audio: "/path/to/reference.wav"
  prompt_text: "参考音频文本"

# 大语言模型配置
llm:
  provider: qwen
  api_key: "your-api-key"
  model: qwen-turbo
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  system_prompt: |
    你是AI心理医生小雨...
    # 详细的系统提示词
```

### 前端配置 (configService.js)

```javascript
// 默认配置
const defaultConfig = {
  api: {
    baseUrl: 'http://localhost:8001',
    useStream: false,
    timeout: 30000
  },
  model: {
    defaultPath: './live2d/models/wuwuwu/wuwuwu.model3.json',
    enableExpression: true,
    enableBlinking: true,
    blinkInterval: 3000
  },
  speech: {
    enabled: true,
    voice: 'zh-CN',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  },
  ui: {
    backgroundType: 'image',
    backgroundSrc: './backgrounds/custom-bg.png',
    showDebugInfo: true
  }
};
```

---

## 🚀 部署和运行

### 环境要求

- **Python**：3.8+
- **Node.js**：16+
- **操作系统**：Windows 10/11, Linux, macOS
- **内存**：8GB+ RAM
- **显卡**：支持CUDA（推荐）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Ar1haraNaN7mI/AI-Streamer-Phy.git
   cd AI-Streamer-Phy
   ```

2. **安装Python依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **安装Node.js依赖**
   ```bash
   npm install
   ```

4. **下载预训练模型**
   ```bash
   python download_pretrained_models.py
   ```

5. **配置API密钥**
   - 编辑 `config.yaml` 文件
   - 设置你的Qwen API密钥

6. **启动系统**
   ```bash
   python run.py
   ```

7. **访问界面**
   - 打开浏览器访问：http://localhost:8001

### 开发模式

```bash
# 后端开发
python run.py

# 前端开发
npm run dev

# 构建前端
npm run build
```

---

## 🧪 测试和调试

### 测试文件概览

- **test_arona_config.py**：Arona配置测试
- **test_sovits_inference.py**：SoVITS推理测试
- **test_qwen_integration.py**：Qwen集成测试
- **test_frontend_backend.py**：前后端通信测试
- **test_training_workflow.py**：训练流程测试

### 调试功能

- **调试模式**：在config.yaml中设置debug: true
- **日志系统**：生成app.log日志文件
- **前端调试**：在LivePage中显示调试信息
- **WebSocket监控**：实时查看WebSocket消息

---

## 🔄 数据流

### 1. 用户消息处理流程

```
用户输入 → WebSocket → server.py → qwen_client.py → 
Qwen API → 回复生成 → tts_manager.py → SoVITS → 
音频生成 → 前端播放 → Live2D表情变化
```

### 2. 语音训练流程

```
用户录制音频 → voice_api.py → 音频处理 → 
SoVITS训练 → 模型保存 → 自动播放测试 → 
前端状态更新
```

### 3. Live2D交互流程

```
用户操作 → 前端事件 → WebSocket → live2d_model.py → 
表情/动作处理 → 前端渲染更新
```

---

## 📊 性能特点

### 优化策略

- **异步处理**：使用aiohttp和asyncio实现高并发
- **连接池**：复用WebSocket连接，减少开销
- **缓存机制**：配置缓存，减少文件读取
- **资源优化**：Live2D模型压缩，音频格式优化

### 扩展能力

- **模块化设计**：各功能模块独立，易于扩展
- **插件系统**：支持自定义TTS和LLM提供商
- **API接口**：提供完整的RESTful API
- **配置灵活**：支持运行时配置修改

---

## 🔧 维护和更新

### 日常维护

- **日志监控**：定期查看app.log文件
- **模型更新**：更新预训练模型和用户模型
- **配置优化**：根据使用情况调整配置参数
- **依赖更新**：定期更新Python和Node.js依赖

### 故障排除

- **连接问题**：检查WebSocket连接状态
- **语音问题**：验证SoVITS模型文件
- **模型问题**：检查Live2D模型文件完整性
- **API问题**：验证Qwen API密钥和网络连接

---

## 📝 总结

AI心理医生项目是一个功能完整的AI虚拟人系统，集成了现代Web技术、AI语言模型、语音合成、Live2D渲染等多项技术。项目采用模块化设计，易于维护和扩展，为用户提供专业的心理咨询服务体验。

**关键技术栈：**
- 后端：Python + aiohttp + WebSocket
- 前端：React + Vite + PIXI.js
- AI：Qwen大语言模型 + GPT-SoVITS语音合成
- 渲染：Live2D + Cubism SDK
- 部署：本地部署 + Cloudflare Worker

**项目特色：**
- 专业心理医生人设，严格的沟通规范
- 高质量语音合成，支持情感表达
- 实时Live2D交互，增强用户体验
- 完整的训练工作流，支持个性化定制
- 丰富的配置选项，灵活的部署方案

该项目为AI虚拟人技术在专业领域的应用提供了完整的解决方案。