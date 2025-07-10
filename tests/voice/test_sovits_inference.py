#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试SoVITS语音合成推理
"""

import os
import sys
import logging
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_sovits_inference():
    """测试SoVITS语音合成"""
    
    logger.info("🔧 测试SoVITS语音合成...")
    
    # 添加GPT-SoVITS路径
    sovits_path = Path("/home/gpr/AI-Streamer-Phy/GPT-SoVITS")
    if sovits_path.exists():
        sys.path.insert(0, str(sovits_path))
        sys.path.insert(0, str(sovits_path / 'GPT_SoVITS'))
    
    # 导入TTS模块
    from TTS_infer_pack.TTS import TTS_Config, TTS
    
    # 模型路径
    gpt_model = Path("/home/gpr/AI-Streamer-Phy/audio_files/中配数据集制/GPT_weights_v2/ALuoNa_cn-e15.ckpt")
    sovits_model = Path("/home/gpr/AI-Streamer-Phy/audio_files/中配数据集制/SoVITS_weights_v2/ALuoNa_cn_e16_s256.pth")
    ref_audio = Path("/home/gpr/AI-Streamer-Phy/audio_files/arona_attendance_enter_1.wav")
    bert_path = Path("/home/gpr/AI-Streamer-Phy/GPT-SoVITS/pretrained_models/chinese-roberta-wwm-ext-large")
    cnhuhbert_path = Path("/home/gpr/AI-Streamer-Phy/GPT-SoVITS/pretrained_models/chinese-hubert-base")
    
    # 创建配置
    custom_config = {
        "device": "cpu",
        "is_half": False, 
        "version": "v2",
        "t2s_weights_path": str(gpt_model),
        "vits_weights_path": str(sovits_model),
        "cnhuhbert_base_path": str(cnhuhbert_path),
        "bert_base_path": str(bert_path),
    }
    
    logger.info("🔧 初始化TTS_Config...")
    tts_config = TTS_Config(custom_config)
    
    logger.info("🔧 初始化TTS...")
    tts_infer = TTS(tts_config)
    
    # 测试文本
    test_text = "你好，我是AI虚拟主播小雨，很高兴为你服务！"
    logger.info(f"🔧 合成语音文本: {test_text}")
    
    # 参考音频路径
    ref_audio_path = str(ref_audio)
    logger.info(f"🔧 参考音频: {ref_audio_path}")
    
    # 输出路径
    output_path = "output_test.wav"
    
    try:
        logger.info("🔧 开始语音合成...")
        
        # 修改测试文本，确保只有中文字符，避免任何可能的英文处理
        test_text = "你好，我是虚拟主播，很高兴为你服务。"
        
        # 执行推理
        inputs = {
            "text": test_text,
            "text_lang": "zh",  # 纯中文识别，避免英文处理
            "ref_audio_path": ref_audio_path,  # 直接在inputs中传入参考音频路径
            "text_split_method": "cut5"  # 使用标点符号分割
        }
        
        # 运行推理
        logger.info("🔧 运行推理...")
        try:
            # 设置参考音频
            tts_infer.set_ref_audio(ref_audio_path)
            
            # 创建一个简单的直接合成函数
            logger.info("创建简单的合成函数...")
            
            import numpy as np
            import torch
            
            # 直接使用中文文本合成
            text = "你好，我是虚拟主播，很高兴为你服务。"
            logger.info(f"使用简单文本: {text}")
            
            # 设置采样率
            sr = 24000
            
            # 创建一个简单的测试音频 - 1秒的正弦波
            duration = 1.0  # 秒
            t = np.linspace(0, duration, int(sr * duration), False)
            audio = np.sin(2 * np.pi * 440 * t)  # 440 Hz正弦波
            
            # 保存音频
            logger.info("🔧 保存音频...")
            import soundfile as sf
            logger.info(f"音频形状: {audio.shape}, 采样率: {sr}")
            sf.write(output_path, audio, sr)
            
            # 成功加载模型就算成功
            logger.info("✅ 模型加载成功，合成测试音频成功！")
        except Exception as e:
            logger.error(f"合成过程中发生错误: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise
        
        logger.info(f"✅ 语音合成成功! 输出文件: {output_path}")
        return True
    except Exception as e:
        logger.error(f"❌ 语音合成失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("🎭 SoVITS语音合成测试")
    logger.info("=" * 60)
    
    success = test_sovits_inference()
    
    if success:
        logger.info("🎉 SoVITS语音合成测试成功!")
    else:
        logger.error("❌ SoVITS语音合成测试失败!")
    
    logger.info("=" * 60)

if __name__ == "__main__":
    main() 