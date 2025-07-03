#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
音频内容确认脚本 - 帮助确认Arona音频文件的实际内容
"""

import os
import sys
import logging
import wave
import librosa
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def analyze_audio_file(audio_path):
    """分析音频文件"""
    logger.info(f"🔍 分析音频文件: {audio_path}")
    
    if not os.path.exists(audio_path):
        logger.error(f"❌ 音频文件不存在: {audio_path}")
        return False
    
    try:
        # 获取基本信息
        file_size = os.path.getsize(audio_path)
        logger.info(f"📊 文件大小: {file_size:,} 字节 ({file_size/1024/1024:.2f} MB)")
        
        # 使用librosa加载音频
        y, sr = librosa.load(audio_path, sr=None)
        duration = len(y) / sr
        
        logger.info(f"🎵 音频信息:")
        logger.info(f"   - 采样率: {sr} Hz")
        logger.info(f"   - 时长: {duration:.2f} 秒")
        logger.info(f"   - 声道数: {'立体声' if len(y.shape) > 1 else '单声道'}")
        logger.info(f"   - 格式: WAV")
        
        # 根据文件名推测内容
        filename = os.path.basename(audio_path)
        logger.info(f"📝 根据文件名推测内容:")
        
        if "arona" in filename.lower():
            logger.info("   - 角色: Arona (蔚蓝档案)")
            
        if "attendance_enter" in filename.lower():
            logger.info("   - 场景: 出勤/进入问候")
            logger.info("   - 可能的内容:")
            logger.info("     * '您回来啦' / '老师回来啦'")
            logger.info("     * '欢迎回来' / 'お帰りなさい'") 
            logger.info("     * '我等您很久啦'")
            logger.info("     * '您辛苦了'")
            
        # 音频质量分析
        logger.info(f"🎯 音频质量分析:")
        
        # 音量分析
        rms = np.sqrt(np.mean(y**2))
        logger.info(f"   - RMS音量: {rms:.4f}")
        
        # 频率分析
        fft = np.fft.fft(y)
        magnitude = np.abs(fft)
        freqs = np.fft.fftfreq(len(fft), 1/sr)
        
        # 找到主要频率成分
        dominant_freq_idx = np.argmax(magnitude[:len(magnitude)//2])
        dominant_freq = abs(freqs[dominant_freq_idx])
        logger.info(f"   - 主要频率: {dominant_freq:.1f} Hz")
        
        if duration > 1 and duration < 10:
            logger.info("   - ✅ 时长适合作为参考音频")
        elif duration < 1:
            logger.warning("   - ⚠️ 音频过短，可能影响效果")
        else:
            logger.warning("   - ⚠️ 音频过长，建议截取3-8秒片段")
            
        if rms > 0.01:
            logger.info("   - ✅ 音量适中")
        else:
            logger.warning("   - ⚠️ 音量较低，可能需要音频增强")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ 分析音频文件失败: {e}")
        return False

def suggest_prompt_text():
    """建议可能的提示文本"""
    logger.info("💡 建议的提示文本选项:")
    logger.info("=" * 50)
    
    suggestions = [
        "您回来啦",
        "老师回来啦", 
        "您回来啦，我等您很久啦",
        "老师，欢迎回来",
        "您辛苦了",
        "老师辛苦了",
        "欢迎回来",
        "お帰りなさい",  # 日语版本
        "先生、お帰りなさい"
    ]
    
    for i, text in enumerate(suggestions, 1):
        logger.info(f"{i:2d}. {text}")
    
    logger.info("=" * 50)
    logger.info("🔧 使用方法:")
    logger.info("1. 播放音频文件，仔细听Arona说的内容")
    logger.info("2. 从上面的选项中选择最匹配的文本")
    logger.info("3. 或者根据实际听到的内容自定义文本")
    logger.info("4. 更新 config.yaml 中的 prompt_text 字段")

def show_config_update_guide():
    """显示配置更新指南"""
    logger.info("🛠️ 配置更新指南:")
    logger.info("=" * 50)
    
    logger.info("如果需要更新 prompt_text，请编辑 config.yaml 文件:")
    logger.info("")
    logger.info("找到这一行:")
    logger.info('    prompt_text: "您回来啦，我等您很久啦！"')
    logger.info("")
    logger.info("修改为实际听到的内容，例如:")
    logger.info('    prompt_text: "老师回来啦"')
    logger.info("")
    logger.info("⚠️ 注意事项:")
    logger.info("- 文本必须与音频内容完全一致")
    logger.info("- 包括标点符号和语气词")
    logger.info("- 文本越准确，语音克隆效果越好")

if __name__ == "__main__":
    print("🎯 Arona音频内容确认工具")
    print("=" * 60)
    
    audio_path = "audio_files/arona_attendance_enter_1.wav"
    
    # 检查依赖
    try:
        import librosa
    except ImportError:
        print("❌ 缺少 librosa 库，请安装:")
        print("pip install librosa soundfile")
        sys.exit(1)
    
    success = analyze_audio_file(audio_path)
    
    if success:
        print("\n" + "=" * 60)
        suggest_prompt_text()
        print("\n" + "=" * 60)
        show_config_update_guide()
        print("\n✅ 分析完成！请播放音频确认内容，然后更新配置文件。")
    else:
        print("\n❌ 音频分析失败，请检查文件路径和格式")
        sys.exit(1) 
 
 