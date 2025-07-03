#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import logging
import os
import sys
import time

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))

from src.open_llm_vtuber.sovits_inference_engine import SoVITSInferenceEngine
from src.open_llm_vtuber.config_manager import ConfigManager

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def test_sovits_only():
    """测试SoVITS专用功能"""
    print("🎵 SoVITS专用测试开始")
    print("=" * 50)
    
    try:
        # 加载配置
        config_manager = ConfigManager()
        config = config_manager.config
        
        print("📋 配置信息:")
        print(f"   GPT模型: {config['sovits']['pretrained_gpt_model']}")
        print(f"   SoVITS模型: {config['sovits']['pretrained_sovits_model']}")
        print(f"   参考音频: {config['sovits']['reference_audio']}")
        print(f"   提示文本: {config['sovits']['prompt_text']}")
        
        # 检查文件存在性
        print("\n🔍 检查文件存在性:")
        
        gpt_path = config['sovits']['pretrained_gpt_model']
        sovits_path = config['sovits']['pretrained_sovits_model']
        ref_audio = config['sovits']['reference_audio']
        
        if os.path.exists(gpt_path):
            print(f"   ✅ GPT模型存在: {gpt_path}")
        else:
            print(f"   ❌ GPT模型不存在: {gpt_path}")
            return False
            
        if os.path.exists(sovits_path):
            print(f"   ✅ SoVITS模型存在: {sovits_path}")
        else:
            print(f"   ❌ SoVITS模型不存在: {sovits_path}")
            return False
            
        if os.path.exists(ref_audio):
            print(f"   ✅ 参考音频存在: {ref_audio}")
        else:
            print(f"   ❌ 参考音频不存在: {ref_audio}")
            return False
        
        # 初始化SoVITS推理引擎
        print("\n🚀 初始化SoVITS推理引擎...")
        engine = SoVITSInferenceEngine(config)
        
        success = engine.initialize()
        if not success:
            print("❌ SoVITS推理引擎初始化失败")
            return False
            
        print("✅ SoVITS推理引擎初始化成功")
        
        # 测试语音合成
        print("\n🎵 测试语音合成...")
        test_texts = [
            "你好，我是AI虚拟主播小雨！",
            "欢迎来到我的直播间！",
            "今天天气真不错呢！"
        ]
        
        for i, text in enumerate(test_texts, 1):
            print(f"\n📝 测试 {i}: {text}")
            
            start_time = time.time()
            audio_path = engine.synthesize(text)
            end_time = time.time()
            
            if audio_path and os.path.exists(audio_path):
                duration = end_time - start_time
                file_size = os.path.getsize(audio_path)
                print(f"   ✅ 合成成功!")
                print(f"   📁 输出文件: {audio_path}")
                print(f"   ⏱️  耗时: {duration:.2f}秒")
                print(f"   📊 文件大小: {file_size} bytes")
            else:
                print(f"   ❌ 合成失败")
                return False
        
        print("\n🎉 SoVITS专用测试完成!")
        return True
        
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_sovits_only())
    sys.exit(0 if success else 1) 
 
 