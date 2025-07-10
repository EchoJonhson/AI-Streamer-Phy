#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FFmpeg安装脚本
自动下载并配置FFmpeg
"""

import os
import sys
import urllib.request
import zipfile
import shutil
from pathlib import Path

def download_ffmpeg():
    """下载FFmpeg可执行文件"""
    print("🔄 正在下载FFmpeg...")
    
    # FFmpeg下载地址（静态编译版本）
    ffmpeg_url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    
    try:
        # 下载到临时文件
        zip_path = "ffmpeg_temp.zip"
        
        print("📥 下载中，请稍候...")
        urllib.request.urlretrieve(ffmpeg_url, zip_path)
        
        print("📂 解压FFmpeg文件...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall("ffmpeg_temp")
        
        # 找到ffmpeg.exe和ffprobe.exe
        temp_dir = Path("ffmpeg_temp")
        bin_dir = None
        
        for root, dirs, files in os.walk(temp_dir):
            if "ffmpeg.exe" in files and "ffprobe.exe" in files:
                bin_dir = Path(root)
                break
        
        if bin_dir:
            # 复制到项目根目录
            shutil.copy2(bin_dir / "ffmpeg.exe", "./ffmpeg.exe")
            shutil.copy2(bin_dir / "ffprobe.exe", "./ffprobe.exe")
            
            print("✅ FFmpeg安装完成")
            print(f"📍 已安装到: {os.path.abspath('.')}")
            
            # 清理临时文件
            os.remove(zip_path)
            shutil.rmtree(temp_dir)
            
            return True
        else:
            print("❌ 未找到FFmpeg可执行文件")
            return False
            
    except Exception as e:
        print(f"❌ 下载失败: {e}")
        print("💡 请手动下载FFmpeg:")
        print("   1. 访问: https://github.com/BtbN/FFmpeg-Builds/releases")
        print("   2. 下载: ffmpeg-master-latest-win64-gpl.zip")
        print("   3. 解压并将ffmpeg.exe和ffprobe.exe复制到项目根目录")
        return False

def test_ffmpeg():
    """测试FFmpeg是否可用"""
    print("\n🧪 测试FFmpeg...")
    
    try:
        import subprocess
        result = subprocess.run(["./ffmpeg.exe", "-version"], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ FFmpeg测试成功")
            print(f"📝 版本信息: {result.stdout.split()[2]}")
            return True
        else:
            print("❌ FFmpeg测试失败")
            return False
            
    except FileNotFoundError:
        print("❌ ffmpeg.exe未找到")
        return False
    except Exception as e:
        print(f"❌ 测试异常: {e}")
        return False

def install_edge_tts():
    """安装edge-tts库"""
    print("\n📦 安装edge-tts库...")
    
    try:
        import subprocess
        result = subprocess.run([sys.executable, "-m", "pip", "install", "edge-tts"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ edge-tts安装成功")
            return True
        else:
            print(f"❌ edge-tts安装失败: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ 安装异常: {e}")
        return False

def main():
    """主函数"""
    print("="*60)
    print("🛠️ SoVITS依赖工具安装程序")
    print("="*60)
    
    success_count = 0
    
    # 1. 安装FFmpeg
    print("\n🎯 步骤1: 安装FFmpeg")
    if os.path.exists("./ffmpeg.exe"):
        print("✅ FFmpeg已存在")
        if test_ffmpeg():
            success_count += 1
    else:
        if download_ffmpeg():
            if test_ffmpeg():
                success_count += 1
    
    # 2. 安装edge-tts
    print("\n🎯 步骤2: 安装edge-tts")
    try:
        import edge_tts
        print("✅ edge-tts已安装")
        success_count += 1
    except ImportError:
        if install_edge_tts():
            success_count += 1
    
    # 3. 总结
    print("\n" + "="*60)
    print(f"📊 安装结果: {success_count}/2 成功")
    
    if success_count == 2:
        print("🎉 所有依赖安装完成！")
        print("💡 现在可以重新启动应用进行完整的SoVITS训练")
        print("🚀 运行: python run.py")
    else:
        print("⚠️ 部分依赖安装失败，但仍可使用基础功能")
        
    print("="*60)

if __name__ == "__main__":
    main() 