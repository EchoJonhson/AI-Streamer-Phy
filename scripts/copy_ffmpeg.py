#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FFmpeg文件复制脚本
"""

import os
import shutil
from pathlib import Path

def copy_ffmpeg_files():
    """复制FFmpeg文件到项目根目录"""
    print("🔄 正在安装FFmpeg文件...")
    
    # 获取项目根目录
    base_dir = Path(__file__).parent.parent
    source_dir = base_dir / "ffmpeg-master-latest-win64-gpl-shared/bin"
    
    if not source_dir.exists():
        print("❌ 源目录不存在:", source_dir)
        return False
    
    # 需要复制的文件
    files_to_copy = [
        "ffmpeg.exe",
        "ffprobe.exe",
        "avcodec-62.dll",
        "avutil-60.dll", 
        "avformat-62.dll",
        "swresample-6.dll",
        "swscale-9.dll",
        "avfilter-11.dll",
        "avdevice-62.dll"
    ]
    
    success_count = 0
    
    for file_name in files_to_copy:
        source_file = source_dir / file_name
        dest_file = base_dir / file_name
        
        if source_file.exists():
            try:
                shutil.copy2(source_file, dest_file)
                print(f"✅ 已复制: {file_name}")
                success_count += 1
            except Exception as e:
                print(f"❌ 复制失败 {file_name}: {e}")
        else:
            print(f"⚠️  文件不存在: {file_name}")
    
    print(f"\n📊 复制结果: {success_count}/{len(files_to_copy)} 个文件成功")
    
    # 测试FFmpeg
    if (base_dir / "ffmpeg.exe").exists():
        print("\n🧪 测试FFmpeg...")
        try:
            import subprocess
            result = subprocess.run([str(base_dir / "ffmpeg.exe"), "-version"], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                print(f"✅ FFmpeg测试成功!")
                print(f"📝 {version_line}")
                return True
            else:
                print("❌ FFmpeg测试失败")
        except Exception as e:
            print(f"❌ 测试异常: {e}")
    
    return success_count > 0

def main():
    print("="*60)
    print("🛠️ FFmpeg安装程序")
    print("="*60)
    
    if copy_ffmpeg_files():
        print("\n🎉 FFmpeg安装完成！")
        print("💡 现在可以运行:")
        print("   python check_dependencies.py  # 检查所有依赖")
        print("   python run.py                 # 启动应用")
    else:
        print("\n❌ 安装失败，请检查文件路径")
    
    print("="*60)

if __name__ == "__main__":
    main() 