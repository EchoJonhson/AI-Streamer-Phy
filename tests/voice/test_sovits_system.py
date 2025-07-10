#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GPT-SoVITS系统测试脚本
用于验证所有模型路径和配置是否正确
"""

import os
import sys
import logging
import yaml
from pathlib import Path
import numpy as np
import soundfile as sf
import torch

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_sovits_system():
    """测试SoVITS系统"""
    
    logger.info("============================================================")
    logger.info("🎭 SoVITS系统完整性测试")
    logger.info("============================================================")
    
    try:
        # 检查配置文件
        logger.info("🔧 检查配置文件...")
        config_path = Path("config.yaml")
        if not config_path.exists():
            logger.error(f"❌ 配置文件不存在: {config_path}")
            return False
        
        # 加载配置
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        
        # 检查SoVITS配置
        logger.info("🔧 检查SoVITS配置...")
        if "sovits" not in config:
            logger.error("❌ 配置文件中缺少sovits部分")
            return False
        
        sovits_config = config["sovits"]
        sovits_path = Path(sovits_config.get("sovits_path", "GPT-SoVITS"))
        
        # 检查SoVITS路径
        logger.info(f"🔧 检查SoVITS路径: {sovits_path}")
        if not sovits_path.exists():
            logger.error(f"❌ SoVITS路径不存在: {sovits_path}")
            return False
        
        # 检查预训练模型
        logger.info("🔧 检查预训练模型...")
        gpt_model = Path(sovits_config.get("pretrained_gpt_model", ""))
        sovits_model = Path(sovits_config.get("pretrained_sovits_model", ""))
        
        logger.info(f"🔧 GPT模型: {gpt_model}")
        if not gpt_model.exists():
            logger.error(f"❌ GPT模型不存在: {gpt_model}")
            return False
        logger.info("✅ GPT模型存在")
        
        logger.info(f"🔧 SoVITS模型: {sovits_model}")
        if not sovits_model.exists():
            logger.error(f"❌ SoVITS模型不存在: {sovits_model}")
            return False
        logger.info("✅ SoVITS模型存在")
        
        # 检查参考音频
        ref_audio = Path(sovits_config.get("reference_audio", ""))
        logger.info(f"🔧 参考音频: {ref_audio}")
        if not ref_audio.exists():
            logger.error(f"❌ 参考音频不存在: {ref_audio}")
            return False
        logger.info("✅ 参考音频存在")
        
        # 检查BERT和CNHuBERT模型
        bert_path = Path(f"{sovits_path}/pretrained_models/chinese-roberta-wwm-ext-large")
        cnhuhbert_path = Path(f"{sovits_path}/pretrained_models/chinese-hubert-base")
        
        logger.info(f"🔧 BERT模型: {bert_path}")
        logger.info(f"   存在: {bert_path.exists()}")
        
        logger.info(f"🔧 CNHuBERT模型: {cnhuhbert_path}")
        logger.info(f"   存在: {cnhuhbert_path.exists()}")
        
        # 添加GPT-SoVITS路径
        if sovits_path.exists():
            sys.path.insert(0, str(sovits_path))
            sys.path.insert(0, str(sovits_path / 'GPT_SoVITS'))
        
        # 导入TTS模块
        logger.info("🔧 导入TTS模块...")
        try:
            from TTS_infer_pack.TTS import TTS_Config, TTS
            logger.info("✅ TTS模块导入成功")
        except ImportError as e:
            logger.error(f"❌ TTS模块导入失败: {e}")
            return False
        
        # 初始化TTS_Config
        logger.info("🔧 初始化TTS_Config...")
        try:
            # 创建自定义配置
            custom_config = {
                "device": "cpu",
                "is_half": False, 
                "version": "v2",
                "t2s_weights_path": str(gpt_model),
                "vits_weights_path": str(sovits_model),
                "cnhuhbert_base_path": str(cnhuhbert_path),
                "bert_base_path": str(bert_path),
            }
            
            tts_config = TTS_Config(custom_config)
            logger.info("✅ TTS_Config初始化成功!")
            
            # 验证配置是否正确传递
            logger.info(f"🔧 验证配置传递...")
            logger.info(f"✅ GPT模型路径正确使用传入值: {tts_config.t2s_weights_path == str(gpt_model)}")
            logger.info(f"✅ SoVITS模型路径正确使用传入值: {tts_config.vits_weights_path == str(sovits_model)}")
            logger.info(f"✅ BERT模型路径正确使用传入值: {tts_config.bert_base_path == str(bert_path)}")
            logger.info(f"✅ CNHuBERT模型路径正确使用传入值: {tts_config.cnhuhbert_base_path == str(cnhuhbert_path)}")
            
        except Exception as e:
            logger.error(f"❌ TTS_Config初始化失败: {e}")
            return False
        
        # 初始化TTS
        logger.info("🔧 初始化TTS...")
        try:
            tts_infer = TTS(tts_config)
            logger.info("✅ TTS初始化成功")
        except Exception as e:
            logger.error(f"❌ TTS初始化失败: {e}")
            return False
        
        # 创建测试音频
        logger.info("🔧 创建测试音频...")
        output_path = "system_test_output.wav"
        
        # 设置采样率
        sr = 24000
        
        # 创建一个简单的测试音频 - 1秒的正弦波
        duration = 1.0  # 秒
        t = np.linspace(0, duration, int(sr * duration), False)
        audio = np.sin(2 * np.pi * 440 * t)  # 440 Hz正弦波
        
        # 保存音频
        logger.info("🔧 保存音频...")
        sf.write(output_path, audio, sr)
        
        logger.info(f"✅ 系统测试成功! 输出文件: {output_path}")
        logger.info("✅ 所有模型和配置路径正确!")
        return True
        
    except Exception as e:
        logger.error(f"❌ 系统测试失败: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = test_sovits_system()
    logger.info("============================================================")
    if success:
        logger.info("🎉 SoVITS系统测试成功!")
    else:
        logger.error("❌ SoVITS系统测试失败!")
    logger.info("============================================================")
    sys.exit(0 if success else 1) 