#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高质量TTS语音合成模块 - 重构阶段4迁移

集成多种开源语音合成方案，提供更自然甜美的语音
包含Enhanced Edge TTS等高质量语音合成提供商
"""

import asyncio
import logging
import os
import tempfile
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
import io

logger = logging.getLogger(__name__)

class PremiumTTSProvider(ABC):
    """高质量TTS提供商基类"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.is_available = False
    
    @abstractmethod
    async def synthesize(self, text: str) -> Optional[bytes]:
        """合成语音"""
        pass
    
    @abstractmethod
    async def check_availability(self) -> bool:
        """检查服务可用性"""
        pass
    
    def get_voice_list(self) -> List[Dict[str, str]]:
        """获取可用语音列表"""
        return []

class EnhancedEdgeTTSProvider(PremiumTTSProvider):
    """增强版Edge TTS - 微软高质量语音合成"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.voice = config.get('voice', 'zh-CN-XiaoxiaoNeural')
        self.rate = config.get('rate', '-20%')
        self.pitch = config.get('pitch', '+8Hz')
        self.volume = config.get('volume', '+0%')
        
        # 精选高质量中文女声
        self.premium_voices = {
            'xiaoxiao': {
                'voice': 'zh-CN-XiaoxiaoNeural',
                'name': '晓晓',
                'description': '温柔甜美，适合日常对话',
                'rate': '-25%',
                'pitch': '+10Hz'
            },
            'xiaoyi': {
                'voice': 'zh-CN-XiaoyiNeural', 
                'name': '晓伊',
                'description': '年轻活泼，充满活力',
                'rate': '-15%',
                'pitch': '+15Hz'
            },
            'xiaomo': {
                'voice': 'zh-CN-XiaomoNeural',
                'name': '晓墨',
                'description': '知性优雅，职场女性',
                'rate': '-20%',
                'pitch': '+5Hz'
            },
            'xiaoqiu': {
                'voice': 'zh-CN-XiaoqiuNeural',
                'name': '晓秋',
                'description': '温暖亲和，邻家女孩',
                'rate': '-30%', 
                'pitch': '+12Hz'
            },
            'xiaorui': {
                'voice': 'zh-CN-XiaoruiNeural',
                'name': '晓睿',
                'description': '聪慧灵动，青春洋溢',
                'rate': '-18%',
                'pitch': '+18Hz'
            }
        }
        
        # 如果指定了预设，应用对应的配置
        preset = config.get('preset', 'xiaoxiao')
        if preset in self.premium_voices:
            voice_config = self.premium_voices[preset]
            self.voice = voice_config['voice']
            self.rate = voice_config['rate']
            self.pitch = voice_config['pitch']
    
    async def synthesize(self, text: str) -> Optional[bytes]:
        """合成语音"""
        try:
            # 检查edge_tts是否可用
            try:
                import edge_tts
            except ImportError:
                logger.error("edge_tts库未安装")
                return None
            
            # 文本预处理 - 简化版本，避免复杂的SSML
            processed_text = self._enhance_text_for_speech_simple(text)
            
            logger.info(f"使用Enhanced Edge TTS: {self.voice}")
            logger.info(f"语音参数: rate={self.rate}, pitch={self.pitch}")
            
            communicate = edge_tts.Communicate(
                processed_text,
                self.voice,
                rate=self.rate,
                pitch=self.pitch,
                volume=self.volume
            )
            
            audio_data = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.write(chunk["data"])
            
            audio_bytes = audio_data.getvalue()
            logger.info(f"Enhanced Edge TTS合成成功，音频大小: {len(audio_bytes)} bytes")
            return audio_bytes
            
        except Exception as e:
            logger.error(f"Enhanced Edge TTS合成异常: {e}")
            return None
    
    def _enhance_text_for_speech_simple(self, text: str) -> str:
        """简化版文本增强，避免复杂的SSML导致错误"""
        import re
        
        # 基础文本清理
        text = text.strip()
        if not text:
            return "你好"
        
        # 去除特殊字符但保留基本标点
        text = re.sub(r'[^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a\s.,!?;:~]', '', text)
        
        # 限制文本长度，避免过长
        if len(text) > 200:
            text = text[:200] + "..."
        
        return text
    
    def _enhance_text_for_speech(self, text: str) -> str:
        """增强文本，使语音更自然 - 保留原有功能但添加错误处理"""
        try:
            import re
            
            # 去除特殊字符但保留情感表达
            text = re.sub(r'[^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a\uff01-\uff5e\u3000-\u303f\s.,!?;:~]', '', text)
            
            # 添加情感化标记
            text = self._add_emotion_markers(text)
            
            # 添加自然停顿
            text = re.sub(r'([。！？])', r'\1<break time="600ms"/>', text)
            text = re.sub(r'([，、；])', r'\1<break time="300ms"/>', text)
            text = re.sub(r'([：])', r'\1<break time="200ms"/>', text)
            
            # 处理语气词
            text = re.sub(r'(哈哈|呵呵|嘿嘿)', r'<prosody rate="+10%" pitch="+20Hz">\1</prosody>', text)
            text = re.sub(r'(唉|哎)', r'<prosody rate="-20%" pitch="-10Hz">\1</prosody>', text)
            
            # 使用SSML增强语音表现力
            ssml_text = f'''
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
                <voice name="{self.voice}">
                    <prosody rate="{self.rate}" pitch="{self.pitch}" volume="{self.volume}">
                        <emphasis level="moderate">{text}</emphasis>
                    </prosody>
                </voice>
            </speak>
            '''.strip()
            
            return ssml_text
        except Exception as e:
            logger.warning(f"文本增强失败，使用简化版本: {e}")
            return self._enhance_text_for_speech_simple(text)
    
    def _add_emotion_markers(self, text: str) -> str:
        """根据文本内容添加情感标记"""
        try:
            import re
            
            # 开心/兴奋的表达
            if re.search(r'(太好了|真棒|不错|厉害|赞|哈哈|嘻嘻)', text):
                text = f'<mstts:express-as style="cheerful" styledegree="1.2">{text}</mstts:express-as>'
            
            # 温柔/关怀的表达  
            elif re.search(r'(没关系|不要紧|加油|辛苦了|保重)', text):
                text = f'<mstts:express-as style="gentle" styledegree="1.1">{text}</mstts:express-as>'
            
            # 疑问/好奇的表达
            elif '?' in text or '？' in text or re.search(r'(什么|怎么|为什么|真的吗)', text):
                text = f'<mstts:express-as style="curious" styledegree="1.0">{text}</mstts:express-as>'
            
            return text
        except Exception as e:
            logger.warning(f"情感标记添加失败: {e}")
            return text
    
    async def _enhance_audio(self, audio_bytes: bytes) -> bytes:
        """音频后处理增强"""
        try:
            # 这里可以添加音频后处理，比如降噪、均衡等
            # 暂时直接返回原音频
            return audio_bytes
        except Exception as e:
            logger.warning(f"音频增强失败: {e}")
            return audio_bytes
    
    async def check_availability(self) -> bool:
        try:
            import edge_tts
            # 简单测试一下是否可以创建Communicate对象
            test_comm = edge_tts.Communicate("测试", self.voice)
            self.is_available = True
            logger.info("Enhanced Edge TTS可用性检查通过")
            return True
        except Exception as e:
            logger.warning(f"Enhanced Edge TTS不可用: {e}")
            self.is_available = False
            return False

    def get_voice_list(self) -> List[Dict[str, str]]:
        """获取可用语音列表"""
        return [
            {
                'id': key,
                'name': voice['name'],
                'description': voice['description'],
                'voice': voice['voice']
            }
            for key, voice in self.premium_voices.items()
        ]

class PremiumTTSManager:
    """高级TTS管理器"""
    
    def __init__(self, config: Dict[str, Any]):
        """初始化高级TTS管理器
        
        Args:
            config: 配置字典
        """
        self.config = config
        self.tts_config = config.get('tts', {})
        self.enabled = self.tts_config.get('enabled', True)
        self.provider = self.tts_config.get('provider', 'browser')
        
        # 初始化提供商
        self.providers = {
            'enhanced_edge': EnhancedEdgeTTSProvider(self.tts_config.get('enhanced_edge', {}))
        }
        
        logger.info(f"高级TTS管理器初始化完成，提供商: {self.provider}")
    
    async def synthesize(self, text: str, voice_params: Optional[Dict] = None) -> Dict[str, Any]:
        """合成语音
        
        Args:
            text: 要合成的文本
            voice_params: 语音参数
            
        Returns:
            TTS结果
        """
        if not self.enabled:
            logger.warning("TTS功能未启用")
            return {'success': False, 'error': 'TTS功能未启用'}
        
        try:
            # 默认使用浏览器TTS
            if self.provider == 'browser':
                result = {
                    'success': True,
                    'method': 'browser_tts',
                    'text': text,
                    'voice_params': voice_params or {
                        'rate': 1.0,
                        'pitch': 1.0,
                        'volume': 1.0
                    }
                }
                logger.info(f"使用浏览器TTS合成: {text[:50]}...")
                return result
                
            elif self.provider == 'enhanced_edge':
                provider = self.providers['enhanced_edge']
                if await provider.check_availability():
                    audio_bytes = await provider.synthesize(text)
                    if audio_bytes:
                        return {
                            'success': True,
                            'method': 'enhanced_edge_tts',
                            'text': text,
                            'audio_data': audio_bytes,
                            'voice_params': voice_params
                        }
                    else:
                        return {'success': False, 'error': 'Enhanced Edge TTS合成失败'}
                else:
                    return {'success': False, 'error': 'Enhanced Edge TTS不可用'}
                    
            else:
                logger.warning(f"不支持的TTS提供商: {self.provider}")
                return {'success': False, 'error': f'不支持的TTS提供商: {self.provider}'}
                
        except Exception as e:
            logger.error(f"TTS合成失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_status(self) -> Dict[str, Any]:
        """获取TTS状态
        
        Returns:
            状态信息
        """
        return {
            'enabled': self.enabled,
            'provider': self.provider,
            'available': self.enabled,
            'providers': {
                name: provider.is_available 
                for name, provider in self.providers.items()
            }
        }
    
    def get_available_voices(self) -> Dict[str, Any]:
        """获取可用的语音
        
        Returns:
            可用语音列表
        """
        voices = {
            'browser': {
                'zh-CN-Standard': '中文标准音',
                'zh-CN-Sweet': '中文甜美音'
            }
        }
        
        # 添加Enhanced Edge TTS的语音
        if 'enhanced_edge' in self.providers:
            voices['enhanced_edge'] = {
                voice['id']: voice['name'] 
                for voice in self.providers['enhanced_edge'].get_voice_list()
            }
        
        return voices