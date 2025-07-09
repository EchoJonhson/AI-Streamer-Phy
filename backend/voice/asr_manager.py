"""
语音识别（ASR）管理器模块 - 重构阶段4迁移

支持多种语音识别服务：浏览器原生、百度ASR、Azure Speech等
提供统一的语音识别接口和管理功能
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, Callable
import json
import base64
import tempfile
import os

logger = logging.getLogger(__name__)

class BaseASRProvider(ABC):
    """ASR提供商基类"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.is_available = False
    
    @abstractmethod
    async def recognize(self, audio_data: bytes) -> Optional[str]:
        """识别语音数据"""
        pass
    
    @abstractmethod
    async def check_availability(self) -> bool:
        """检查服务可用性"""
        pass

class BrowserASRProvider(BaseASRProvider):
    """浏览器原生语音识别"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.is_available = True  # 浏览器ASR总是可用的
    
    async def recognize(self, audio_data: bytes) -> Optional[str]:
        """由浏览器端处理，这里只做占位"""
        logger.info("使用浏览器原生语音识别")
        return None
    
    async def check_availability(self) -> bool:
        return True

class BaiduASRProvider(BaseASRProvider):
    """百度语音识别"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('api_key')
        self.secret_key = config.get('secret_key')
        self.access_token = None
    
    async def recognize(self, audio_data: bytes) -> Optional[str]:
        """识别语音"""
        try:
            import aiohttp
            
            if not self.access_token:
                await self._get_access_token()
            
            # 将音频数据编码为base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            url = 'https://vop.baidu.com/server_api'
            
            data = {
                'format': 'wav',
                'rate': 16000,
                'channel': 1,
                'cuid': 'ai_vtuber',
                'token': self.access_token,
                'speech': audio_base64,
                'len': len(audio_data)
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data) as response:
                    result = await response.json()
                    
                    if result.get('err_no') == 0:
                        return result.get('result', [None])[0]
                    else:
                        logger.error(f"百度ASR识别失败: {result}")
                        return None
                        
        except Exception as e:
            logger.error(f"百度ASR识别异常: {e}")
            return None
    
    async def _get_access_token(self):
        """获取访问令牌"""
        try:
            import aiohttp
            
            url = 'https://aip.baidubce.com/oauth/2.0/token'
            params = {
                'grant_type': 'client_credentials',
                'client_id': self.api_key,
                'client_secret': self.secret_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, params=params) as response:
                    result = await response.json()
                    self.access_token = result.get('access_token')
                    
        except Exception as e:
            logger.error(f"获取百度ASR访问令牌失败: {e}")
    
    async def check_availability(self) -> bool:
        try:
            await self._get_access_token()
            return self.access_token is not None
        except:
            return False

class ASRManager:
    """ASR语音识别管理器"""
    
    def __init__(self, config: Dict[str, Any]):
        """初始化ASR管理器
        
        Args:
            config: 配置字典
        """
        self.config = config
        self.asr_config = config.get('asr', {})
        self.enabled = self.asr_config.get('enabled', False)
        self.provider = self.asr_config.get('provider', 'browser')
        
        # 初始化提供商
        self.providers = {
            'browser': BrowserASRProvider(self.asr_config),
            'baidu': BaiduASRProvider(self.asr_config.get('baidu', {}))
        }
        
        # 当前提供商
        self.current_provider = self.providers.get(self.provider)
        
        # 音频回调
        self.audio_callback = None
        
        logger.info(f"ASR管理器初始化完成，提供商: {self.provider}, 启用状态: {self.enabled}")
    
    async def recognize(self, audio_data: bytes) -> Optional[str]:
        """识别音频数据
        
        Args:
            audio_data: 音频数据
            
        Returns:
            识别结果文本
        """
        if not self.enabled:
            logger.warning("ASR功能未启用")
            return None
        
        if not self.current_provider:
            logger.error("没有可用的ASR提供商")
            return None
        
        try:
            result = await self.current_provider.recognize(audio_data)
            if result:
                logger.info(f"ASR识别成功: {result}")
            return result
                
        except Exception as e:
            logger.error(f"语音识别失败: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """获取ASR状态
        
        Returns:
            状态信息
        """
        return {
            'enabled': self.enabled,
            'provider': self.provider,
            'available': self.enabled and self.current_provider is not None,
            'providers': {
                name: provider.is_available 
                for name, provider in self.providers.items()
            }
        }

    def set_audio_callback(self, callback: Callable):
        """设置音频回调函数"""
        self.audio_callback = callback
    
    async def process_audio_chunk(self, audio_data: bytes):
        """处理音频数据块"""
        if self.audio_callback:
            await self.audio_callback(audio_data)
    
    async def check_provider_availability(self, provider_name: str) -> bool:
        """检查提供商可用性"""
        provider = self.providers.get(provider_name)
        if not provider:
            return False
        
        return await provider.check_availability()
    
    def get_available_providers(self) -> list:
        """获取可用的提供商列表"""
        return list(self.providers.keys())
    
    def switch_provider(self, provider_name: str) -> bool:
        """切换ASR提供商"""
        if provider_name not in self.providers:
            logger.error(f"ASR提供商 {provider_name} 不存在")
            return False
        
        self.current_provider = self.providers[provider_name]
        self.provider = provider_name
        logger.info(f"切换ASR提供商为: {provider_name}")
        return True