#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI心理医生项目 - 主启动脚本 (阶段9更新)
使用新的重构后目录结构
"""

import os
import sys
import subprocess

def main():
    """主启动函数"""
    
    # 获取项目根目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 检查是否存在scripts/run.py
    scripts_run = os.path.join(script_dir, "scripts", "run.py")
    
    if os.path.exists(scripts_run):
        print("🚀 启动AI心理医生项目...")
        print(f"📂 项目根目录: {script_dir}")
        print(f"🔧 使用启动脚本: {scripts_run}")
        print("-" * 50)
        
        # 执行scripts/run.py
        try:
            result = subprocess.run([sys.executable, scripts_run], 
                                  cwd=script_dir, 
                                  check=True)
            return result.returncode
        except subprocess.CalledProcessError as e:
            print(f"❌ 启动失败: {e}")
            return e.returncode
        except KeyboardInterrupt:
            print("\n👋 用户终止程序")
            return 0
    else:
        print("❌ 找不到启动脚本 scripts/run.py")
        print("请确保项目结构完整")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)