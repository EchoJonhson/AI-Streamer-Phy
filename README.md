# AI心理医生 - 虚拟数字人心理疏导师小雨

基于GPT-SoVITS和Live2D技术的AI心理医生系统，提供专业的心理咨询服务。

## 🌟 项目特色

- **专业心理医生人设**：AI心理医生小雨，具备专业的心理咨询背景
- **高质量语音合成**：基于GPT-SoVITS的本地语音合成，声音自然专业
- **Live2D虚拟形象**：可爱的虚拟形象，增强交互体验
- **实时语音交互**：支持语音输入和语音输出
- **智能对话系统**：基于Qwen大模型的智能对话
- **训练完成自动播放**：训练完成后自动播放训练音频

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Windows 10/11
- 8GB+ RAM
- 显卡支持CUDA（推荐）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Ar1haraNaN7mI/AI-Streamer-Phy.git
cd AI-Streamer-Phy
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **下载预训练模型**
```bash
python download_pretrained_models.py
```

4. **配置API密钥**
编辑 `config.yaml` 文件，设置你的Qwen API密钥：
```yaml
llm:
  api_key: "your-qwen-api-key-here"
```

5. **启动系统**
```bash
python run.py
```

6. **访问界面**
打开浏览器访问：http://localhost:8001

## 📁 项目结构

```
AI-Streamer-Phy/
├── src/                    # 源代码
│   └── open_llm_vtuber/   # 核心功能模块
├── public/                 # 前端界面
├── GPT-SoVITS/            # GPT-SoVITS语音合成
├── config.yaml            # 配置文件
├── run.py                 # 启动脚本
└── requirements.txt       # 依赖列表
```

## 🎯 核心功能

### 1. 智能对话系统
- 基于Qwen大模型的智能对话
- 专业的心理医生人设
- 严格禁止使用emoji和颜文字
- 保持专业、温暖、理解的沟通风格

### 2. 高质量语音合成
- 基于GPT-SoVITS的本地语音合成
- 支持预训练模型和自定义训练
- 训练完成后自动播放音频
- 多种语音模式切换

### 3. Live2D虚拟形象
- 可爱的虚拟形象小雨
- 实时表情变化
- 支持模型缩放和位置调整
- 响应式交互

### 4. 语音交互
- 支持语音输入识别
- 实时语音合成输出
- 多种语音模式选择
- 语音参数调节

## ⚙️ 配置说明

### 主要配置项

```yaml
# 角色配置
character:
  name: "小雨"
  title: "AI心理医生"
  personality: "专业、温暖、理解、严谨的心理医生"

# 大语言模型配置
llm:
  provider: qwen
  api_key: "your-api-key"
  model: qwen-turbo

# 语音合成配置
tts:
  provider: sovits
  max_length: 200
```

### 语音模式

1. **预训练SoVITS模式**：使用预训练的Arona语音模型
2. **浏览器TTS模式**：使用系统默认语音
3. **自定义训练模式**：使用用户训练的语音模型

## 🎮 使用指南

### 基本操作

1. **启动系统**：运行 `python run.py`
2. **访问界面**：打开浏览器访问 http://localhost:8001
3. **开始对话**：在聊天框中输入消息或使用语音输入
4. **测试语音**：点击测试按钮听语音效果
5. **切换模式**：在侧边栏选择不同的语音模式

### 语音训练

1. **准备音频**：将训练音频放入 `audio_files/` 目录
2. **开始训练**：在侧边栏点击"开始训练"
3. **等待完成**：训练完成后会自动播放训练音频
4. **切换模式**：切换到"自定义训练模型"模式使用

### 模型配置

1. **调整参数**：在侧边栏调整语音参数
2. **模型缩放**：调整Live2D模型大小
3. **位置调整**：调整模型在界面中的位置
4. **背景设置**：设置自定义背景图片

## 🔧 技术架构

### 后端技术栈
- **Python 3.8+**：主要开发语言
- **aiohttp**：异步Web框架
- **WebSocket**：实时通信
- **GPT-SoVITS**：语音合成引擎
- **Qwen API**：大语言模型

### 前端技术栈
- **HTML5/CSS3/JavaScript**：基础前端技术
- **Live2D**：虚拟形象渲染
- **PIXI.js**：图形渲染引擎
- **WebSocket**：实时通信

### 核心模块
- **LLM管理器**：大语言模型接口
- **TTS管理器**：语音合成管理
- **ASR管理器**：语音识别管理
- **Live2D管理器**：虚拟形象管理

## 📝 开发说明

### 添加新功能

1. **后端功能**：在 `src/open_llm_vtuber/` 中添加新模块
2. **前端功能**：在 `public/` 中修改HTML/JS文件
3. **配置更新**：在 `config.yaml` 中添加新配置项

### 调试模式

设置 `config.yaml` 中的 `debug: true` 启用调试模式：
```yaml
app:
  debug: true
```

### 日志查看

系统运行时会生成 `app.log` 日志文件，包含详细的运行信息。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) - 语音合成引擎
- [Live2D](https://www.live2d.com/) - 虚拟形象技术
- [Qwen](https://github.com/QwenLM/Qwen) - 大语言模型
- [aiohttp](https://github.com/aio-libs/aiohttp) - 异步Web框架

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues：[GitHub Issues](https://github.com/Ar1haraNaN7mI/AI-Streamer-Phy/issues)
- 邮箱：请通过GitHub Issues联系

---

**注意**：本项目仅供学习和研究使用，请勿用于商业用途。使用前请确保遵守相关法律法规和平台政策。


