#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arona预训练模型配置测试脚本
"""

import os
import sys
import yaml
import logging
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_arona_config():
    """测试Arona预训练模型配置"""
    
    logger.info("🎯 开始验证Arona预训练模型配置...")
    
    # 1. 检查配置文件
    config_path = "config.yaml"
    if not os.path.exists(config_path):
        logger.error(f"❌ 配置文件不存在: {config_path}")
        return False
    
    # 2. 读取配置
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
    except Exception as e:
        logger.error(f"❌ 读取配置文件失败: {e}")
        return False
    
    # 3. 检查SoVITS配置
    sovits_config = config.get('sovits', {})
    if not sovits_config:
        logger.error("❌ 找不到SoVITS配置")
        return False
    
    # 4. 检查预训练模型配置
    pretrained_config = sovits_config.get('pretrained_models', {})
    if not pretrained_config:
        logger.error("❌ 找不到预训练模型配置")
        return False
    
    # 5. 检查模型文件
    gpt_path = pretrained_config.get('gpt_weights_path')
    sovits_path = pretrained_config.get('sovits_weights_path')
    
    logger.info(f"🔍 GPT模型路径: {gpt_path}")
    logger.info(f"🔍 SoVITS模型路径: {sovits_path}")
    
    if not gpt_path or not os.path.exists(gpt_path):
        logger.error(f"❌ GPT模型文件不存在: {gpt_path}")
        return False
    else:
        logger.info(f"✅ GPT模型文件存在: {gpt_path}")
    
    if not sovits_path or not os.path.exists(sovits_path):
        logger.error(f"❌ SoVITS模型文件不存在: {sovits_path}")
        return False
    else:
        logger.info(f"✅ SoVITS模型文件存在: {sovits_path}")
    
    # 6. 检查参考音频
    ref_config = sovits_config.get('reference_audio', {})
    ref_audio_path = ref_config.get('ref_audio_path')
    prompt_text = ref_config.get('prompt_text')
    
    logger.info(f"🔍 参考音频路径: {ref_audio_path}")
    logger.info(f"🔍 参考文本: {prompt_text}")
    
    if not ref_audio_path or not os.path.exists(ref_audio_path):
        logger.error(f"❌ 参考音频文件不存在: {ref_audio_path}")
        return False
    else:
        # 获取文件大小
        file_size = os.path.getsize(ref_audio_path)
        logger.info(f"✅ 参考音频文件存在: {ref_audio_path} (大小: {file_size:,} 字节)")
    
    # 7. 检查GPT-SoVITS目录
    sovits_dir = sovits_config.get('sovits_path', 'GPT-SoVITS')
    if not os.path.exists(sovits_dir):
        logger.error(f"❌ GPT-SoVITS目录不存在: {sovits_dir}")
        return False
    else:
        logger.info(f"✅ GPT-SoVITS目录存在: {sovits_dir}")
    
    # 8. 检查配置一致性
    gpt_sovits_config_path = "GPT-SoVITS/configs/custom_tts_infer.yaml"
    if os.path.exists(gpt_sovits_config_path):
        try:
            with open(gpt_sovits_config_path, 'r', encoding='utf-8') as f:
                gpt_sovits_config = yaml.safe_load(f)
            
            custom_config = gpt_sovits_config.get('custom', {})
            gpt_sovits_gpt_path = custom_config.get('t2s_weights_path', '').replace('../../', '')
            gpt_sovits_sovits_path = custom_config.get('vits_weights_path', '').replace('../../', '')
            
            if gpt_sovits_gpt_path == gpt_path:
                logger.info("✅ GPT-SoVITS配置文件中的GPT模型路径匹配")
            else:
                logger.warning(f"⚠️ GPT模型路径不匹配: {gpt_sovits_gpt_path} vs {gpt_path}")
            
            if gpt_sovits_sovits_path == sovits_path:
                logger.info("✅ GPT-SoVITS配置文件中的SoVITS模型路径匹配")
            else:
                logger.warning(f"⚠️ SoVITS模型路径不匹配: {gpt_sovits_sovits_path} vs {sovits_path}")
                
        except Exception as e:
            logger.warning(f"⚠️ 无法读取GPT-SoVITS配置文件: {e}")
    
    # 9. 输出配置摘要
    logger.info("=" * 60)
    logger.info("🎉 Arona预训练模型配置验证完成!")
    logger.info("📊 配置摘要:")
    logger.info(f"   - 模型类型: Arona中文配音")
    logger.info(f"   - GPT模型: ALuoNa_cn-e15.ckpt (15个训练周期)")
    logger.info(f"   - SoVITS模型: ALuoNa_cn_e16_s256.pth (16个周期, 256步)")
    logger.info(f"   - 参考音频: arona_attendance_enter_1.wav")
    logger.info(f"   - 参考文本: {prompt_text}")
    logger.info(f"   - 使用预训练模式: {sovits_config.get('use_pretrained', False)}")
    logger.info("=" * 60)
    
    return True

def show_usage_instructions():
    """显示使用说明"""
    logger.info("🚀 Arona语音系统使用说明:")
    logger.info("1. 确认配置验证通过后，运行主程序:")
    logger.info("   python run.py")
    logger.info("")
    logger.info("2. 在浏览器中打开应用")
    logger.info("   http://127.0.0.1:8000")
    logger.info("")
    logger.info("3. 在TTS设置中切换到'预训练模型'模式")
    logger.info("4. 与AI对话，体验Arona的语音效果")
    logger.info("")
    logger.info("⚠️ 重要提示:")
    logger.info("   - 首次使用可能需要加载模型，会有延迟")
    logger.info("   - 确保prompt_text与音频内容完全一致")
    logger.info("   - 如果效果不好，可以尝试不同的模型组合")

if __name__ == "__main__":
    print("🎯 Arona预训练模型配置测试")
    print("=" * 60)
    
    success = test_arona_config()
    
    if success:
        print("\n✅ 配置验证通过！")
        show_usage_instructions()
    else:
        print("\n❌ 配置验证失败，请检查上述错误信息")
        sys.exit(1) 
 
 