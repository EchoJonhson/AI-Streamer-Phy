#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI虚拟主播应用 - 主程序 (修复版)
使用修复后的GPT-SoVITS配置和路径
"""

import os
import sys
import logging
import asyncio
import json
import signal
import traceback
from pathlib import Path

# 添加项目根目录到Python路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)  # 项目根目录
sys.path.insert(0, BASE_DIR)

# 添加GPT-SoVITS路径
GPT_SOVITS_PATH = os.path.join(BASE_DIR, "GPT-SoVITS")
if os.path.exists(GPT_SOVITS_PATH):
    sys.path.insert(0, GPT_SOVITS_PATH)
    sys.path.insert(0, os.path.join(GPT_SOVITS_PATH, "GPT_SoVITS"))

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(BASE_DIR, 'app.log'), encoding='utf-8')
    ]
)

logger = logging.getLogger(__name__)

# 导入应用模块
try:
    from src.open_llm_vtuber.config import ConfigManager
    from src.open_llm_vtuber.chat_history import chat_history
    from src.open_llm_vtuber.llm_manager import llm_manager
    from src.open_llm_vtuber.live2d_model import Live2DModel
    from src.open_llm_vtuber.tts_manager import TTSManager
    from src.open_llm_vtuber.sovits_inference_engine import SoVITSInferenceEngine
    from src.open_llm_vtuber.server import create_app
    
    logger.info("✅ 所有模块导入成功")
    
except ImportError as e:
    logger.error(f"❌ 模块导入失败: {e}")
    logger.error("请确保已安装所有依赖: pip install -r requirements.txt")
    sys.exit(1)

# WebSocket和Web相关
import websockets
from websockets.server import serve
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK
import webbrowser
import threading
import time

# HTTP服务器
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs

# 应用模块
from src.open_llm_vtuber.agent import create_agent

# 全局变量
config = None
tts_manager = None
sovits_engine = None

async def main():
    """主程序入口"""
    global config, tts_manager, sovits_engine
    
    logger.info("🚀 启动AI虚拟主播应用 (修复版)")
    
    try:
        # 初始化配置管理器
        config = ConfigManager()
        logger.info("✅ 配置管理器初始化成功")
        
        # 初始化SoVITS推理引擎
        logger.info("🔧 初始化SoVITS推理引擎...")
        sovits_engine = SoVITSInferenceEngine(config.config)
        logger.info("✅ SoVITS推理引擎初始化成功")
        
        # 初始化TTS管理器
        logger.info("🔧 初始化TTS管理器...")
        tts_manager = TTSManager(config.config)
        tts_manager.initialize()
        logger.info("✅ TTS管理器初始化成功")
        
        # 获取配置
        app_config = config.get_app_config()
        live2d_config = config.get_live2d_config()
        llm_config = config.get_llm_config()
        character_config = config.get_character_config()
        sovits_config = config.config.get("sovits", {})
        
        # 检查SoVITS模型文件
        logger.info("🔧 检查SoVITS模型文件...")
        gpt_model_path = sovits_config.get('pretrained_gpt_model', '')
        sovits_model_path = sovits_config.get('pretrained_sovits_model', '')
        ref_audio_path = sovits_config.get('reference_audio', '')
        
        if os.path.exists(gpt_model_path):
            logger.info(f"✅ GPT模型存在: {os.path.basename(gpt_model_path)}")
        else:
            logger.error(f"❌ GPT模型不存在: {gpt_model_path}")
            
        if os.path.exists(sovits_model_path):
            logger.info(f"✅ SoVITS模型存在: {os.path.basename(sovits_model_path)}")
        else:
            logger.error(f"❌ SoVITS模型不存在: {sovits_model_path}")
            
        if os.path.exists(ref_audio_path):
            logger.info(f"✅ 参考音频存在: {os.path.basename(ref_audio_path)}")
        else:
            logger.error(f"❌ 参考音频不存在: {ref_audio_path}")
        
        # 检查Live2D模型文件
        model_path = live2d_config.get('model_path', '/home/gpr/AI-Streamer-Phy/public/live2d/models/wuwuwu/wuwuwu.model3.json')
        full_model_path = os.path.join(BASE_DIR, model_path)
        
        if not os.path.exists(full_model_path):
            logger.warning(f"⚠️ Live2D模型文件不存在: {full_model_path}")
            logger.warning("将使用默认模型设置继续运行")
        else:
            logger.info(f"✅ Live2D模型存在: {os.path.basename(model_path)}")
        
        # 初始化Live2D模型
        model_name = live2d_config.get('model_name', 'wuwuwu')
        live2d_model = Live2DModel(model_name=model_name, model_path=full_model_path)
        
        # 创建并启动服务器
        app = await create_app(live2d_model)
        
        # 输出启动信息
        logger.info("=" * 60)
        logger.info("🎉 AI虚拟主播应用启动成功！")
        logger.info("📝 系统配置：")
        logger.info(f"   - 应用名称: {app_config.get('name', 'AI虚拟主播')}")
        logger.info(f"   - 版本: {app_config.get('version', '2.0.0')}")
        logger.info(f"   - 角色名称: {character_config.get('name', '小雨')}")
        logger.info(f"   - LLM提供商: {llm_config.get('provider', 'qwen')}")
        logger.info(f"   - TTS模式: {tts_manager.current_provider or 'sovits'}")
        logger.info("🎯 功能特性：")
        logger.info("   - Live2D模型展示与交互")
        logger.info("   - SoVITS高质量语音合成")
        logger.info("   - Arona预训练语音模型")
        logger.info("   - 智能聊天对话系统")
        logger.info("   - 情感分析与表情控制")
        logger.info("   - 聊天记录持久化存储")
        logger.info("   - 实时WebSocket通信")
        
        if config.is_feature_enabled('emotion_analysis'):
            logger.info("   - 情感分析已启用")
        if config.is_feature_enabled('chat_history'):
            logger.info("   - 聊天记录已启用")
        
        # 检查Qwen API状态（异步检查）
        try:
            from src.open_llm_vtuber.qwen_client import QwenClient
            qwen_client = QwenClient()
            test_response = await qwen_client.generate_response("你好")
            if test_response:
                logger.info("✅ Qwen API连接正常")
            else:
                logger.warning("⚠️  Qwen API连接失败，将使用回退回复")
        except Exception as e:
            logger.warning(f"⚠️  Qwen API连接检查异常: {e}")
            logger.warning("将使用回退回复")
        
        # 显示统计信息
        stats = chat_history.get_statistics()
        if stats['total_messages'] > 0:
            logger.info(f"📊 聊天统计: 总消息 {stats['total_messages']} 条，本周 {stats['recent_messages']} 条")
        
        host = app_config.get('host', '0.0.0.0')
        port = app_config.get('port', 8001)  # 使用修改后的端口
        
        logger.info(f"🌐 访问地址：http://{host if host != '0.0.0.0' else 'localhost'}:{port}")
        logger.info("💡 使用说明：")
        logger.info("   - 左侧侧边栏进行聊天对话")
        logger.info("   - TTS面板选择Arona语音模式")
        logger.info("   - 右侧Live2D模型展示")
        logger.info("   - 表情控制按钮")
        logger.info("   - 点击模型触发随机表情")
        logger.info("   - 点击🔊按钮测试Arona语音")
        logger.info("=" * 60)
        
        # 运行服务器
        await app.run(host=host, port=port)
    
    except Exception as e:
        logger.error(f"❌ 应用启动失败: {e}")
        traceback.print_exc()
        sys.exit(1)

def check_environment():
    """检查运行环境"""
    # 检查Python版本
    if sys.version_info < (3, 7):
        logger.error("❌ Python版本必须大于等于3.7")
        sys.exit(1)
    
    # 检查必要的目录
    public_dir = os.path.join(BASE_DIR, 'public')
    if not os.path.exists(public_dir):
        logger.warning(f"⚠️ 静态文件目录不存在: {public_dir}")
        logger.warning("创建public目录")
        os.makedirs(public_dir, exist_ok=True)
    
    # 检查Live2D模型目录
    model_dir = os.path.join(public_dir, 'live2d', 'models')
    if not os.path.exists(model_dir):
        logger.warning(f"⚠️ Live2D模型目录不存在: {model_dir}")
        logger.warning("创建模型目录")
        os.makedirs(model_dir, exist_ok=True)
    
    # 检查GPT-SoVITS目录
    if not os.path.exists(GPT_SOVITS_PATH):
        logger.error(f"❌ GPT-SoVITS目录不存在: {GPT_SOVITS_PATH}")
        logger.error("请确保GPT-SoVITS已正确安装")
        sys.exit(1)
    else:
        logger.info(f"✅ GPT-SoVITS目录存在: {GPT_SOVITS_PATH}")
    
    logger.info("✅ 环境检查完成")

def print_banner():
    """打印启动横幅"""
    banner = """
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║                  🎭 AI虚拟主播系统 🎭                      ║
    ║                                                          ║
    ║              基于Live2D + GPT-SoVITS技术栈                ║
    ║                                                          ║
    ║  特性：智能对话 | Arona语音 | 模型训练 | 表情控制 | 实时互动  ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    """
    print(banner)

if __name__ == "__main__":
    # 打印启动横幅
    print_banner()
    
    # 检查环境
    check_environment()
    
    try:
        # 启动主程序
        if sys.platform == 'win32':
            # Windows平台特殊处理
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
        # 运行主程序
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 应用已被用户终止")
        print("\n感谢使用AI虚拟主播系统！")
    except Exception as e:
        logger.error(f"❌ 运行时错误: {e}")
        traceback.print_exc()
        sys.exit(1) 