# 项目脚本目录

这个目录包含了AI-Streamer-Phy项目的所有脚本工具。

## 脚本说明

### Python脚本
- `run.py` - 主程序启动脚本
- `check_audio_content.py` - 音频内容检查脚本
- `copy_ffmpeg.py` - FFmpeg文件复制脚本
- `download_pretrained_models.py` - 预训练模型下载脚本
- `install_ffmpeg.py` - FFmpeg安装脚本

### 批处理脚本
- `download_models.bat` - Windows批处理模型下载脚本
- `download_models.ps1` - PowerShell模型下载脚本
- `install_ffmpeg_files.bat` - Windows批处理FFmpeg安装脚本

## 使用方法

### 启动应用
```bash
cd scripts
python run.py
```

### 安装FFmpeg
```bash
cd scripts
python install_ffmpeg.py
```

### 下载预训练模型
```bash
cd scripts
python download_pretrained_models.py
```

### 音频内容检查
```bash
cd scripts
python check_audio_content.py
```

## 注意事项

- 所有脚本都已适配新的目录结构
- 脚本中的路径引用已更新为相对于项目根目录
- 运行脚本前请确保在正确的目录中执行