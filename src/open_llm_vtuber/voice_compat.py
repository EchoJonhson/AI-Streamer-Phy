#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Voice Compatibility Layer - 语音模块向后兼容层

阶段4重构：为保持向后兼容性而创建的兼容层
将旧的导入路径映射到新的backend/voice模块

这个文件允许现有代码继续使用旧的导入路径，而不需要立即修改所有引用
"""

import sys
import warnings
from pathlib import Path

# 添加新的backend路径到系统路径
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# 发出弃用警告
warnings.warn(
    "从 'src.open_llm_vtuber' 导入语音模块已弃用，请使用 'backend.voice' 导入",
    DeprecationWarning,
    stacklevel=2
)

# 导入新的语音模块并重新导出
try:
    from backend.voice import (
        TTSManager,
        ASRManager, 
        SoVITSInferenceEngine,
        VoiceAPI,
        PremiumTTSManager,
        EnhancedEdgeTTSProvider,
        SoVITSTrainer
    )
    
    # 保持向后兼容的导出
    __all__ = [
        'TTSManager',
        'ASRManager', 
        'SoVITSInferenceEngine',
        'VoiceAPI',
        'PremiumTTSManager',
        'EnhancedEdgeTTSProvider',
        'SoVITSTrainer'
    ]
    
except ImportError as e:
    # 如果新模块导入失败，尝试导入原始模块
    warnings.warn(
        f"无法导入新的语音模块，回退到原始模块: {e}",
        ImportWarning,
        stacklevel=2
    )
    
    # 尝试导入原始模块（如果它们仍然存在）
    try:
        from .tts_manager import TTSManager
        from .asr_manager import ASRManager
        from .sovits_inference_engine import SoVITSInferenceEngine
        from .voice_api import VoiceAPI
        
        # 可能不存在的模块
        try:
            from .premium_tts import PremiumTTSManager, EnhancedEdgeTTSProvider
        except ImportError:
            PremiumTTSManager = None
            EnhancedEdgeTTSProvider = None
            
        try:
            from .sovits_tts import SoVITSTrainer
        except ImportError:
            SoVITSTrainer = None
            
        __all__ = [
            'TTSManager',
            'ASRManager', 
            'SoVITSInferenceEngine',
            'VoiceAPI'
        ]
        
        # 只添加存在的模块
        if PremiumTTSManager:
            __all__.extend(['PremiumTTSManager', 'EnhancedEdgeTTSProvider'])
        if SoVITSTrainer:
            __all__.append('SoVITSTrainer')
            
    except ImportError as original_import_error:
        raise ImportError(
            f"无法导入语音模块，新模块和原始模块都不可用: {original_import_error}"
        ) from e