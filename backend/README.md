# AI心理医生 - 后端服务模块

## 📁 目录结构

```
backend/
├── core/               # 核心服务模块
│   ├── server.py       # 主服务器和WebSocket处理
│   ├── config.py       # 配置管理
│   ├── routes.py       # 路由系统
│   └── websocket_handler.py # WebSocket处理器
├── ai/                 # AI智能系统
│   ├── llm_manager.py  # LLM管理器
│   ├── qwen_client.py  # Qwen API客户端
│   ├── chat_history.py # 聊天历史管理
│   └── conversations/  # 对话管理
├── voice/              # 语音系统
│   ├── tts_manager.py  # TTS管理器
│   ├── asr_manager.py  # ASR管理器
│   ├── voice_api.py    # 语音API接口
│   ├── sovits_inference_engine.py # SoVITS推理引擎
│   ├── pretrained_sovits_tts.py # 预训练SoVITS TTS
│   └── voice_cloning/  # 语音克隆功能
├── live2d/             # Live2D模型管理
│   ├── live2d_model.py # Live2D模型管理
│   └── model_controller.py # 模型控制器
└── utils/              # 工具模块
    ├── service_context.py # 服务上下文
    ├── vad/            # 语音活动检测
    └── translate/      # 翻译功能
```

## 🎯 模块说明

### core/ - 核心服务模块
负责应用的基础设施，包括服务器、配置管理、路由系统等。

### ai/ - AI智能系统
处理所有与AI相关的功能，包括大语言模型管理、对话处理、聊天历史等。

### voice/ - 语音系统
统一管理语音相关功能，包括TTS、ASR、语音合成、语音克隆等。

### live2d/ - Live2D模型管理
负责Live2D虚拟形象的管理、表情控制、动作处理等。

### utils/ - 工具模块
提供各种工具函数和辅助功能。

## 🔧 使用说明

重构后的后端模块更加模块化和清晰，每个模块都有明确的职责：

1. **导入模块**：使用新的包结构导入模块
2. **配置管理**：所有配置通过core.config统一管理
3. **服务启动**：通过core.server启动主服务
4. **功能扩展**：在相应的模块中添加新功能

## 🚀 重构进展

- [x] 创建目录结构框架
- [ ] 迁移核心服务模块
- [ ] 迁移AI智能系统
- [ ] 迁移语音系统
- [ ] 迁移Live2D模块
- [ ] 更新导入路径
- [ ] 功能测试验证