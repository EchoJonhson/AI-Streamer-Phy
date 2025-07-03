#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预训练SoVITS TTS管理器 - 直接使用预训练模型
"""

import asyncio
import logging
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import numpy as np
import torch

logger = logging.getLogger(__name__)

class PretrainedSoVITSTTS:
    """预训练SoVITS TTS管理器"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.sovits_config = config.get('sovits', {})
        
        # 检查是否使用预训练模型
        self.use_pretrained = self.sovits_config.get('use_pretrained', False)
        
        if not self.use_pretrained:
            logger.warning("未启用预训练模式，请在config.yaml中设置use_pretrained: true")
            return
            
        # 预训练模型配置
        self.pretrained_config = self.sovits_config.get('pretrained_models', {})
        self.gpt_weights_path = self.pretrained_config.get('gpt_weights_path', '')
        self.sovits_weights_path = self.pretrained_config.get('sovits_weights_path', '')
        self.model_version = self.pretrained_config.get('version', 'v2')
        
        # 参考音频配置
        self.ref_config = self.sovits_config.get('reference_audio', {})
        self.ref_audio_path = self.ref_config.get('ref_audio_path', '')
        self.prompt_text = self.ref_config.get('prompt_text', '')
        self.prompt_lang = self.ref_config.get('prompt_lang', 'zh')
        
        # 推理参数
        self.inference_config = self.sovits_config.get('inference', {})
        self.temperature = self.inference_config.get('temperature', 0.6)
        self.top_p = self.inference_config.get('top_p', 0.9)
        self.top_k = self.inference_config.get('top_k', 5)
        self.speed = self.inference_config.get('speed', 1.0)
        self.text_lang = self.inference_config.get('text_lang', 'zh')
        self.sample_steps = self.inference_config.get('sample_steps', 32)
        self.super_sampling = self.inference_config.get('super_sampling', False)
        
        # TTS模型实例
        self.tts_model = None
        self.is_initialized = False
        
        # 状态信息
        self.status = {
            'initialized': False,
            'model_loaded': False,
            'gpt_model_path': self.gpt_weights_path,
            'sovits_model_path': self.sovits_weights_path,
            'version': self.model_version,
            'error': None
        }
        
        # 初始化模型
        self._initialize_model()
    
    def _initialize_model(self):
        """初始化预训练模型"""
        try:
            logger.info("🚀 初始化预训练SoVITS模型...")
            
            # 检查模型文件是否存在
            if not self._check_model_files():
                return False
            
            # 添加GPT-SoVITS路径到sys.path
            sovits_path = Path(self.sovits_config.get('sovits_path', 'GPT-SoVITS'))
            if sovits_path.exists():
                sys.path.insert(0, str(sovits_path))
                sys.path.insert(0, str(sovits_path / 'GPT_SoVITS'))
            
            # 导入GPT-SoVITS模块
            from TTS_infer_pack.TTS import TTS, TTS_Config
            
            # 创建自定义配置 - 使用绝对路径
            custom_config = {
                "device": "cpu",
                "is_half": False, 
                "version": self.model_version,
                "t2s_weights_path": self.gpt_weights_path,
                "vits_weights_path": self.sovits_weights_path,
                "cnhuhbert_base_path": "C:/Users/MSIK/Desktop/ChatBot/aistreamer/GPT-SoVITS/GPT_SoVITS/pretrained_models/chinese-hubert-base",
                "bert_base_path": "C:/Users/MSIK/Desktop/ChatBot/aistreamer/GPT-SoVITS/GPT_SoVITS/pretrained_models/chinese-roberta-wwm-ext-large",
            }
            
            # 初始化TTS模型
            logger.info(f"📦 加载模型: GPT={Path(self.gpt_weights_path).name}, SoVITS={Path(self.sovits_weights_path).name}")
            
            tts_config = TTS_Config({"custom": custom_config})
            self.tts_model = TTS(tts_config)
            
            self.is_initialized = True
            self.status.update({
                'initialized': True,
                'model_loaded': True,
                'error': None
            })
            
            logger.info("✅ 预训练SoVITS模型初始化成功")
            logger.info(f"🎭 模型版本: {self.model_version}")
            logger.info(f"📄 GPT模型: {Path(self.gpt_weights_path).name}")
            logger.info(f"🎵 SoVITS模型: {Path(self.sovits_weights_path).name}")
            
            return True
            
        except Exception as e:
            error_msg = f"预训练模型初始化失败: {e}"
            logger.error(error_msg)
            self.status.update({
                'initialized': False,
                'model_loaded': False,
                'error': error_msg
            })
            return False
    
    def _check_model_files(self) -> bool:
        """检查模型文件是否存在"""
        if not self.gpt_weights_path or not self.sovits_weights_path:
            logger.error("❌ 模型路径未配置")
            return False
        
        gpt_path = Path(self.gpt_weights_path)
        sovits_path = Path(self.sovits_weights_path)
        
        if not gpt_path.exists():
            logger.error(f"❌ GPT模型文件不存在: {gpt_path}")
            return False
            
        if not sovits_path.exists():
            logger.error(f"❌ SoVITS模型文件不存在: {sovits_path}")
            return False
        
        logger.info(f"✅ 模型文件检查通过")
        logger.info(f"  GPT模型: {gpt_path} ({gpt_path.stat().st_size / 1024 / 1024:.1f}MB)")
        logger.info(f"  SoVITS模型: {sovits_path} ({sovits_path.stat().st_size / 1024 / 1024:.1f}MB)")
        
        return True
    
    async def synthesize(self, text: str, ref_audio_path: str = None, prompt_text: str = None) -> Optional[Tuple[int, np.ndarray]]:
        """合成语音
        
        Args:
            text: 要合成的文本
            ref_audio_path: 参考音频路径（可选）
            prompt_text: 参考音频对应文本（可选）
            
        Returns:
            (采样率, 音频数据)元组，失败返回None
        """
        if not self.is_initialized:
            logger.error("❌ 模型未初始化")
            return None
        
        if not text or not text.strip():
            logger.warning("文本为空，跳过合成")
            return None
        
        try:
            text = text.strip()
            
            # 使用配置中的参考音频或传入的参考音频
            ref_audio = ref_audio_path or self.ref_audio_path
            prompt = prompt_text or self.prompt_text
            
            if not ref_audio:
                logger.warning("⚠️ 未设置参考音频，将使用默认设置")
                # 可以设置一个默认的参考音频
                ref_audio = ""
            
            # 构建推理参数
            inputs = {
                "text": text,
                "text_lang": self.text_lang,
                "ref_audio_path": ref_audio,
                "prompt_text": prompt,
                "prompt_lang": self.prompt_lang,
                "top_k": self.top_k,
                "top_p": self.top_p,
                "temperature": self.temperature,
                "text_split_method": "cut5",
                "batch_size": 1,
                "speed_factor": self.speed,
                "seed": -1,
                "parallel_infer": True,
                "repetition_penalty": 1.35,
                "sample_steps": self.sample_steps,
                "super_sampling": self.super_sampling,
            }
            
            logger.info(f"🎵 开始合成语音: {text[:50]}...")
            
            # 执行推理
            sr, audio_data = self.tts_model.run(inputs)
            
            if audio_data is not None:
                logger.info(f"✅ 语音合成成功: {len(audio_data)/sr:.2f}秒")
                return sr, audio_data
            else:
                logger.error("❌ 语音合成失败：返回数据为空")
                return None
                
        except Exception as e:
            logger.error(f"语音合成异常: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """获取TTS状态"""
        return {
            "provider": "pretrained_sovits",
            "initialized": self.is_initialized,
            "use_pretrained": self.use_pretrained,
            "model_info": {
                "gpt_model": Path(self.gpt_weights_path).name if self.gpt_weights_path else "未设置",
                "sovits_model": Path(self.sovits_weights_path).name if self.sovits_weights_path else "未设置",
                "version": self.model_version,
            },
            "reference_audio": {
                "path": self.ref_audio_path,
                "prompt_text": self.prompt_text,
                "prompt_lang": self.prompt_lang,
            },
            "inference_params": {
                "temperature": self.temperature,
                "top_p": self.top_p,
                "top_k": self.top_k,
                "speed": self.speed,
                "text_lang": self.text_lang,
                "sample_steps": self.sample_steps,
                "super_sampling": self.super_sampling,
            },
            "status": self.status
        }
    
    def set_reference_audio(self, ref_audio_path: str, prompt_text: str = "", prompt_lang: str = "zh"):
        """设置参考音频"""
        self.ref_audio_path = ref_audio_path
        self.prompt_text = prompt_text
        self.prompt_lang = prompt_lang
        logger.info(f"🎤 设置参考音频: {Path(ref_audio_path).name}")
    
    def update_inference_params(self, **kwargs):
        """更新推理参数"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
                logger.info(f"🔧 更新参数 {key} = {value}")
    
    def list_available_models(self) -> Dict[str, list]:
        """列出可用的模型文件"""
        gpt_models = []
        sovits_models = []
        
        # 扫描GPT模型文件夹
        gpt_dir = Path("audio_files/中配数据集制/GPT_weights_v2")
        if gpt_dir.exists():
            for file in gpt_dir.glob("*.ckpt"):
                gpt_models.append({
                    "name": file.name,
                    "path": str(file),
                    "size_mb": file.stat().st_size / 1024 / 1024
                })
        
        # 扫描SoVITS模型文件夹  
        sovits_dir = Path("audio_files/中配数据集制/SoVITS_weights_v2")
        if sovits_dir.exists():
            for file in sovits_dir.glob("*.pth"):
                sovits_models.append({
                    "name": file.name,
                    "path": str(file),
                    "size_mb": file.stat().st_size / 1024 / 1024
                })
        
        return {
            "gpt_models": gpt_models,
            "sovits_models": sovits_models
        } 