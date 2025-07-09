#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Live2D Compatibility Layer - Live2D模块向后兼容层

阶段5重构：为保持向后兼容性而创建的兼容层
将旧的导入路径映射到新的backend/live2d模块

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
    "从 'src.open_llm_vtuber' 导入Live2D模块已弃用，请使用 'backend.live2d' 导入",
    DeprecationWarning,
    stacklevel=2
)

# 导入新的Live2D模块并重新导出
try:
    from backend.live2d import (
        Live2DModel,
        ModelController
    )
    
    # 保持向后兼容的导出
    __all__ = [
        'Live2DModel',
        'ModelController'
    ]
    
except ImportError as e:
    # 如果新模块导入失败，尝试导入原始模块
    warnings.warn(
        f"无法导入新的Live2D模块，回退到原始模块: {e}",
        ImportWarning,
        stacklevel=2
    )
    
    # 尝试导入原始模块（如果它们仍然存在）
    try:
        from .live2d_model import Live2DModel
        
        # ModelController 是新创建的，可能不存在于原始模块中
        try:
            from .model_controller import ModelController
        except ImportError:
            # 如果ModelController不存在，创建一个简单的替代
            class ModelController:
                def __init__(self, config):
                    self.config = config
                    self.model = None
                    warnings.warn(
                        "ModelController 是新功能，原始模块中不存在",
                        ImportWarning
                    )
                
                async def initialize(self):
                    return False
                
                def get_model_status(self):
                    return {"status": "error", "message": "ModelController不可用"}
        
        __all__ = [
            'Live2DModel',
            'ModelController'
        ]
            
    except ImportError as original_import_error:
        raise ImportError(
            f"无法导入Live2D模块，新模块和原始模块都不可用: {original_import_error}"
        ) from e