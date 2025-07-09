#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backend Voice Module - 语音系统后端模块

该模块包含所有与语音相关的功能：
- TTS (Text-to-Speech) 文本转语音
- ASR (Automatic Speech Recognition) 语音识别
- SoVITS 语音克隆和合成
- 语音API接口管理
- 高级TTS和语音训练功能

阶段4重构：统一管理语音相关功能
"""

# 导入核心语音模块
from .tts_manager import TTSManager
from .asr_manager import ASRManager
from .voice_api import VoiceAPI

# 导入高级语音功能模块
from .premium_tts import PremiumTTSManager, EnhancedEdgeTTSProvider
from .sovits_tts import SoVITSTrainer

# 导入SoVITS推理引擎（可能需要额外依赖）
try:
    from .sovits_inference_engine import SoVITSInferenceEngine
    _sovits_available = True
except ImportError as e:
    import warnings
    warnings.warn(f"SoVITS推理引擎不可用，缺少依赖: {e}", ImportWarning)
    SoVITSInferenceEngine = None
    _sovits_available = False

# 版本信息
__version__ = "2.0.0"
__author__ = "AI-Streamer-Phy Team"

# 导出的公共接口
__all__ = [
    'TTSManager',
    'ASRManager', 
    'VoiceAPI',
    'PremiumTTSManager',
    'EnhancedEdgeTTSProvider',
    'SoVITSTrainer'
]

# 如果SoVITS可用，添加到导出列表
if _sovits_available:
    __all__.append('SoVITSInferenceEngine')