#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预训练SoVITS模型测试脚本
"""

import asyncio
import logging
import yaml
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_pretrained_sovits():
    """测试预训练SoVITS模型"""
    
    # 加载配置
    config_path = Path("config.yaml")
    if not config_path.exists():
        logger.error("配置文件不存在: config.yaml")
        return False
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    logger.info("🚀 开始测试预训练SoVITS模型...")
    
    try:
        # 导入预训练SoVITS TTS
        from backend.voice.pretrained_sovits_tts import PretrainedSoVITSTTS
        
        # 初始化
        tts = PretrainedSoVITSTTS(config)
        
        if not tts.is_initialized:
            logger.error("❌ 预训练SoVITS模型初始化失败")
            return False
        
        logger.info("✅ 预训练SoVITS模型初始化成功")
        
        # 获取状态
        status = tts.get_status()
        logger.info(f"📊 模型状态: {status}")
        
        # 测试语音合成
        test_text = "你好，我是AI虚拟主播小雨，这是预训练SoVITS模型的测试语音。"
        logger.info(f"🎵 测试语音合成: {test_text}")
        
        result = await tts.synthesize(test_text)
        
        if result:
            sr, audio_data = result
            logger.info(f"✅ 语音合成成功!")
            logger.info(f"   采样率: {sr} Hz")
            logger.info(f"   音频长度: {len(audio_data)/sr:.2f} 秒")
            logger.info(f"   音频数据大小: {len(audio_data)} 样本")
            
            # 保存测试音频
            import numpy as np
            import soundfile as sf
            
            output_path = "test_output.wav"
            sf.write(output_path, audio_data, sr)
            logger.info(f"🎧 测试音频已保存: {output_path}")
            
            return True
        else:
            logger.error("❌ 语音合成失败")
            return False
            
    except Exception as e:
        logger.error(f"测试异常: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    logger.info("=" * 60)
    logger.info("🎭 预训练SoVITS模型测试")
    logger.info("=" * 60)
    
    # 检查模型文件
    gpt_model = Path("audio_files/中配数据集制/GPT_weights_v2/ALuoNa_cn-e15.ckpt")
    sovits_model = Path("audio_files/中配数据集制/SoVITS_weights_v2/ALuoNa_cn_e16_s256.pth")
    
    if not gpt_model.exists():
        logger.error(f"❌ GPT模型文件不存在: {gpt_model}")
        return
    
    if not sovits_model.exists():
        logger.error(f"❌ SoVITS模型文件不存在: {sovits_model}")
        return
    
    logger.info(f"✅ GPT模型: {gpt_model.name} ({gpt_model.stat().st_size / 1024 / 1024:.1f}MB)")
    logger.info(f"✅ SoVITS模型: {sovits_model.name} ({sovits_model.stat().st_size / 1024 / 1024:.1f}MB)")
    
    # 运行测试
    success = asyncio.run(test_pretrained_sovits())
    
    if success:
        logger.info("🎉 预训练SoVITS模型测试成功!")
    else:
        logger.error("❌ 预训练SoVITS模型测试失败!")
    
    logger.info("=" * 60)

if __name__ == "__main__":
    main() 