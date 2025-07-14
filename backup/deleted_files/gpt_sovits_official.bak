"""
GPT-SoVITS官方API集成
按照官方GitHub文档实现: https://github.com/RVC-Boss/GPT-SoVITS
"""

import os
import sys
import requests
import subprocess
import time
import logging
from typing import Optional, Dict, Any
import json
import tempfile
import threading
from pathlib import Path

logger = logging.getLogger(__name__)

class GPTSoVITSOfficial:
    """GPT-SoVITS官方API集成类"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.sovits_config = config.get('sovits', {})
        self.sovits_path = self.sovits_config.get('sovits_path', 'GPT-SoVITS')
        self.api_url = "http://127.0.0.1:9880"
        self.api_process = None
        self.is_initialized = False
        
        # 模型路径配置
        self.pretrained_config = self.sovits_config.get('pretrained_models', {})
        self.gpt_model_path = self.pretrained_config.get('gpt_weights_path', '')
        self.sovits_model_path = self.pretrained_config.get('sovits_weights_path', '')
        
        # 参考音频配置
        self.reference_config = self.sovits_config.get('reference_audio', {})
        self.ref_audio_path = self.reference_config.get('ref_audio_path', '')
        self.prompt_text = self.reference_config.get('prompt_text', '')
        self.prompt_lang = self.reference_config.get('prompt_lang', 'zh')
        
        # 推理参数
        self.inference_config = self.sovits_config.get('inference', {})
        
    def _check_dependencies(self) -> bool:
        """检查依赖是否满足"""
        try:
            # 检查GPT-SoVITS目录
            if not os.path.exists(self.sovits_path):
                logger.error(f"GPT-SoVITS目录不存在: {self.sovits_path}")
                return False
                
            # 检查模型文件
            if not os.path.exists(self.gpt_model_path):
                logger.error(f"GPT模型文件不存在: {self.gpt_model_path}")
                return False
                
            if not os.path.exists(self.sovits_model_path):
                logger.error(f"SoVITS模型文件不存在: {self.sovits_model_path}")
                return False
                
            # 检查参考音频
            if not os.path.exists(self.ref_audio_path):
                logger.error(f"参考音频文件不存在: {self.ref_audio_path}")
                return False
                
            logger.info("✅ 所有依赖检查通过")
            return True
            
        except Exception as e:
            logger.error(f"依赖检查失败: {e}")
            return False
    
    def _start_api_server(self) -> bool:
        """启动GPT-SoVITS API服务器"""
        try:
            # 检查端口是否已被占用
            if self._check_api_server():
                logger.info("✅ API服务器已经在运行")
                return True
            
            logger.info("🚀 启动GPT-SoVITS API服务器...")
            
            # 构建启动命令
            api_script = os.path.join(self.sovits_path, "api_v2.py")
            if not os.path.exists(api_script):
                api_script = os.path.join(self.sovits_path, "api.py")
                
            if not os.path.exists(api_script):
                logger.error(f"API脚本不存在: {api_script}")
                return False
            
            # 启动API服务器
            cmd = [
                sys.executable, api_script,
                "--gpt_path", self.gpt_model_path,
                "--sovits_path", self.sovits_model_path,
                "--host", "127.0.0.1",
                "--port", "9880"
            ]
            
            logger.info(f"执行命令: {' '.join(cmd)}")
            
            # 在GPT-SoVITS目录下启动
            self.api_process = subprocess.Popen(
                cmd,
                cwd=self.sovits_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # 等待服务器启动
            max_wait = 30
            for i in range(max_wait):
                time.sleep(1)
                if self._check_api_server():
                    logger.info("✅ API服务器启动成功")
                    return True
                logger.info(f"等待API服务器启动... ({i+1}/{max_wait})")
            
            logger.error("❌ API服务器启动超时")
            return False
            
        except Exception as e:
            logger.error(f"启动API服务器失败: {e}")
            return False
    
    def _check_api_server(self) -> bool:
        """检查API服务器是否运行"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def _set_model(self) -> bool:
        """设置模型"""
        try:
            # 设置GPT模型
            gpt_response = requests.post(
                f"{self.api_url}/set_gpt_weights",
                json={"weights_path": self.gpt_model_path}
            )
            
            if gpt_response.status_code != 200:
                logger.error(f"设置GPT模型失败: {gpt_response.text}")
                return False
            
            # 设置SoVITS模型
            sovits_response = requests.post(
                f"{self.api_url}/set_sovits_weights",
                json={"weights_path": self.sovits_model_path}
            )
            
            if sovits_response.status_code != 200:
                logger.error(f"设置SoVITS模型失败: {sovits_response.text}")
                return False
            
            logger.info("✅ 模型设置成功")
            return True
            
        except Exception as e:
            logger.error(f"设置模型失败: {e}")
            return False
    
    def initialize(self) -> bool:
        """初始化GPT-SoVITS"""
        try:
            logger.info("🚀 初始化GPT-SoVITS官方API...")
            
            # 检查依赖
            if not self._check_dependencies():
                return False
            
            # 启动API服务器
            if not self._start_api_server():
                return False
            
            # 设置模型
            if not self._set_model():
                return False
            
            self.is_initialized = True
            logger.info("✅ GPT-SoVITS初始化成功")
            return True
            
        except Exception as e:
            logger.error(f"初始化失败: {e}")
            return False
    
    def synthesize(self, text: str, output_path: str = None, **kwargs) -> Optional[str]:
        """
        合成语音
        
        Args:
            text: 要合成的文本
            output_path: 输出音频路径
            **kwargs: 其他参数
            
        Returns:
            合成的音频文件路径
        """
        try:
            if not self.is_initialized:
                logger.error("GPT-SoVITS未初始化")
                return None
            
            # 准备请求参数
            params = {
                "text": text,
                "text_lang": self.inference_config.get('text_lang', 'zh'),
                "ref_audio_path": self.ref_audio_path,
                "prompt_text": self.prompt_text,
                "prompt_lang": self.prompt_lang,
                "top_k": self.inference_config.get('top_k', 5),
                "top_p": self.inference_config.get('top_p', 0.9),
                "temperature": self.inference_config.get('temperature', 0.6),
                "text_split_method": "cut5",
                "batch_size": self.inference_config.get('batch_size', 1),
                "speed_factor": self.inference_config.get('speed', 1.0),
                "seed": -1,
                "media_type": "wav",
                "streaming_mode": False
            }
            
            # 发送合成请求
            logger.info(f"🎵 开始合成语音: {text[:50]}...")
            response = requests.post(
                f"{self.api_url}/tts",
                json=params,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"语音合成失败: {response.text}")
                return None
            
            # 保存音频文件
            if output_path is None:
                output_path = tempfile.mktemp(suffix=".wav")
            
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"✅ 语音合成成功: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"语音合成失败: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """获取状态信息"""
        try:
            status = {
                "provider": "gpt_sovits_official",
                "initialized": self.is_initialized,
                "api_server_running": self._check_api_server(),
                "gpt_model": os.path.basename(self.gpt_model_path),
                "sovits_model": os.path.basename(self.sovits_model_path),
                "reference_audio": os.path.basename(self.ref_audio_path),
                "prompt_text": self.prompt_text[:50] + "..." if len(self.prompt_text) > 50 else self.prompt_text
            }
            
            if self.is_initialized:
                status["version"] = self.pretrained_config.get('version', 'v2')
                status["status"] = "ready"
            else:
                status["status"] = "not_initialized"
                
            return status
            
        except Exception as e:
            logger.error(f"获取状态失败: {e}")
            return {"provider": "gpt_sovits_official", "status": "error", "error": str(e)}
    
    def cleanup(self):
        """清理资源"""
        try:
            if self.api_process:
                logger.info("🛑 关闭API服务器...")
                self.api_process.terminate()
                self.api_process.wait(timeout=10)
                self.api_process = None
            
            self.is_initialized = False
            logger.info("✅ 资源清理完成")
            
        except Exception as e:
            logger.error(f"资源清理失败: {e}")
    
    def __del__(self):
        """析构函数"""
        self.cleanup() 