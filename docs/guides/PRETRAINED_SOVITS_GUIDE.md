# 预训练SoVITS语音合成使用指南

## 🎯 概述

本系统现已支持直接使用预训练好的SoVITS模型，无需重新训练即可获得高质量的个性化语音合成。

## ✨ 功能特点

- **直接使用预训练模型**: 支持 GPT 权重(.ckpt格式) + SoVITS 权重(.pth格式)
- **多模型支持**: 可选择不同的训练时期模型
- **高质量语音**: 使用已优化的训练模型，音质更佳
- **无需训练**: 跳过耗时的训练过程，即开即用
- **参考音频**: 支持语音克隆功能

## 🔧 配置说明

### 1. 模型配置

在 `config.yaml` 中配置预训练模型：

```yaml
sovits:
  # 启用预训练模式
  use_pretrained: true
  
  pretrained_models:
    # GPT模型权重路径 (.ckpt格式)
    gpt_weights_path: "audio_files/中配数据集制/GPT_weights_v2/ALuoNa_cn-e15.ckpt"
    # SoVITS模型权重路径 (.pth格式)  
    sovits_weights_path: "audio_files/中配数据集制/SoVITS_weights_v2/ALuoNa_cn_e16_s256.pth"
    # 模型版本
    version: "v2"
  
  # 参考音频设置（用于语音克隆）
  reference_audio:
    ref_audio_path: "audio_files/reference_audio.wav"
    prompt_text: "你好，我是小雨，你们的AI虚拟主播！"
    prompt_lang: "zh"
```

### 2. 可用模型文件

当前可用的预训练模型：

**GPT权重模型** (audio_files/中配数据集制/GPT_weights_v2/):
- `ALuoNa_cn-e5.ckpt` - 训练5轮
- `ALuoNa_cn-e10.ckpt` - 训练10轮  
- `ALuoNa_cn-e15.ckpt` - 训练15轮 (推荐)

**SoVITS权重模型** (audio_files/中配数据集制/SoVITS_weights_v2/):
- `ALuoNa_cn_e4_s64.pth` - 4轮64步
- `ALuoNa_cn_e8_s128.pth` - 8轮128步
- `ALuoNa_cn_e12_s192.pth` - 12轮192步
- `ALuoNa_cn_e16_s256.pth` - 16轮256步 (推荐)

### 3. 推理参数调整

```yaml
sovits:
  inference:
    temperature: 0.6      # 生成随机性 (0.1-1.0)
    top_p: 0.9           # nucleus采样 (0.1-1.0)
    top_k: 5             # top-k采样 (1-20)
    speed: 1.0           # 语速控制 (0.5-2.0)
    text_lang: "zh"      # 文本语言
    sample_steps: 32     # 采样步数 (16-64)
    super_sampling: false # 是否启用超采样
```

## 🚀 使用方法

### 1. 基础设置

1. 确保模型文件在正确路径
2. 在 `config.yaml` 中设置 `use_pretrained: true`
3. 配置正确的模型路径

### 2. 参考音频准备

为获得最佳语音克隆效果，需要准备参考音频：

1. **音频要求**:
   - 格式: WAV、MP3、M4A等
   - 长度: 3-10秒
   - 质量: 清晰、无噪音
   - 内容: 单人语音

2. **放置位置**: `audio_files/reference_audio.wav`

3. **配置对应文本**: 在配置中设置 `prompt_text` 为音频内容的文字

### 3. 启动系统

```bash
python run.py
```

系统启动时会自动：
- 检测预训练模式配置
- 加载指定的GPT和SoVITS模型
- 初始化语音合成引擎
- 切换到预训练SoVITS模式

## 📊 状态监控

### 1. 启动日志

成功启动时会显示：
```
✅ 预训练SoVITS模型初始化成功
🎭 模型版本: v2
📄 GPT模型: ALuoNa_cn-e15.ckpt
🎵 SoVITS模型: ALuoNa_cn_e16_s256.pth
```

### 2. TTS状态查询

系统提供状态查询接口，包含：
- 模型初始化状态
- 当前使用的模型文件
- 参考音频配置
- 推理参数设置

## 🔄 模型切换

### 1. 修改配置文件

可以通过修改 `config.yaml` 中的模型路径来切换不同的预训练模型：

```yaml
# 切换到其他模型
gpt_weights_path: "audio_files/中配数据集制/GPT_weights_v2/ALuoNa_cn-e10.ckpt"
sovits_weights_path: "audio_files/中配数据集制/SoVITS_weights_v2/ALuoNa_cn_e12_s192.pth"
```

### 2. 重启应用

修改配置后需要重启应用以加载新模型。

## ⚠️ 注意事项

### 1. 系统要求

- Python 3.7+
- 足够的内存 (建议8GB+)
- 模型文件总大小约 230MB

### 2. 兼容性

- 保持与原有训练模式的兼容性
- 如果预训练模式失败，会自动回退到浏览器TTS
- 支持与其他TTS提供商的无缝切换

### 3. 性能优化

- CPU模式运行，适用于大多数环境
- 首次加载模型可能需要一些时间
- 建议使用SSD存储模型文件以提高加载速度

## 🐛 故障排除

### 1. 模型文件不存在

```
❌ GPT模型文件不存在: xxx.ckpt
```

**解决方案**: 检查文件路径是否正确，确保模型文件存在

### 2. 初始化失败

```
⚠️ 预训练SoVITS初始化失败，回退到浏览器TTS
```

**解决方案**: 
1. 检查模型文件完整性
2. 确认Python环境和依赖
3. 查看详细错误日志

### 3. 合成失败

```
❌ 语音合成失败：返回数据为空
```

**解决方案**:
1. 检查参考音频设置
2. 验证输入文本格式
3. 调整推理参数

## 📞 技术支持

如遇到问题，请查看：
1. 应用日志文件 `app.log`
2. 检查模型文件完整性
3. 验证配置文件格式

---

通过以上配置，您就可以直接使用高质量的预训练SoVITS模型进行语音合成，无需耗时的训练过程！ 