# 语音克隆配置指南

## 📖 概述
本指南将帮助您完成语音克隆的配置，特别是如何正确设置参考音频和对应的文本内容。

## 🔧 当前配置状态

您的配置文件已经整理完毕，但需要您完成最后一步：**设置正确的prompt_text**

### 当前配置
- **音频文件**: `audio_files/pwt.wav` ✅
- **文本内容**: 需要您填入与音频内容一致的文本 ❌

## 📝 配置步骤

### 步骤1：确认音频内容
首先，您需要听取 `audio_files/pwt.wav` 文件，了解其中说的具体内容。

### 步骤2：修改配置文件
在 `config.yaml` 文件中找到以下部分：

```yaml
reference_audio:
  ref_audio_path: "audio_files/pwt.wav"
  prompt_text: "这里请填入与pwt.wav音频文件内容完全一致的文本"
```

将 `prompt_text` 后面的内容替换为您音频文件中的实际内容。

### 步骤3：文本要求
- 文本必须与音频内容**完全一致**
- 包括标点符号和语气词
- 建议长度：10-50个字符
- 避免过长的文本（超过100字符）

## 💡 示例配置

### 示例1：简短问候
```yaml
reference_audio:
  ref_audio_path: "audio_files/pwt.wav"
  prompt_text: "你好，我是小雨，很高兴见到大家！"
  prompt_lang: "zh"
```

### 示例2：自我介绍
```yaml
reference_audio:
  ref_audio_path: "audio_files/pwt.wav"
  prompt_text: "大家好，我是你们的AI虚拟主播小雨。"
  prompt_lang: "zh"
```

## ⚙️ 高级配置选项

### 音频质量设置
```yaml
reference_audio:
  audio_quality: "high"      # high/medium/low
  noise_reduction: true      # 降噪处理
  voice_conversion: true     # 语音转换
```

### 推理参数调节
```yaml
inference:
  temperature: 0.6          # 生成随机性 (0.1-1.0)
  top_p: 0.9               # 核采样参数 (0.1-1.0)  
  speed: 1.0               # 语速倍率 (0.5-2.0)
  sample_steps: 32         # 采样步数 (16-64)
```

## 🎯 参数说明

### 基础参数
| 参数 | 说明 | 推荐值 | 范围 |
|------|------|--------|------|
| `temperature` | 生成随机性，越高越有变化 | 0.6 | 0.1-1.0 |
| `top_p` | 核采样，控制词汇选择范围 | 0.9 | 0.1-1.0 |
| `speed` | 语速倍率，1.0为正常速度 | 1.0 | 0.5-2.0 |
| `sample_steps` | 采样精度，越高质量越好 | 32 | 16-64 |

### 高级参数
| 参数 | 说明 | 推荐值 | 范围 |
|------|------|--------|------|
| `repetition_penalty` | 重复词汇惩罚 | 1.2 | 1.0-2.0 |
| `length_penalty` | 长度控制 | 1.0 | 0.5-2.0 |

## 🚀 测试配置

配置完成后，您可以运行测试：

```bash
python test_pretrained_sovits.py
```

## ❓ 常见问题

### Q1: 音频和文本不匹配怎么办？
**A**: 重新听取音频，确保文本内容与语音完全一致，包括语气词和标点。

### Q2: 生成的语音质量不好？
**A**: 尝试调整以下参数：
- 提高 `sample_steps` 到 48 或 64
- 调整 `temperature` 到 0.4-0.8
- 确保原始音频质量良好

### Q3: 语速太快或太慢？
**A**: 修改 `speed` 参数：
- 慢一点：0.8
- 快一点：1.2

### Q4: 语音听起来机械？
**A**: 尝试：
- 降低 `repetition_penalty` 到 1.1
- 提高 `temperature` 到 0.7-0.8
- 检查原始音频是否自然

## 📞 需要帮助？

如果您在配置过程中遇到问题，请：
1. 检查音频文件是否存在且可播放
2. 确认文本内容与音频完全匹配
3. 尝试不同的参数组合
4. 查看系统日志获取错误信息

---

**重要提醒**: 语音克隆效果很大程度上取决于参考音频的质量。建议使用清晰、无噪音、3-10秒长度的音频文件。 