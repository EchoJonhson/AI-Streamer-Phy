# 🛠️ SoVITS依赖工具安装指南

## 📋 必需工具清单

为了让SoVITS语音训练系统正常工作，您需要安装以下工具：

### 1. FFmpeg（音频处理工具）
**用途**: 音频格式转换、音质优化、音频切分等
**重要性**: ⭐⭐⭐⭐⭐（强烈推荐）

### 2. Python音频处理库
**用途**: Python环境下的音频处理
**重要性**: ⭐⭐⭐⭐（推荐）

---

## 🔧 安装方法

### 方法一：自动安装（推荐）

在项目根目录运行：
```bash
python install_ffmpeg.py
```

如果自动安装失败，请使用以下手动方法：

---

### 方法二：手动安装FFmpeg

#### Windows系统：

**选项A：使用官方下载（推荐）**
1. 访问 FFmpeg官网：https://ffmpeg.org/download.html
2. 点击 "Windows" → "Windows builds by BtbN"
3. 下载 `ffmpeg-master-latest-win64-gpl.zip`
4. 解压到任意文件夹
5. 将 `ffmpeg.exe` 和 `ffprobe.exe` 复制到项目根目录

**选项B：使用包管理器**
```bash
# 使用Chocolatey
choco install ffmpeg

# 使用Scoop
scoop install ffmpeg

# 使用winget
winget install Gyan.FFmpeg
```

**选项C：便携版安装**
1. 下载地址：https://github.com/BtbN/FFmpeg-Builds/releases
2. 下载最新的 `ffmpeg-master-latest-win64-gpl.zip`
3. 解压并复制exe文件到项目目录

---

### 方法三：安装Python音频库

```bash
# 安装pydub（音频处理）
pip install pydub

# 安装其他音频处理库
pip install librosa soundfile

# 安装edge-tts（备用TTS）
pip install edge-tts
```

---

## ✅ 验证安装

### 检查FFmpeg
在项目目录运行：
```bash
ffmpeg -version
```
或者（如果复制到项目目录）：
```bash
./ffmpeg.exe -version
```

### 检查Python库
```python
import pydub
import librosa
import edge_tts
print("所有库安装成功！")
```

---

## 🎯 安装后的效果

### ✅ 安装FFmpeg后：
- 支持M4A/MP3等格式自动转换
- 音频质量优化处理
- 自动音频切分功能
- 完整的SoVITS训练流程

### ✅ 安装Python音频库后：
- Python环境音频处理
- 更好的音频格式兼容性
- 高质量音频转换

---

## 🔧 故障排除

### FFmpeg相关问题

**问题1：命令未找到**
```
解决方案：
1. 确保ffmpeg.exe在系统PATH中，或复制到项目目录
2. 在PowerShell中使用：./ffmpeg.exe
```

**问题2：权限错误**
```
解决方案：
1. 以管理员身份运行PowerShell
2. 或使用便携版（复制到项目目录）
```

**问题3：下载失败**
```
解决方案：
1. 使用代理或VPN
2. 从备用地址下载：https://github.com/BtbN/FFmpeg-Builds
3. 使用离线安装包
```

### Python库相关问题

**问题1：pip安装失败**
```bash
# 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pydub

# 升级pip
python -m pip install --upgrade pip
```

**问题2：依赖冲突**
```bash
# 创建虚拟环境
python -m venv venv
venv\Scripts\activate
pip install pydub librosa
```

---

## 📊 系统状态检查

创建并运行 `check_dependencies.py`：

```python
import os
import sys
import subprocess

def check_ffmpeg():
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ FFmpeg已安装")
            return True
    except:
        try:
            result = subprocess.run(['./ffmpeg.exe', '-version'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ FFmpeg已安装（本地版本）")
                return True
        except:
            pass
    
    print("❌ FFmpeg未安装")
    return False

def check_python_libs():
    libs = ['pydub', 'librosa', 'edge_tts']
    success = 0
    
    for lib in libs:
        try:
            __import__(lib)
            print(f"✅ {lib}已安装")
            success += 1
        except ImportError:
            print(f"❌ {lib}未安装")
    
    return success == len(libs)

def main():
    print("🔍 检查SoVITS依赖工具...")
    print("="*50)
    
    ffmpeg_ok = check_ffmpeg()
    python_ok = check_python_libs()
    
    print("="*50)
    if ffmpeg_ok and python_ok:
        print("🎉 所有依赖已就绪！")
    else:
        print("⚠️ 部分依赖缺失，请参考安装指南")

if __name__ == "__main__":
    main()
```

---

## 🚀 完成安装

安装完成后：

1. **重启应用**：`python run.py`
2. **测试训练**：在网页界面点击"重新训练"
3. **检查日志**：观察是否显示"WAV格式音频文件已准备完成"

---

## 📞 技术支持

如果遇到安装问题：

1. **查看日志**：运行应用时注意控制台输出
2. **检查文件**：确认 `audio_files/pwt.wav` 存在（67MB）
3. **验证工具**：运行 `check_dependencies.py`
4. **重新配置**：删除缓存目录，重新训练

---

## 📝 注意事项

- **Windows用户**：建议使用PowerShell，不要使用cmd
- **防火墙**：某些防火墙可能阻止下载，请临时关闭
- **杀毒软件**：可能会误报FFmpeg，请添加白名单
- **网络**：需要稳定的网络连接下载工具 