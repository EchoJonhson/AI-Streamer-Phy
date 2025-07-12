"""
TTS管理器模块 - 重构阶段4迁移

支持多种TTS提供商和语音合成方案
包含浏览器TTS和SoVITS推理引擎的统一管理
"""

import logging
import os
import tempfile
import asyncio
import re
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class TTSManager:
    """TTS管理器"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tts_config = config.get('tts', {})
        self.sovits_config = config.get('sovits', {})
        
        # TTS提供商
        self.current_provider = None
        self.browser_tts = None
        self.sovits_engine = None
        
        # 保持兼容性的属性
        self.mode = "browser"
        self.pretrained_sovits = None
        
        # 模式优先级
        self.priority = self.tts_config.get('priority', ['sovits', 'browser'])
        
    def initialize(self) -> bool:
        """初始化TTS管理器"""
        try:
            logger.info("🚀 初始化SoVITS TTS管理器...")
            
            # 初始化SoVITS推理引擎
            success = self._initialize_sovits_engine()
            if success:
                self.current_provider = 'sovits_engine'
                self.mode = "pretrained_sovits"
                self.pretrained_sovits = self.sovits_engine
                logger.info("✅ SoVITS推理引擎初始化成功")
                return True
            else:
                logger.error("❌ SoVITS推理引擎初始化失败")
                return False
            
        except Exception as e:
            logger.error(f"SoVITS TTS管理器初始化失败: {e}")
            return False
    
    def _initialize_sovits_engine(self) -> bool:
        """初始化SoVITS推理引擎"""
        try:
            logger.info("🚀 初始化SoVITS推理引擎...")
            
            from .sovits_inference_engine import SoVITSInferenceEngine
            
            # 创建SoVITS推理引擎实例
            self.sovits_engine = SoVITSInferenceEngine(self.config)
            
            logger.info("✅ SoVITS推理引擎初始化成功")
            return True
                
        except Exception as e:
            logger.error(f"SoVITS推理引擎初始化失败: {e}")
            self.sovits_engine = None
            return False
    
    def clean_text(self, text):
        # 只保留中英文、数字、常用标点
        return re.sub(r"[^\u4e00-\u9fa5a-zA-Z0-9，。！？,.!?:;\s]", "", text)
    
    def _convert_absolute_path_to_url(self, file_path: str) -> str:
        """将绝对文件路径转换为相对URL路径
        
        Args:
            file_path: 绝对文件路径，如 /home/gpr/AI-Streamer-Phy/temp/generated_audio/file.wav
            
        Returns:
            相对URL路径，如 /temp/generated_audio/file.wav
        """
        try:
            # 获取项目根目录
            path_obj = Path(file_path)
            
            # 查找temp目录及其后的路径
            parts = path_obj.parts
            if 'temp' in parts:
                temp_index = parts.index('temp')
                # 构建相对路径，以/temp/开头
                relative_parts = parts[temp_index:]
                relative_url = '/' + '/'.join(relative_parts)
                logger.info(f"路径转换: {file_path} -> {relative_url}")
                return relative_url
            else:
                logger.warning(f"无法在路径中找到temp目录: {file_path}")
                # 回退方案：如果找不到temp，就使用文件名
                return f"/temp/generated_audio/{path_obj.name}"
                
        except Exception as e:
            logger.error(f"路径转换失败: {e}")
            # 错误情况下的回退方案
            return f"/temp/generated_audio/{Path(file_path).name}"
    
    async def synthesize(self, text: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        合成语音 - 使用SoVITS
        
        Args:
            text: 要合成的文本
            **kwargs: 其他参数
            
        Returns:
            合成结果字典或None
        """
        try:
            text = self.clean_text(text.strip())
            if not text:
                logger.error("❌ 文本为空，无法合成语音")
                return None
            
            logger.info(f"🎵 开始SoVITS语音合成: {text[:50]}...")
            
            # 必须使用SoVITS推理引擎
            if not self.sovits_engine:
                logger.error("❌ SoVITS推理引擎未初始化")
                return None
                
            # 使用异步方法生成语音
            audio_path = await self.sovits_engine.generate_speech(text)
                
            if audio_path and os.path.exists(audio_path):
                logger.info(f"✅ SoVITS语音合成成功: {audio_path}")
                
                # 将绝对路径转换为相对URL路径
                audio_url = self._convert_absolute_path_to_url(audio_path)
                
                return {
                    "type": "sovits_audio",
                    "text": text,
                    "audio_file": audio_url,  # 使用转换后的相对URL
                    "voice_params": {
                        "rate": 1.0,
                        "pitch": 1.0,
                        "volume": 1.0
                    }
                }
            else:
                logger.error("❌ SoVITS语音合成失败")
                return None
            
        except Exception as e:
            logger.error(f"❌ SoVITS语音合成异常: {e}")
            return None
    
    def synthesize_sync(self, text: str, **kwargs) -> Optional[str]:
        """
        同步版本的语音合成，返回音频文件路径
        
        Args:
            text: 要合成的文本
            **kwargs: 其他参数
            
        Returns:
            合成的音频文件路径
        """
        try:
            # 清理文本
            text = text.strip()
            if not text:
                logger.warning("文本为空，跳过语音合成")
                return None
            
            logger.info(f"🎵 开始合成语音: {text[:50]}...")
            
            # 尝试使用SoVITS推理引擎
            if self.current_provider == 'sovits_engine' and self.sovits_engine:
                # 使用同步方式调用异步方法
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(self.sovits_engine.generate_speech(text, **kwargs))
                    if result:
                        logger.info("✅ SoVITS推理引擎合成成功")
                        return result
                    else:
                        logger.warning("⚠️ SoVITS推理引擎合成失败，回退到浏览器TTS")
                finally:
                    loop.close()
            
            # 回退到浏览器TTS（返回None让前端处理）
            logger.info("📢 使用浏览器TTS合成")
            return None
            
        except Exception as e:
            logger.error(f"语音合成失败: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """获取TTS状态"""
        try:
            status = {
                "enabled": self.tts_config.get('enabled', True),
                "current_provider": self.current_provider,
                "providers": {}
            }
            
            # 浏览器TTS状态
            status["providers"]["browser"] = {
                "available": True,
                "status": "ready"
            }
            
            # SoVITS推理引擎状态
            if self.sovits_engine:
                engine_status = self.sovits_engine.get_status()
                status["providers"]["sovits_engine"] = engine_status
            else:
                status["providers"]["sovits_engine"] = {
                    "available": False,
                    "status": "not_initialized"
                }
            
            return status
            
        except Exception as e:
            logger.error(f"获取TTS状态失败: {e}")
            return {"enabled": False, "error": str(e)}
    
    def get_tts_status(self, ws=None) -> Dict[str, Any]:
        """兼容旧接口的状态获取方法"""
        if self.sovits_engine:
            # 返回SoVITS引擎状态
            return self.sovits_engine.get_status()
        else:
            # 返回浏览器TTS状态
            return {
                "mode": self.mode,
                "provider": self.current_provider,
                "available": True,
                "status": "ready"
            }
    
    def switch_provider(self, provider: str) -> bool:
        """切换TTS提供商"""
        try:
            logger.info(f"🔄 切换TTS提供商: {provider}")
            
            if provider == 'sovits_engine':
                if self.sovits_engine:
                    self.current_provider = provider
                    self.mode = "pretrained_sovits"
                    logger.info("✅ 切换到SoVITS推理引擎")
                    return True
                else:
                    # 尝试重新初始化
                    success = self._initialize_sovits_engine()
                    if success:
                        self.current_provider = provider
                        self.mode = "pretrained_sovits"
                        logger.info("✅ 重新初始化并切换到SoVITS推理引擎")
                        return True
                    else:
                        logger.error("❌ SoVITS推理引擎不可用")
                        return False
            
            elif provider == 'browser':
                self.current_provider = provider
                self.mode = "browser"
                logger.info("✅ 切换到浏览器TTS")
                return True
            
            else:
                logger.error(f"不支持的TTS提供商: {provider}")
                return False
                
        except Exception as e:
            logger.error(f"切换TTS提供商失败: {e}")
            return False
    
    def switch_to_browser(self):
        """切换到浏览器TTS"""
        return self.switch_provider('browser')
    
    def switch_to_trained_model(self):
        """切换到训练模型"""
        return self.switch_provider('sovits_engine')
    
    async def train_voice(self) -> bool:
        """训练语音模型"""
        logger.info("🎤 开始语音训练...")
        # 这里可以添加语音训练逻辑
        return True
    
    def cleanup(self):
        """清理资源"""
        logger.info("🧹 清理TTS管理器资源...")
        try:
            if self.sovits_engine:
                self.sovits_engine.cleanup()
                self.sovits_engine = None
        except Exception as e:
            logger.error(f"清理TTS管理器资源失败: {e}")
        finally:
            logger.info("✅ TTS管理器资源清理完成")
    
    def __del__(self):
        """析构函数"""
        try:
            self.cleanup()
        except:
            pass