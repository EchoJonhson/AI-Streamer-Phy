#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试Arona预训练模型配置修复
"""

import os
import sys
import logging
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_arona_config():
    """测试Arona配置"""
    
    logger.info("🔧 测试Arona预训练模型配置...")
    
    # 检查模型文件
    gpt_model = Path("C:/Users/MSIK/Desktop/ChatBot/aistreamer/audio_files/中配数据集制/GPT_weights_v2/ALuoNa_cn-e15.ckpt")
    sovits_model = Path("C:/Users/MSIK/Desktop/ChatBot/aistreamer/audio_files/中配数据集制/SoVITS_weights_v2/ALuoNa_cn_e16_s256.pth")
    ref_audio = Path("C:/Users/MSIK/Desktop/ChatBot/aistreamer/audio_files/arona_attendance_enter_1.wav")
    
    # 检查BERT模型 - 修正路径
    bert_path = Path("C:/Users/MSIK/Desktop/ChatBot/aistreamer/GPT-SoVITS/pretrained_models/chinese-roberta-wwm-ext-large")
    cnhuhbert_path = Path("C:/Users/MSIK/Desktop/ChatBot/aistreamer/GPT-SoVITS/pretrained_models/chinese-hubert-base")
    
    logger.info("📁 检查模型文件:")
    logger.info(f"  GPT模型: {gpt_model}")
    logger.info(f"   存在: {gpt_model.exists()}")
    if gpt_model.exists():
        logger.info(f"   大小: {gpt_model.stat().st_size / 1024 / 1024:.1f}MB")
    
    logger.info(f"  SoVITS模型: {sovits_model}")
    logger.info(f"   存在: {sovits_model.exists()}")
    if sovits_model.exists():
        logger.info(f"   大小: {sovits_model.stat().st_size / 1024 / 1024:.1f}MB")
    
    logger.info(f"  参考音频: {ref_audio}")
    logger.info(f"   存在: {ref_audio.exists()}")
    
    logger.info(f"  BERT模型: {bert_path}")
    logger.info(f"   存在: {bert_path.exists()}")
    
    logger.info(f"  CNHuBERT模型: {cnhuhbert_path}")
    logger.info(f"   存在: {cnhuhbert_path.exists()}")
    
    # 测试TTS_Config
    try:
        # 添加GPT-SoVITS路径
        sovits_path = Path("C:/Users/MSIK/Desktop/ChatBot/aistreamer/GPT-SoVITS")
        if sovits_path.exists():
            sys.path.insert(0, str(sovits_path))
            sys.path.insert(0, str(sovits_path / 'GPT_SoVITS'))
        
        from TTS_infer_pack.TTS import TTS_Config
        
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
        
        logger.info("🔧 测试TTS_Config初始化...")
        logger.info(f"  传入配置: {custom_config}")
        
        tts_config = TTS_Config(custom_config)
        
        logger.info("✅ TTS_Config初始化成功!")
        logger.info(f"  最终配置:")
        logger.info(f"    t2s_weights_path: {tts_config.t2s_weights_path}")
        logger.info(f"    vits_weights_path: {tts_config.vits_weights_path}")
        logger.info(f"    bert_base_path: {tts_config.bert_base_path}")
        logger.info(f"    cnhuhbert_base_path: {tts_config.cnhuhbert_base_path}")
        
        # 检查是否使用了传入的路径
        if tts_config.t2s_weights_path == str(gpt_model):
            logger.info("✅ GPT模型路径正确使用传入值")
        else:
            logger.error(f"❌ GPT模型路径回退到默认值: {tts_config.t2s_weights_path}")
            
        if tts_config.vits_weights_path == str(sovits_model):
            logger.info("✅ SoVITS模型路径正确使用传入值")
        else:
            logger.error(f"❌ SoVITS模型路径回退到默认值: {tts_config.vits_weights_path}")
            
        if tts_config.bert_base_path == str(bert_path):
            logger.info("✅ BERT模型路径正确使用传入值")
        else:
            logger.error(f"❌ BERT模型路径回退到默认值: {tts_config.bert_base_path}")
            
        if tts_config.cnhuhbert_base_path == str(cnhuhbert_path):
            logger.info("✅ CNHuBERT模型路径正确使用传入值")
        else:
            logger.error(f"❌ CNHuBERT模型路径回退到默认值: {tts_config.cnhuhbert_base_path}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ TTS_Config测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("🎭 Arona预训练模型配置测试")
    logger.info("=" * 60)
    
    success = test_arona_config()
    
    if success:
        logger.info("🎉 Arona配置测试成功!")
    else:
        logger.error("❌ Arona配置测试失败!")
    
    logger.info("=" * 60)

if __name__ == "__main__":
    main() 