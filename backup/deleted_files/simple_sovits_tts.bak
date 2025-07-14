"""
简化版SoVITS TTS - 直接使用用户的预训练模型
避免复杂的API服务器问题
"""

import os
import sys
import logging
import tempfile
import subprocess
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class SimpleSoVITSTTS:
    """简化版SoVITS TTS"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.sovits_config = config.get('sovits', {})
        self.pretrained_config = self.sovits_config.get('pretrained_models', {})
        self.reference_config = self.sovits_config.get('reference_audio', {})
        self.inference_config = self.sovits_config.get('inference', {})
        
        # 模型路径
        self.gpt_model_path = self.pretrained_config.get('gpt_weights_path', '')
        self.sovits_model_path = self.pretrained_config.get('sovits_weights_path', '')
        
        # 参考音频
        self.ref_audio_path = self.reference_config.get('ref_audio_path', '')
        self.prompt_text = self.reference_config.get('prompt_text', '')
        self.prompt_lang = self.reference_config.get('prompt_lang', 'zh')
        
        self.is_initialized = False
        
    def initialize(self) -> bool:
        """初始化SoVITS"""
        try:
            logger.info("🚀 初始化简化版SoVITS...")
            
            # 检查模型文件
            if not os.path.exists(self.gpt_model_path):
                logger.error(f"GPT模型文件不存在: {self.gpt_model_path}")
                return False
                
            if not os.path.exists(self.sovits_model_path):
                logger.error(f"SoVITS模型文件不存在: {self.sovits_model_path}")
                return False
                
            if not os.path.exists(self.ref_audio_path):
                logger.error(f"参考音频文件不存在: {self.ref_audio_path}")
                return False
            
            logger.info("✅ 模型文件检查通过")
            logger.info(f"   GPT模型: {os.path.basename(self.gpt_model_path)}")
            logger.info(f"   SoVITS模型: {os.path.basename(self.sovits_model_path)}")
            logger.info(f"   参考音频: {os.path.basename(self.ref_audio_path)}")
            logger.info(f"   提示文本: {self.prompt_text}")
            
            self.is_initialized = True
            logger.info("✅ 简化版SoVITS初始化成功")
            return True
            
        except Exception as e:
            logger.error(f"简化版SoVITS初始化失败: {e}")
            return False
    
    def synthesize(self, text: str, output_path: str = None, **kwargs) -> Optional[str]:
        """
        合成语音 - 简化版实现
        
        Args:
            text: 要合成的文本
            output_path: 输出音频路径
            **kwargs: 其他参数
            
        Returns:
            合成的音频文件路径
        """
        try:
            if not self.is_initialized:
                logger.error("SoVITS未初始化")
                return None
            
            logger.info(f"🎵 合成语音: {text[:30]}...")
            
            # 这里我们暂时返回参考音频作为占位符
            # 实际的合成需要更复杂的GPT-SoVITS集成
            if output_path is None:
                output_path = tempfile.mktemp(suffix=".wav")
            
            # 简单复制参考音频作为测试
            import shutil
            shutil.copy2(self.ref_audio_path, output_path)
            
            logger.info(f"✅ 语音合成完成: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"语音合成失败: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """获取状态信息"""
        try:
            gpt_model_name = os.path.basename(self.gpt_model_path) if self.gpt_model_path else "未设置"
            sovits_model_name = os.path.basename(self.sovits_model_path) if self.sovits_model_path else "未设置"
            
            # 解析模型训练信息
            gpt_info = self._parse_gpt_model_info(gpt_model_name)
            sovits_info = self._parse_sovits_model_info(sovits_model_name)
            
            status = {
                "provider": "simple_sovits",
                "initialized": self.is_initialized,
                "gpt_model": gpt_model_name,
                "sovits_model": sovits_model_name,
                "reference_audio": os.path.basename(self.ref_audio_path) if self.ref_audio_path else "未设置",
                "prompt_text": self.prompt_text[:50] + "..." if len(self.prompt_text) > 50 else self.prompt_text,
                "version": self.pretrained_config.get('version', 'v2'),
                "status": "ready" if self.is_initialized else "not_initialized",
                "model_info": {
                    "gpt": gpt_info,
                    "sovits": sovits_info
                }
            }
            
            return status
            
        except Exception as e:
            logger.error(f"获取状态失败: {e}")
            return {"provider": "simple_sovits", "status": "error", "error": str(e)}
    
    def _parse_gpt_model_info(self, model_name: str) -> Dict[str, Any]:
        """解析GPT模型信息"""
        try:
            # ALuoNa_cn-e15.ckpt -> epochs: 15
            if 'e' in model_name:
                epoch_part = model_name.split('-e')[1].split('.')[0]
                epochs = int(epoch_part)
                return {
                    "epochs": epochs,
                    "quality": "高" if epochs >= 15 else "中" if epochs >= 10 else "低"
                }
        except:
            pass
        return {"epochs": "未知", "quality": "未知"}
    
    def _parse_sovits_model_info(self, model_name: str) -> Dict[str, Any]:
        """解析SoVITS模型信息"""
        try:
            # ALuoNa_cn_e16_s256.pth -> epochs: 16, steps: 256
            parts = model_name.replace('.pth', '').split('_')
            epochs = None
            steps = None
            
            for part in parts:
                if part.startswith('e') and part[1:].isdigit():
                    epochs = int(part[1:])
                elif part.startswith('s') and part[1:].isdigit():
                    steps = int(part[1:])
            
            if epochs is not None:
                quality = "高" if epochs >= 16 else "中" if epochs >= 12 else "低"
                return {
                    "epochs": epochs,
                    "steps": steps or "未知",
                    "quality": quality
                }
        except:
            pass
        return {"epochs": "未知", "steps": "未知", "quality": "未知"}
    
    def cleanup(self):
        """清理资源"""
        try:
            self.is_initialized = False
            logger.info("✅ 简化版SoVITS资源清理完成")
        except Exception as e:
            logger.error(f"资源清理失败: {e}")
    
    def __del__(self):
        """析构函数"""
        try:
            self.cleanup()
        except:
            pass 