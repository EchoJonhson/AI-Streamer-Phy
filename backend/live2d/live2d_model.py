#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Live2D模型管理模块 - 重构阶段5迁移

处理Live2D模型的加载、配置和控制
包含表情变化、动作播放和模型状态管理功能
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import aiohttp

logger = logging.getLogger(__name__)


class Live2DModel:
    """Live2D模型类"""

    def __init__(self, model_name: str, model_path: str):
        """初始化Live2D模型
        
        Args:
            model_name: 模型名称
            model_path: 模型JSON文件路径
        """
        self.model_name = model_name
        self.model_path = model_path
        self.model_data = {}
        self.expressions = []
        self.motions = {}
        
        # 情绪到表情的映射
        self.emotion_to_expression = {
            "neutral": "neutral",
            "happy": "happy",
            "sad": "sad",
            "angry": "angry",
            "surprised": "surprised"
        }
        
        logger.info(f"初始化Live2D模型: {model_name}, 路径: {model_path}")
        
        # 转换为绝对路径和相对路径
        self.model_absolute_path = os.path.abspath(model_path)
        self.model_relative_path = self._convert_to_web_path(model_path)
        
        logger.info(f"模型绝对路径: {self.model_absolute_path}")
        logger.info(f"模型相对路径: {self.model_relative_path}")
        
        # 加载模型数据
        self.load_model_data()
    
    def _convert_to_web_path(self, path: str) -> str:
        """将文件路径转换为Web路径
        
        Args:
            path: 文件路径
            
        Returns:
            Web路径
        """
        # 查找 "public" 文件夹位置并将路径转换为相对于public的路径
        parts = Path(path).parts
        if "public" in parts:
            public_index = parts.index("public")
            # 从public后面的部分开始构建路径
            web_path = "/" + "/".join(parts[public_index+1:])
            return web_path
        # 如果没有找到public，返回原路径
        return path
    
    def load_model_data(self):
        """加载模型数据"""
        logger.info(f"加载Live2D模型数据，路径: {self.model_path}")
        
        try:
            # 检查文件是否存在
            if not os.path.exists(self.model_path):
                logger.error(f"模型文件不存在: {self.model_path}")
                # 使用默认表情列表
                self.expressions = ["neutral", "happy", "sad", "angry", "surprised"]
                return
            
            # 读取模型JSON文件
            with open(self.model_path, 'r', encoding='utf-8') as f:
                self.model_data = json.load(f)
                logger.info(f"模型数据: {json.dumps(self.model_data, indent=2)[:200]}...")
            
            # 从模型数据中提取表情列表
            self._extract_expressions()
            
            # 从模型数据中提取动作列表
            self._extract_motions()
            
        except Exception as e:
            logger.error(f"加载模型数据时发生错误: {e}")
            # 使用默认表情列表
            self.expressions = ["neutral", "happy", "sad", "angry", "surprised"]
        
        logger.info(f"模型 {self.model_name} 加载完成，表情列表: {self.expressions}")
    
    def _extract_expressions(self):
        """从模型数据中提取表情列表"""
        # 在这里解析模型数据，提取表情列表
        # 由于模型数据结构可能因模型而异，这里使用默认表情列表
        self.expressions = ["neutral", "happy", "sad", "angry", "surprised"]
        
        try:
            # 如果模型数据中包含表情信息，从中提取
            if "FileReferences" in self.model_data and "Expressions" in self.model_data["FileReferences"]:
                expressions_data = self.model_data["FileReferences"]["Expressions"]
                if isinstance(expressions_data, list):
                    self.expressions = [expr["Name"] for expr in expressions_data]
                elif isinstance(expressions_data, dict):
                    self.expressions = list(expressions_data.keys())
        except Exception as e:
            logger.error(f"提取表情列表时发生错误: {e}")
    
    def _extract_motions(self):
        """从模型数据中提取动作列表"""
        # 在这里解析模型数据，提取动作列表
        self.motions = {}
        
        try:
            # 如果模型数据中包含动作信息，从中提取
            if "FileReferences" in self.model_data and "Motions" in self.model_data["FileReferences"]:
                motions_data = self.model_data["FileReferences"]["Motions"]
                for group_name, motions in motions_data.items():
                    if isinstance(motions, list):
                        self.motions[group_name] = len(motions)
        except Exception as e:
            logger.error(f"提取动作列表时发生错误: {e}")
    
    def get_model_config(self) -> Dict[str, Any]:
        """获取模型配置
        
        Returns:
            模型配置字典
        """
        config = {
            "model_name": self.model_name,
            "model_path": self.model_relative_path,
            "expressions": self.expressions,
            "motions": self.motions
        }
        logger.info(f"返回模型配置: {json.dumps(config)}")
        return config
    
    async def express_emotion(self, emotion: str) -> Dict[str, Any]:
        """表达情绪
        
        Args:
            emotion: 情绪类型
            
        Returns:
            操作结果
        """
        logger.info(f"表达情绪: {emotion}")
        
        # 将情绪映射到表情
        expression = self._map_emotion_to_expression(emotion)
        logger.info(f"映射情绪到表情: {emotion}")
        logger.info(f"情绪 '{emotion}' 映射到表情 '{expression}'")
        
        # 处理表情变化
        return await self.handle_expression_change(expression)
    
    def _map_emotion_to_expression(self, emotion: str) -> str:
        """将情绪映射到表情
        
        Args:
            emotion: 情绪类型
            
        Returns:
            表情名称
        """
        return self.emotion_to_expression.get(emotion, "neutral")
    
    async def handle_expression_change(self, expression: str) -> Dict[str, Any]:
        """处理表情变化请求
        
        Args:
            expression: 表情名称
            
        Returns:
            操作结果
        """
        logger.info(f"处理表情变化请求: {expression}")
        
        # 检查表情是否存在
        if expression not in self.expressions:
            logger.warning(f"表情不存在: {expression}")
            expression = "neutral"  # 使用默认表情
        
        # 返回操作结果
        result = {
            "status": "success",
            "type": "expression",
            "expression": expression
        }
        
        logger.info(f"表情变化响应: {result}")
        return result
    
    async def handle_motion(self, group: str, index: int) -> Dict[str, Any]:
        """处理动作请求
        
        Args:
            group: 动作组名称
            index: 动作索引
            
        Returns:
            操作结果
        """
        logger.info(f"处理动作请求: {group}[{index}]")
        
        # 检查动作组是否存在
        if group not in self.motions:
            logger.warning(f"动作组不存在: {group}")
            # 返回错误结果
            return {
                "status": "error",
                "type": "motion",
                "message": f"动作组不存在: {group}"
            }
        
        # 检查动作索引是否有效
        if index >= self.motions[group]:
            logger.warning(f"动作索引无效: {index}, 最大值: {self.motions[group] - 1}")
            # 返回错误结果
            return {
                "status": "error",
                "type": "motion",
                "message": f"动作索引无效: {index}, 最大值: {self.motions[group] - 1}"
            }
        
        # 返回操作结果
        result = {
            "status": "success",
            "type": "motion",
            "group": group,
            "index": index
        }
        
        logger.info(f"动作响应: {result}")
        return result