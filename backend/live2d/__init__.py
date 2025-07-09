#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backend Live2D Module - Live2D模型管理后端模块

该模块包含所有与Live2D模型相关的功能：
- Live2D模型的加载和管理
- 表情和动作的控制
- 与AI情感分析的联动
- 模型状态的持久化管理

阶段5重构：统一管理Live2D相关功能
"""

# 导入核心Live2D模块
from .live2d_model import Live2DModel
from .model_controller import ModelController

# 版本信息
__version__ = "2.0.0"
__author__ = "AI-Streamer-Phy Team"

# 导出的公共接口
__all__ = [
    'Live2DModel',
    'ModelController'
]