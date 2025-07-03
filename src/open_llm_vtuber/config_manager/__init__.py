"""配置管理模块"""

import yaml
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_file: str = "config.yaml"):
        self.config_file = config_file
        self.config = {}
        self.load_config()
    
    def load_config(self):
        """加载配置文件"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self.config = yaml.safe_load(f) or {}
                logger.info(f"配置文件加载成功: {self.config_file}")
            else:
                logger.warning(f"配置文件不存在: {self.config_file}")
                self.config = self._get_default_config()
        except Exception as e:
            logger.error(f"配置文件加载失败: {e}")
            self.config = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置"""
        return {
            'app': {
                'name': 'AI虚拟主播',
                'version': '2.0.0',
                'debug': True
            },
            'server': {
                'host': '127.0.0.1',
                'port': 12393
            },
            'character': {
                'name': 'Arona',
                'personality': '来自蔚蓝档案的AI助理，聪明、友善、可靠的虚拟助手'
            },
            'tts': {
                'provider': 'sovits',
                'default_mode': 'browser'
            },
            'sovits': {
                'sovits_path': 'GPT-SoVITS',
                'audio_file': 'audio_files/arona_attendance_enter_1.wav',
                'model_name': 'arona_voice',
                'reference_text': '您回来啦，我等您很久啦！'
            },
            'llm': {
                'provider': 'qwen',
                'model': 'qwen-turbo',
                'temperature': 0.7,
                'max_tokens': 2000
            }
        }
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """设置配置值"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
    
    def save_config(self):
        """保存配置文件"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(self.config, f, default_flow_style=False, allow_unicode=True)
            logger.info(f"配置文件保存成功: {self.config_file}")
        except Exception as e:
            logger.error(f"配置文件保存失败: {e}")

__all__ = ['ConfigManager'] 