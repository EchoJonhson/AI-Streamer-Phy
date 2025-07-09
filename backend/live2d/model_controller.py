#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Live2D模型控制器 - 重构阶段5新增

负责管理Live2D模型的控制逻辑，包括：
- 模型加载和初始化
- 表情和动作的统一管理
- 与AI情感分析的联动
- 模型状态的持久化
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from .live2d_model import Live2DModel

logger = logging.getLogger(__name__)


class ModelController:
    """Live2D模型控制器"""
    
    def __init__(self, config: Dict[str, Any]):
        """初始化模型控制器
        
        Args:
            config: 配置字典
        """
        self.config = config
        self.live2d_config = config.get('live2d', {})
        self.model_name = self.live2d_config.get('model_name', 'wuwuwu')
        self.model_path = self.live2d_config.get('model_path', 'public/live2d/models/wuwuwu/wuwuwu.model3.json')
        
        # 当前模型实例
        self.current_model: Optional[Live2DModel] = None
        
        # 模型状态
        self.current_expression = "neutral"
        self.current_motion = {"group": "idle", "index": 0}
        self.is_speaking = False
        self.emotion_history = []
        
        # 情感到表情的映射配置
        self.emotion_mapping = self.live2d_config.get('emotion_mapping', {
            "neutral": "neutral",
            "happy": "happy", 
            "joy": "happy",
            "excited": "happy",
            "sad": "sad",
            "disappointed": "sad",
            "angry": "angry",
            "frustrated": "angry",
            "surprised": "surprised",
            "amazed": "surprised",
            "confused": "neutral",
            "thinking": "neutral"
        })
        
        # 动作组配置
        self.motion_groups = self.live2d_config.get('motion_groups', {
            "idle": {"weight": 0.8, "repeat": True},
            "greeting": {"weight": 0.3, "repeat": False},
            "speaking": {"weight": 0.6, "repeat": False},
            "listening": {"weight": 0.4, "repeat": True}
        })
        
        logger.info(f"Live2D模型控制器初始化完成，模型: {self.model_name}")
    
    async def initialize(self) -> bool:
        """初始化模型控制器
        
        Returns:
            是否初始化成功
        """
        try:
            # 创建模型实例
            self.current_model = Live2DModel(self.model_name, self.model_path)
            
            # 设置初始状态
            await self.reset_to_default_state()
            
            logger.info(f"模型控制器初始化成功，模型: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"模型控制器初始化失败: {e}")
            return False
    
    async def reset_to_default_state(self):
        """重置到默认状态"""
        self.current_expression = "neutral"
        self.current_motion = {"group": "idle", "index": 0}
        self.is_speaking = False
        self.emotion_history = []
        
        if self.current_model:
            await self.current_model.handle_expression_change("neutral")
    
    async def handle_emotion_change(self, emotion: str, intensity: float = 1.0) -> Dict[str, Any]:
        """处理情绪变化
        
        Args:
            emotion: 情绪类型
            intensity: 情绪强度 (0.0-1.0)
            
        Returns:
            处理结果
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        # 记录情绪历史
        self.emotion_history.append({
            "emotion": emotion,
            "intensity": intensity,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # 保持最近10条记录
        if len(self.emotion_history) > 10:
            self.emotion_history.pop(0)
        
        # 映射情绪到表情
        expression = self._map_emotion_to_expression(emotion)
        
        # 根据情绪强度调整表情持续时间
        duration = self._calculate_expression_duration(intensity)
        
        logger.info(f"处理情绪变化: {emotion} (强度: {intensity}) -> 表情: {expression} (持续: {duration}s)")
        
        # 更新当前表情
        self.current_expression = expression
        
        # 执行表情变化
        result = await self.current_model.handle_expression_change(expression)
        
        # 添加控制器信息
        result.update({
            "controller_info": {
                "emotion": emotion,
                "intensity": intensity,
                "duration": duration,
                "expression_mapping": expression
            }
        })
        
        return result
    
    def _map_emotion_to_expression(self, emotion: str) -> str:
        """将情绪映射到表情
        
        Args:
            emotion: 情绪类型
            
        Returns:
            表情名称
        """
        return self.emotion_mapping.get(emotion.lower(), "neutral")
    
    def _calculate_expression_duration(self, intensity: float) -> float:
        """计算表情持续时间
        
        Args:
            intensity: 情绪强度
            
        Returns:
            持续时间（秒）
        """
        # 基础持续时间2秒，根据强度调整
        base_duration = 2.0
        return base_duration * (0.5 + intensity * 0.5)
    
    async def handle_speaking_state(self, is_speaking: bool) -> Dict[str, Any]:
        """处理说话状态变化
        
        Args:
            is_speaking: 是否在说话
            
        Returns:
            处理结果
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        self.is_speaking = is_speaking
        
        if is_speaking:
            # 播放说话动作
            result = await self.play_motion("speaking", 0)
            logger.info("开始说话，播放说话动作")
        else:
            # 回到空闲状态
            result = await self.play_motion("idle", 0)
            logger.info("结束说话，回到空闲状态")
        
        result.update({
            "controller_info": {
                "speaking_state": is_speaking
            }
        })
        
        return result
    
    async def play_motion(self, group: str, index: int = 0) -> Dict[str, Any]:
        """播放指定动作
        
        Args:
            group: 动作组名称
            index: 动作索引
            
        Returns:
            处理结果
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        # 更新当前动作
        self.current_motion = {"group": group, "index": index}
        
        # 执行动作
        result = await self.current_model.handle_motion(group, index)
        
        logger.info(f"播放动作: {group}[{index}]")
        
        return result
    
    async def play_random_motion(self, group: str) -> Dict[str, Any]:
        """播放随机动作
        
        Args:
            group: 动作组名称
            
        Returns:
            处理结果
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        # 获取动作组的动作数量
        motions = self.current_model.motions.get(group, 0)
        if motions <= 0:
            return {"status": "error", "message": f"动作组 {group} 不存在或为空"}
        
        # 随机选择动作索引
        import random
        index = random.randint(0, motions - 1)
        
        return await self.play_motion(group, index)
    
    def get_model_status(self) -> Dict[str, Any]:
        """获取模型状态
        
        Returns:
            模型状态信息
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        return {
            "model_name": self.model_name,
            "model_path": self.model_path,
            "current_expression": self.current_expression,
            "current_motion": self.current_motion,
            "is_speaking": self.is_speaking,
            "available_expressions": self.current_model.expressions,
            "available_motions": self.current_model.motions,
            "emotion_history": self.emotion_history[-5:],  # 最近5条情绪记录
            "controller_version": "2.0.0"
        }
    
    def get_model_config(self) -> Dict[str, Any]:
        """获取模型配置
        
        Returns:
            模型配置信息
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        config = self.current_model.get_model_config()
        config.update({
            "controller_config": {
                "emotion_mapping": self.emotion_mapping,
                "motion_groups": self.motion_groups
            }
        })
        
        return config
    
    async def handle_interaction(self, interaction_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """处理交互请求
        
        Args:
            interaction_type: 交互类型
            data: 交互数据
            
        Returns:
            处理结果
        """
        if not self.current_model:
            return {"status": "error", "message": "模型未初始化"}
        
        try:
            if interaction_type == "expression":
                expression = data.get("expression", "neutral")
                return await self.current_model.handle_expression_change(expression)
            
            elif interaction_type == "motion":
                group = data.get("group", "idle")
                index = data.get("index", 0)
                return await self.play_motion(group, index)
            
            elif interaction_type == "emotion":
                emotion = data.get("emotion", "neutral")
                intensity = data.get("intensity", 1.0)
                return await self.handle_emotion_change(emotion, intensity)
            
            elif interaction_type == "speaking":
                is_speaking = data.get("is_speaking", False)
                return await self.handle_speaking_state(is_speaking)
            
            elif interaction_type == "random_motion":
                group = data.get("group", "idle")
                return await self.play_random_motion(group)
            
            else:
                return {"status": "error", "message": f"不支持的交互类型: {interaction_type}"}
        
        except Exception as e:
            logger.error(f"处理交互请求失败: {e}")
            return {"status": "error", "message": str(e)}
    
    def cleanup(self):
        """清理资源"""
        if self.current_model:
            self.current_model = None
        
        self.emotion_history.clear()
        logger.info("Live2D模型控制器资源已清理")