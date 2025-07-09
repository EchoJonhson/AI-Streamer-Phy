import os
import yaml
import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_path: str = "config.yaml"):
        """初始化配置管理器
        
        Args:
            config_path: 配置文件路径
        """
        self.config_path = config_path
        self.config = self._load_default_config()
        self.load_config()
    
    def _load_default_config(self) -> Dict[str, Any]:
        """加载默认配置"""
        return {
            "app": {
                "name": "AI虚拟主播",
                "version": "1.0.0",
                "host": "0.0.0.0",
                "port": 8080,
                "debug": True
            },
            "llm": {
                "provider": "qwen",
                "api_key": "sk-1ff3a1c15f884e31b3a7492748e37a97",
                "model": "qwen-turbo",
                "base_url": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
                "max_tokens": 200,
                "temperature": 0.8,
                "system_prompt": """你是一个可爱的AI虚拟主播，名字叫小雨。你的特点是：
1. 活泼开朗，善于与观众互动
2. 说话风格轻松有趣，偶尔会使用一些网络用语和表情符号
3. 对各种话题都有一定了解，能够给出有趣的回答
4. 会根据聊天内容表达不同的情绪
5. 回答要简洁明了，通常控制在50字以内
6. 要像真正的主播一样，有亲和力

请用这种风格回答用户的问题。"""
            },
            "tts": {
                "enabled": False,
                "provider": "edge",
                "voice": "zh-CN-XiaoyiNeural",
                "rate": "+0%",
                "volume": "+0%"
            },
            "asr": {
                "enabled": False,
                "provider": "whisper",
                "model": "base",
                "language": "zh"
            },
            "live2d": {
                "model_name": "wuwuwu",
                "model_path": "/home/gpr/AI-Streamer-Phy/public/live2d/models/wuwuwu/wuwuwu.model3.json",
                "scale": 0.6,
                "expressions": {
                    "neutral": "neutral",
                    "happy": "happy", 
                    "sad": "sad",
                    "angry": "angry",
                    "surprised": "surprised"
                },
                "auto_expression": True,
                "expression_duration": 3000
            },
            "features": {
                "voice_interruption": False,
                "auto_speech": False,
                "screen_capture": False,
                "camera": False,
                "pet_mode": False,
                "chat_history": True,
                "emotion_analysis": True
            },
            "ui": {
                "theme": "default",
                "sidebar_width": 350,
                "show_debug": True,
                "background_image": "",
                "custom_css": ""
            },
            "character": {
                "name": "小雨",
                "personality": "活泼可爱",
                "greeting_messages": [
                    "你好，我是AI虚拟主播小雨！",
                    "欢迎来到我的直播间！",
                    "有什么问题可以问我哦~"
                ]
            }
        }
    
    def load_config(self):
        """加载配置文件"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    file_config = yaml.safe_load(f)
                    if file_config:
                        self._merge_config(self.config, file_config)
                        logger.info(f"配置文件加载成功: {self.config_path}")
            else:
                logger.info("配置文件不存在，使用默认配置")
                self.save_config()
        except Exception as e:
            logger.error(f"加载配置文件失败: {e}")
    
    def save_config(self):
        """保存配置文件"""
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f, default_flow_style=False, allow_unicode=True)
            logger.info(f"配置文件保存成功: {self.config_path}")
        except Exception as e:
            logger.error(f"保存配置文件失败: {e}")
    
    def _merge_config(self, default: Dict, override: Dict):
        """合并配置字典"""
        for key, value in override.items():
            if key in default and isinstance(default[key], dict) and isinstance(value, dict):
                self._merge_config(default[key], value)
            else:
                default[key] = value
    
    def get(self, key_path: str, default=None):
        """获取配置值
        
        Args:
            key_path: 配置键路径，如 'llm.model'
            default: 默认值
            
        Returns:
            配置值
        """
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def set(self, key_path: str, value):
        """设置配置值
        
        Args:
            key_path: 配置键路径
            value: 配置值
        """
        keys = key_path.split('.')
        config = self.config
        
        for key in keys[:-1]:
            if key not in config:
                config[key] = {}
            config = config[key]
        
        config[keys[-1]] = value
    
    def get_llm_config(self) -> Dict[str, Any]:
        """获取LLM配置"""
        return self.config.get("llm", {})
    
    def get_live2d_config(self) -> Dict[str, Any]:
        """获取Live2D配置"""
        return self.config.get("live2d", {})
    
    def get_app_config(self) -> Dict[str, Any]:
        """获取应用配置"""
        return self.config.get("app", {})
    
    def get_character_config(self) -> Dict[str, Any]:
        """获取角色配置"""
        return self.config.get("character", {})
    
    def is_feature_enabled(self, feature: str) -> bool:
        """检查功能是否启用
        
        Args:
            feature: 功能名称
            
        Returns:
            是否启用
        """
        return self.config.get("features", {}).get(feature, False)

# 全局配置实例
config = ConfigManager() 