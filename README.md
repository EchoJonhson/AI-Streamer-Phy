# AI心理医生 - 虚拟数字人心理疏导师

一个基于GPT-SoVITS和Live2D技术的AI心理医生系统，提供专业的心理咨询服务。

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
- 显卡支持（推荐）

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

6. **访问系统**
打开浏览器访问：http://localhost:8001

## 📁 项目结构

```
AI-Streamer-Phy/
├── src/open_llm_vtuber/     # 核心后端代码
├── public/                  # 前端静态文件
├── GPT-SoVITS/             # GPT-SoVITS语音合成
├── config.yaml             # 配置文件
├── run.py                  # 主启动文件
└── README.md              # 项目说明
```

## ⚙️ 配置说明

### 主要配置项

- **角色配置**：AI心理医生小雨的人设和性格
- **语音合成**：SoVITS模型路径和参数
- **大语言模型**：Qwen API配置
- **Live2D模型**：虚拟形象配置

### 人设特点

- 专业、温暖、理解的心理医生
- 擅长认知行为疗法和积极心理学
- 严格禁止使用emoji和颜文字
- 保持专业客观的咨询态度

## 🎯 功能特性

### 1. 智能对话
- 基于Qwen大模型的自然语言理解
- 专业的心理咨询回复
- 50字以内的简洁回答

### 2. 语音合成
- 本地GPT-SoVITS语音合成
- 高质量、自然的语音输出
- 支持自定义语音训练

### 3. 语音识别
- 实时语音输入识别
- 支持中文语音识别
- 自动转换为文字

### 4. 虚拟形象
- Live2D虚拟形象
- 表情和动作同步
- 可自定义外观

### 5. 训练功能
- 自定义语音模型训练
- 训练完成后自动播放
- 支持多种训练模式

## 🔧 使用指南

### 基本使用

1. **启动系统**：运行 `python run.py`
2. **选择语音模式**：在界面中选择合适的语音模式
3. **开始对话**：通过文字或语音与AI心理医生交流
4. **测试语音**：点击测试按钮验证语音效果

### 语音训练

1. **准备音频**：准备高质量的语音样本
2. **开始训练**：点击"开始训练"按钮
3. **等待完成**：训练完成后会自动播放效果
4. **切换模式**：使用训练好的模型进行语音合成

### 配置调整

- **修改人设**：编辑 `config.yaml` 中的角色配置
- **调整语音参数**：修改SoVITS相关配置
- **更换模型**：替换预训练模型文件

## 📚 技术文档

- [技术文档](TECHNICAL_DOCUMENTATION.md) - 详细的技术实现说明
- [快速开始指南](QUICK_START.md) - 快速部署指南
- [语音克隆指南](VOICE_CLONING_GUIDE.md) - 语音训练教程
- [SoVITS集成指南](SOVITS_INTEGRATION_GUIDE.md) - SoVITS配置说明

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发环境设置

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS) - 语音合成技术
- [Live2D](https://www.live2d.com/) - 虚拟形象技术
- [Qwen](https://github.com/QwenLM/Qwen) - 大语言模型

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交Issue](https://github.com/Ar1haraNaN7mI/AI-Streamer-Phy/issues)
- 项目主页: [AI-Streamer-Phy](https://github.com/Ar1haraNaN7mI/AI-Streamer-Phy)

---

**注意**：本项目仅供学习和研究使用，不构成专业的心理咨询服务。如有心理健康问题，请寻求专业心理咨询师的帮助。


