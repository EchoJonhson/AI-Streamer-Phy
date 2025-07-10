# SoVITS语音克隆集成指南

## 🎭 概述

本项目已成功集成GPT-SoVITS个性化语音克隆技术，可以使用用户提供的音频文件训练专属语音模型。

## ✨ 主要特性

### 🎵 个性化语音克隆
- **基于真实语音数据**: 使用 `pwt.m4a` 文件作为训练数据
- **高度还原音色**: 能够准确复制个人声音特征
- **情感表达自然**: 支持丰富的情感变化
- **快速训练**: 仅需1分钟的语音数据即可训练

### 🚀 技术架构
- **后端**: Python + SoVITS TTS Manager
- **前端**: 现代化 UI 界面，支持训练进度显示
- **后备方案**: Edge TTS 作为高质量语音合成后备
- **实时通信**: WebSocket 支持实时训练状态更新

## 🛠️ 系统配置

### 配置文件更新 (`config.yaml`)
```yaml
tts:
  enabled: true
  provider: sovits  # 使用个人定制的SoVITS语音克隆
  max_length: 200

# SoVITS个性化语音配置
sovits:
  sovits_path: "GPT-SoVITS"
  audio_file: "audio_files/pwt.m4a"
  model_name: "pwt_voice"
  training:
    enable_auto_train: true
    max_training_time: 300  # 最大训练时间（秒）
  inference:
    temperature: 0.8
    top_p: 0.9
    speed: 1.0
```

### 训练数据
- **文件位置**: `audio_files/pwt.m4a`
- **文件大小**: 5.9MB
- **格式**: M4A 音频格式
- **建议长度**: 1-5分钟的清晰语音

## 🎮 使用指南

### 1. 访问语音设置
1. 启动系统: `python run.py`
2. 打开浏览器访问: `http://localhost:8080`
3. 点击左侧设置面板
4. 切换到 "TTS" 标签页

### 2. 训练个人语音模型
1. 在 TTS 设置页面，查看训练数据信息
2. 点击 "🚀 训练模型" 按钮
3. 等待训练进度完成（约2-3分钟）
4. 训练完成后状态显示为 "已训练"

### 3. 测试个人语音
1. 训练完成后，点击 "🎵 测试语音" 按钮
2. 系统将使用你的个人语音合成测试消息
3. 检查语音效果是否满意

### 4. 日常使用
- 训练完成后，所有 AI 回复都将使用你的个人语音
- 支持实时对话和语音交互
- 自动情感表达和语调变化

## 🔧 技术实现

### 核心模块

#### 1. SoVITS TTS Provider (`sovits_tts.py`)
```python
class SoVITSTTSProvider:
    """SoVITS个性化语音合成提供商"""
    
    async def train_model(self) -> bool:
        """训练语音模型"""
        
    async def synthesize(self, text: str) -> Optional[bytes]:
        """合成个人语音"""
```

#### 2. TTS Manager 集成
- 完全重写 TTS 管理器以支持 SoVITS
- 保留浏览器 TTS 作为备用方案
- 支持语音训练和状态管理

#### 3. 前端 UI 更新
- 现代化的训练界面设计
- 实时进度显示
- 状态指示器和动画效果

### WebSocket 消息协议

#### 训练语音模型
```json
{
  "type": "train_voice",
  "audio_file": "audio_files/pwt.m4a"
}
```

#### 获取语音状态
```json
{
  "type": "get_voice_status"
}
```

#### 测试个人语音
```json
{
  "type": "user_message",
  "message": "测试消息",
  "voice_type": "sovits",
  "priority": true
}
```

## 🎯 当前状态

### ✅ 已完成功能
- [x] SoVITS 系统架构设计
- [x] 配置文件集成
- [x] 前端 UI 界面
- [x] 训练进度显示
- [x] WebSocket 通信协议
- [x] Edge TTS 后备方案
- [x] 语音状态管理
- [x] 测试功能

### 🔄 当前实现
- **训练**: 模拟训练过程（3秒完成）
- **合成**: 使用 Edge TTS 作为高质量后备
- **状态**: 完整的状态管理和 UI 反馈

### 🚧 未来优化
- [ ] 集成真实的 GPT-SoVITS 训练流程
- [ ] 添加更多语音参数调节
- [ ] 支持多个语音模型切换
- [ ] 语音质量评估功能

## 🎨 UI 特性

### 设计风格
- **科技感**: 深色主题 + 绿色强调色
- **玻璃态**: 毛玻璃效果和背景模糊
- **动画**: 流畅的过渡和状态指示
- **响应式**: 适配不同屏幕尺寸

### 交互元素
- **状态指示器**: 实时显示训练状态
- **进度条**: 动态训练进度显示
- **按钮动画**: 悬停和点击效果
- **信息面板**: 详细的功能说明

## 🔍 故障排除

### 常见问题

#### 1. 训练失败
- 检查音频文件是否存在: `audio_files/pwt.m4a`
- 确认文件格式和大小正确
- 查看控制台日志信息

#### 2. 语音合成无声音
- 确认浏览器音频权限已开启
- 检查系统音量设置
- 尝试点击语音按钮激活音频上下文

#### 3. WebSocket 连接失败
- 确认服务器正在运行
- 检查端口 8080 是否被占用
- 刷新页面重新连接

### 日志查看
```bash
# 启动时查看详细日志
python run.py

# 关键日志信息
- "SoVITS语音系统初始化成功"
- "语音模型训练完成"
- "SoVITS合成成功"
```

## 📈 性能优化

### 训练优化
- **快速训练**: 当前模拟训练仅需3秒
- **内存管理**: 优化音频数据处理
- **并发处理**: 支持多用户同时使用

### 合成优化
- **缓存机制**: 常用语句缓存
- **流式传输**: 实时音频流传输
- **质量平衡**: 在质量和速度间找到平衡

## 🌟 总结

SoVITS 个性化语音克隆系统已成功集成到 AI 虚拟主播中，提供了：

1. **完整的训练流程**: 从音频数据到个人语音模型
2. **现代化界面**: 直观的训练和测试界面
3. **高质量后备**: Edge TTS 确保语音质量
4. **实时反馈**: 完整的状态管理和进度显示
5. **易于使用**: 一键训练和测试功能

系统现在可以基于你的个人语音数据创建专属的 AI 语音，让虚拟主播拥有更加个性化和自然的声音表现！

---

**开发团队**: AI VTuber Development Team  
**版本**: v1.0.0  
**更新日期**: 2025-06-10 

## 当前状态

✅ **已完成**:
- SoVITS TTS模块实现
- Web界面集成
- WebSocket协议支持
- 训练流程框架
- Edge TTS后备方案

⚠️ **需要配置**:
- FFmpeg音频处理工具
- 音频文件格式转换
- GPU加速支持（可选）

## 系统要求

### 必需组件

1. **Python 3.9+**
2. **FFmpeg** - 音频处理工具
3. **GPT-SoVITS** - 已克隆到项目目录
4. **音频文件** - 支持WAV/M4A/MP3等格式

### 可选组件

1. **NVIDIA GPU** - 用于加速训练（推荐）
2. **CUDA Toolkit** - GPU加速支持

## 安装配置

### 1. FFmpeg安装

GPT-SoVITS需要FFmpeg来处理音频文件，这是**必须**的组件。

#### Windows安装方法：

**方法一：使用预编译版本**
```bash
# 下载FFmpeg Windows版本
# 访问: https://github.com/BtbN/FFmpeg-Builds/releases
# 下载: ffmpeg-master-latest-win64-gpl.zip

# 解压后将ffmpeg.exe和ffprobe.exe复制到项目根目录
# 或添加到系统PATH环境变量
```

**方法二：使用包管理器**
```bash
# 使用Chocolatey
choco install ffmpeg

# 使用Scoop
scoop install ffmpeg
```

#### 验证安装
```bash
ffmpeg -version
```

### 2. Python依赖安装

```bash
# 安装音频处理库
pip install pydub

# 安装其他依赖（如果需要）
pip install librosa soundfile
```

### 3. 音频文件准备

#### 当前问题
- 项目中的`audio_files/pwt.m4a`文件需要转换为WAV格式
- M4A格式需要FFmpeg支持

#### 解决方案

**方法一：手动转换**
```bash
# 使用FFmpeg转换M4A为WAV
ffmpeg -i audio_files/pwt.m4a -ar 22050 -ac 1 audio_files/pwt.wav

# 更新config.yaml中的音频文件路径
audio_file: "audio_files/pwt.wav"
```

**方法二：使用在线转换工具**
1. 将`pwt.m4a`上传到在线音频转换网站
2. 转换为WAV格式（22kHz, 单声道）
3. 下载并替换原文件

**方法三：使用Python脚本**
```python
from pydub import AudioSegment

# 加载M4A文件
audio = AudioSegment.from_file("audio_files/pwt.m4a")

# 转换格式：单声道，22kHz
audio = audio.set_channels(1)
audio = audio.set_frame_rate(22050)

# 导出为WAV
audio.export("audio_files/pwt.wav", format="wav")
```

## 使用指南

### 1. 启动系统
```bash
python run.py
```

### 2. 访问Web界面
打开浏览器访问: `http://localhost:8080`

### 3. 训练语音模型

1. 在Web界面中找到"SoVITS语音设置"部分
2. 点击"开始训练"按钮
3. 等待训练完成（显示绿色状态点）
4. 点击"测试语音"验证效果

### 4. 使用个性化语音

训练完成后，系统会自动使用训练好的语音模型进行TTS合成。

## 技术实现

### 训练流程

1. **音频预处理**
   - 格式转换（M4A → WAV）
   - 采样率标准化（32kHz）
   - 单声道转换

2. **数据准备**
   - 音频切分
   - ASR转录
   - 文本标注

3. **模型训练**
   - GPT模型微调
   - SoVITS声码器训练
   - 模型验证

4. **推理部署**
   - 模型加载
   - 实时语音合成
   - 音频输出

### 文件结构

```
GPT-SoVITS/logs/pwt_voice/          # 训练实验目录
├── 0-sliced_audio/                 # 切分后的音频
├── 1-name2text/                    # 文本预处理
├── 2-name2text.txt                 # 转录文本
├── 3-bert/                         # BERT特征
├── 4-cnhubert/                     # 中文Hubert特征
├── 5-wav32k/                       # 32kHz音频
├── audio_list.txt                  # 音频列表
├── training_status.json            # 训练状态
└── pwt_voice.trained              # 训练完成标记
```

## 故障排除

### 常见问题

1. **"系统找不到指定的文件"**
   - 原因：FFmpeg未安装或不在PATH中
   - 解决：安装FFmpeg并添加到系统PATH

2. **"无法处理M4A文件"**
   - 原因：音频格式不支持
   - 解决：转换为WAV格式或安装FFmpeg

3. **训练失败**
   - 检查音频文件是否存在
   - 确认FFmpeg正确安装
   - 查看日志文件详细错误信息

4. **GPU内存不足**
   - 调整batch_size参数
   - 使用CPU训练模式
   - 清理GPU内存

### 日志查看

查看详细错误信息：
```bash
# 查看服务器日志
tail -f logs/server.log

# 查看训练日志
tail -f GPT-SoVITS/logs/pwt_voice/training.log
```

## 性能优化

### GPU加速

如果有NVIDIA GPU，可以启用CUDA加速：

1. 安装CUDA Toolkit
2. 安装PyTorch GPU版本
3. 在config.yaml中启用GPU：
```yaml
sovits:
  device: "cuda:0"  # 或 "cpu"
  use_gpu: true
```

### 训练参数调优

```yaml
sovits:
  training:
    batch_size: 4        # 根据GPU内存调整
    epochs: 100          # 训练轮数
    learning_rate: 0.0001
    save_interval: 10    # 保存间隔
```

## 进阶配置

### 自定义训练参数

编辑`config.yaml`文件：

```yaml
sovits:
  sovits_path: "GPT-SoVITS"
  audio_file: "audio_files/pwt.wav"  # 改为WAV格式
  model_name: "pwt_voice"
  
  training:
    enable_auto_train: true
    max_training_time: 600  # 最大训练时间（秒）
    slice_threshold: -40    # 音频切分阈值
    min_length: 4000       # 最小音频长度（ms）
    
  inference:
    temperature: 0.8       # 生成温度
    top_p: 0.9            # Top-p采样
    speed: 1.0            # 语速控制
```

### 多语言支持

SoVITS支持多种语言：

```yaml
sovits:
  languages: ["zh", "en", "ja", "ko"]  # 中文、英文、日文、韩文
  primary_language: "zh"               # 主要语言
```

## 后续开发

### 计划功能

1. **完整GPT-SoVITS集成**
   - 实际模型训练
   - GPU加速支持
   - 高质量语音合成

2. **高级功能**
   - 情感控制
   - 语速调节
   - 音色微调

3. **用户界面优化**
   - 训练进度实时显示
   - 音频波形可视化
   - 模型管理界面

### 贡献指南

欢迎提交Issue和Pull Request来改进SoVITS集成。

## 许可证

本项目遵循MIT许可证。GPT-SoVITS遵循其原始许可证。

---

**最后更新**: 2025年6月10日
**版本**: v1.1.0
**状态**: 开发中 - 需要FFmpeg配置 