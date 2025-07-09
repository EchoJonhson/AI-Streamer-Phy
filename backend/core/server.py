import asyncio
import json
import logging
import os
import mimetypes
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import aiohttp
from aiohttp import web

# 暂时注释掉依赖尚未迁移模块的导入，等待后续重构阶段处理
# from ..live2d.live2d_model import Live2DModel
from ..ai.llm_manager import llm_manager
from .config import ConfigManager
from ..ai.chat_history import chat_history
# 暂时注释掉依赖尚未迁移模块的导入，等待后续重构阶段处理
# from ..voice.asr_manager import ASRManager
# from ..voice.tts_manager import TTSManager
# from ..voice.premium_tts import PremiumTTSManager
# from ..voice.voice_api import VoiceAPI
from ..ai.qwen_client import QwenClient

logger = logging.getLogger(__name__)

# 确保正确识别文件MIME类型
mimetypes.init()
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('application/octet-stream', '.moc3')
mimetypes.add_type('application/octet-stream', '.bin')

class AIVTuberServer:
    """AI VTuber服务器类"""

    def __init__(self, live2d_model = None, llm_manager_instance = None):
        """初始化服务器

        Args:
            live2d_model: Live2D模型实例
            llm_manager_instance: 大模型管理器实例（可选）
        """
        self.live2d_model = live2d_model
        self.llm_manager = llm_manager_instance or llm_manager
        self.app = web.Application()
        
        # 初始化配置
        self.config_manager = ConfigManager()
        
        # 初始化Qwen API客户端
        self.qwen_client = QwenClient()
        logger.info("🤖 Qwen API客户端初始化成功")
        
        # 初始化语音管理器
        self.asr_manager = ASRManager(self.config_manager.config)
        self.tts_manager = TTSManager(self.config_manager.config)
        logger.info(f"SoVITS语音系统初始化成功，当前提供商: {self.config_manager.config.get('tts', {}).get('provider', 'sovits')}")
        
        # 不再使用premium_tts，所有语音功能由SoVITS处理
        self.premium_tts_manager = None
        
        # 初始化语音API
        self.voice_api = VoiceAPI()
        
        # 打印当前目录，帮助调试
        current_dir = os.getcwd()
        self.public_dir = os.path.join(current_dir, 'public')
        logger.info(f"当前工作目录: {current_dir}")
        logger.info(f"静态文件目录: {self.public_dir}")
        logger.info(f"静态文件目录是否存在: {os.path.exists(self.public_dir)}")
        if os.path.exists(self.public_dir):
            files = os.listdir(self.public_dir)
            logger.info(f"静态文件目录内容: {files}")
            
            # 检查Live2D库文件
            self._check_live2d_files()
        
        self.setup_routes()
        
        # WebSocket连接列表
        self.websocket_connections = []
        
        # 默认消息
        self.default_messages = [
            "你好，我是AI心理医生小雨。",
            "很高兴为你提供心理咨询服务。",
            "有什么困扰可以和我聊聊。"
        ]
        
        # 当前消息索引
        self.current_message_index = 0
    
    def _check_live2d_files(self):
        """检查Live2D所需的文件是否存在"""
        required_libs = [
            os.path.join(self.public_dir, 'libs', 'live2d.min.js'),
            os.path.join(self.public_dir, 'libs', 'cubism4', 'live2dcubismcore.min.js'),
            os.path.join(self.public_dir, 'libs', 'pixi.min.js'),
            os.path.join(self.public_dir, 'libs', 'pixi-live2d-display.min.js'),
            os.path.join(self.public_dir, 'libs', 'pixi-live2d-initialize.js')
        ]
        
        for lib in required_libs:
            if os.path.exists(lib):
                logger.info(f"文件存在: {lib}")
            else:
                logger.warning(f"文件不存在: {lib}")
    
    def setup_routes(self):
        """设置路由"""
        self.app.router.add_get("/ws", self.websocket_handler)
        self.app.router.add_get("/api/model/config", self.get_model_config)
        
        # 新增API路由
        self.app.router.add_get("/api/config", self.get_app_config)
        self.app.router.add_get("/api/sessions", self.get_sessions)
        self.app.router.add_post("/api/sessions/new", self.create_session)
        self.app.router.add_delete("/api/sessions/{session_id}", self.delete_session)
        self.app.router.add_get("/api/status", self.get_status)
        self.app.router.add_get("/api/statistics", self.get_statistics)
        
        # 语音相关API
        self.app.router.add_post("/api/asr/recognize", self.handle_asr_recognize)
        self.app.router.add_post("/api/tts/synthesize", self.handle_tts_synthesize)
        self.app.router.add_get("/api/speech/providers", self.get_speech_providers)
        
        # 临时音频文件服务
        self.app.router.add_get("/temp/{path:.*}", self.handle_temp_file)
        
        # 设置语音录制和训练API
        self.voice_api.setup_routes(self.app)
        
        # 添加主页路由处理
        self.app.router.add_get("/", self.handle_index)
        
        # 添加通用静态文件路由处理
        self.app.router.add_get("/{path:.*}", self.handle_static_file)
    
    async def handle_index(self, request):
        """处理主页请求
        
        Args:
            request: HTTP请求
            
        Returns:
            FileResponse
        """
        index_path = os.path.join(self.public_dir, 'index.html')
        logger.info(f"请求主页，提供文件: {index_path}")
        logger.info(f"文件是否存在: {os.path.exists(index_path)}")
        
        if os.path.exists(index_path):
            return web.FileResponse(index_path, headers={'Content-Type': 'text/html'})
        else:
            return web.Response(text="找不到主页文件", status=404)
    
    async def handle_static_file(self, request):
        """处理静态文件请求
        
        Args:
            request: HTTP请求
            
        Returns:
            FileResponse 或 Response (404)
        """
        path = request.match_info['path']
        file_path = os.path.join(self.public_dir, path)
        
        logger.info(f"请求静态文件: {path}")
        logger.info(f"完整路径: {file_path}")
        logger.info(f"文件是否存在: {os.path.exists(file_path)}")
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            # 确定正确的MIME类型
            content_type = mimetypes.guess_type(file_path)[0]
            logger.info(f"文件MIME类型: {content_type}")
            
            # 如果无法确定MIME类型，使用通用二进制类型
            if not content_type:
                if file_path.endswith('.js'):
                    content_type = 'application/javascript'
                elif file_path.endswith('.json'):
                    content_type = 'application/json'
                elif file_path.endswith('.moc3'):
                    content_type = 'application/octet-stream'
                else:
                    content_type = 'application/octet-stream'
            
            # 返回文件
            return web.FileResponse(file_path, headers={'Content-Type': content_type})
        else:
            logger.warning(f"文件不存在: {file_path}")
            return web.Response(text=f"找不到文件: {path}", status=404)
    
    async def handle_temp_file(self, request):
        """处理临时文件请求
        
        Args:
            request: HTTP请求
            
        Returns:
            FileResponse 或 Response (404)
        """
        path = request.match_info['path']
        file_path = os.path.join("temp", path)
        
        logger.info(f"请求临时文件: {path}")
        logger.info(f"完整路径: {file_path}")
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            # 确定MIME类型
            content_type = mimetypes.guess_type(file_path)[0]
            if not content_type:
                if file_path.endswith('.wav'):
                    content_type = 'audio/wav'
                elif file_path.endswith('.mp3'):
                    content_type = 'audio/mpeg'
                else:
                    content_type = 'application/octet-stream'
            
            logger.info(f"提供临时文件: {file_path}, MIME: {content_type}")
            return web.FileResponse(file_path, headers={'Content-Type': content_type})
        else:
            logger.warning(f"临时文件不存在: {file_path}")
            return web.Response(text=f"找不到临时文件: {path}", status=404)
    
    async def websocket_handler(self, request):
        """WebSocket连接处理器

        Args:
            request: HTTP请求

        Returns:
            WebSocketResponse
        """
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        
        # 添加到连接列表
        self.websocket_connections.append(ws)
        logger.info(f"WebSocket连接已建立，当前连接数: {len(self.websocket_connections)}")
        
        # 发送初始模型配置
        await self.safe_send_json(ws, {
            "type": "modelConfig",
            "data": self.live2d_model.get_model_config()
        })
        
        try:
            async for msg in ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        await self.handle_websocket_message(ws, data)
                    except json.JSONDecodeError:
                        logger.error(f"无效的JSON格式: {msg.data}")
                elif msg.type == aiohttp.WSMsgType.ERROR:
                    logger.error(f"WebSocket连接错误: {ws.exception()}")
        finally:
            # 移除连接
            if ws in self.websocket_connections:
                self.websocket_connections.remove(ws)
            logger.info(f"WebSocket连接已关闭，当前连接数: {len(self.websocket_connections)}")
        
        return ws
    
    async def handle_websocket_message(self, ws, data):
        """处理WebSocket消息

        Args:
            ws: WebSocket连接
            data: 消息数据
        """
        msg_type = data.get("type")
        logger.info(f"收到WebSocket消息: {msg_type}")
        
        if msg_type == "chat":
            # 处理聊天消息
            message = data.get("message", "").strip()
            if message:
                await self.handle_chat_message(ws, message)
        
        elif msg_type == "getDefaultMessage":
            # 发送默认消息
            message = self.default_messages[self.current_message_index]
            self.current_message_index = (self.current_message_index + 1) % len(self.default_messages)
            
            # 随机表情
            emotion = "happy" if "欢迎" in message else "neutral"
            
            await self.safe_send_json(ws, {
                "type": "chat_response",
                "data": {
                    "text": message,
                    "emotion": emotion
                }
            })
            
            # 发送表情变化命令
            expression_result = await self.live2d_model.express_emotion(emotion)
            await self.safe_send_json(ws, {
                "type": "modelCommand",
                "data": expression_result
            })
        
        elif msg_type == "expression":
            # 处理表情变化请求
            expression = data.get("expression", "neutral")
            result = await self.live2d_model.handle_expression_change(expression)
            await self.safe_send_json(ws, {
                "type": "modelCommand",
                "data": result
            })
        
        elif msg_type == "motion":
            # 处理动作请求
            motion_group = data.get("group", "")
            motion_index = data.get("index", 0)
            result = await self.live2d_model.handle_motion(motion_group, motion_index)
            await self.safe_send_json(ws, {
                "type": "modelCommand",
                "data": result
            })
            
        elif msg_type == "audio_data":
            # 处理音频数据（ASR）
            audio_data = data.get("audio_data", "")
            if audio_data:
                await self.handle_audio_recognition(ws, audio_data)
                
        elif msg_type == "voice_command":
            # 处理语音命令
            command = data.get("command", "")
            if command == "start_listening":
                await self.safe_send_json(ws, {"type": "voice_status", "status": "listening"})
            elif command == "stop_listening":
                await self.safe_send_json(ws, {"type": "voice_status", "status": "stopped"})
                
        elif msg_type == "tts_request":
            # 处理TTS请求
            text = data.get("text", "你好，我是AI心理咨询师小雨！很高兴为你服务，请多多指教！")
            logger.info(f"🎯 开始TTS语音合成: {text[:50]}...")
            
            # 使用TTS管理器合成语音
            tts_result = await self.tts_manager.synthesize(text)
            
            if tts_result:
                # 发送音频文件路径给前端
                await self.safe_send_json(ws, {
                    "type": "tts_response",
                    "audio_file": tts_result["audio_file"],
                    "text": text
                })
            else:
                # TTS失败，回退到浏览器TTS
                logger.error("❌ TTS合成失败，回退到浏览器TTS")
                await self.safe_send_json(ws, {
                    "type": "tts_fallback",
                    "text": text
                })
                
        elif msg_type == "train_voice":
            # 处理SoVITS语音训练请求
            logger.info("收到SoVITS语音训练请求")
            try:
                success = await self.tts_manager.train_voice()
                if success:
                    # 训练成功后，自动播放训练得到的音频
                    logger.info("🎵 训练完成，开始自动播放训练音频...")
                    
                    # 测试文本
                    test_text = "Hi我是虚拟数字人心理疏导师小雨"
                    
                    # 使用训练后的模型合成语音
                    tts_result = await self.tts_manager.synthesize(test_text)
                    
                    if tts_result and tts_result.get("audio_file"):
                        # 发送训练完成消息
                        await self.safe_send_json(ws, {
                            'type': 'voice_trained',
                            'message': '语音模型训练完成，正在播放训练音频...',
                            'success': True
                        })
                        
                        # 发送音频文件给前端播放
                        await self.safe_send_json(ws, {
                            'type': 'tts_response',
                            'audio_file': tts_result["audio_file"],
                            'text': test_text,
                            'auto_play': True,
                            'message': '训练音频播放中...'
                        })
                        
                        logger.info("✅ 训练音频自动播放成功")
                    else:
                        # 训练成功但音频生成失败
                        await self.safe_send_json(ws, {
                            'type': 'voice_trained',
                            'message': '语音模型训练完成，但音频生成失败',
                            'success': True,
                            'audio_play_failed': True
                        })
                        logger.warning("⚠️ 训练完成但音频生成失败")
                else:
                    await self.safe_send_json(ws, {
                        'type': 'error',
                        'message': '语音模型训练失败'
                    })
            except Exception as e:
                logger.error(f"语音训练异常: {e}")
                await self.safe_send_json(ws, {
                    'type': 'error',
                    'message': f'语音训练异常: {str(e)}'
                })
                
        elif msg_type == "get_voice_status":
            # 获取SoVITS语音状态
            try:
                status = self.tts_manager.get_tts_status()
                await self.safe_send_json(ws, {
                    'type': 'voice_status',
                    'data': status
                })
            except Exception as e:
                logger.error(f"获取语音状态失败: {e}")
                await self.safe_send_json(ws, {
                    'type': 'error',
                    'message': f'获取语音状态失败: {str(e)}'
                })
                
        elif msg_type == "switch_tts_mode":
            # 处理TTS模式切换
            mode = data.get("mode", "browser")
            logger.info(f"收到TTS模式切换请求: {mode}")
            try:
                if mode == "pretrained_sovits":
                    success = self.tts_manager.switch_provider('sovits_engine')
                    await self.safe_send_json(ws, {
                        'type': 'tts_mode_switched',
                        'success': success,
                        'mode': mode,
                        'message': '已切换到预训练SoVITS模式' if success else '预训练SoVITS模型未初始化'
                    })
                elif mode == "trained_model":
                    success = self.tts_manager.switch_to_trained_model()
                    await self.safe_send_json(ws, {
                        'type': 'tts_mode_switched',
                        'success': success,
                        'mode': mode,
                        'message': '已切换到自训练模式' if success else '自训练模型不存在'
                    })
                elif mode == "browser":
                    success = self.tts_manager.switch_to_browser()
                    await self.safe_send_json(ws, {
                        'type': 'tts_mode_switched',
                        'success': success,
                        'mode': mode,
                        'message': '已切换到浏览器TTS模式'
                    })
                else:
                    await self.safe_send_json(ws, {
                        'type': 'tts_mode_switched',
                        'success': False,
                        'mode': mode,
                        'message': f'不支持的TTS模式: {mode}'
                    })
                    
                # 发送更新后的状态
                status = self.tts_manager.get_tts_status()
                await self.safe_send_json(ws, {
                    'type': 'voice_status',
                    'data': status
                })
                
            except Exception as e:
                logger.error(f"TTS模式切换异常: {e}")
                await self.safe_send_json(ws, {
                    'type': 'tts_mode_switched',
                    'success': False,
                    'mode': mode,
                    'message': f'模式切换失败: {str(e)}'
                })
                
        elif msg_type == "delete_model":
            # 处理删除模型请求
            logger.info("收到删除模型请求")
            try:
                success = self.tts_manager.delete_model()
                await self.safe_send_json(ws, {
                    'type': 'model_deleted',
                    'success': success,
                    'message': '模型已删除' if success else '删除失败'
                })
                
                # 发送更新后的状态
                status = self.tts_manager.get_tts_status()
                await self.safe_send_json(ws, {
                    'type': 'voice_status',
                    'data': status
                })
                
            except Exception as e:
                logger.error(f"删除模型异常: {e}")
                await self.safe_send_json(ws, {
                    'type': 'model_deleted',
                    'success': False,
                    'message': f'删除失败: {str(e)}'
                })
                
        elif msg_type == "test_voice":
            # 处理语音测试请求
            text = data.get("text", "Hi我是虚拟数字人心理疏导师小雨")
            mode = data.get("mode", "pretrained_sovits")
            logger.info(f"收到语音测试请求: {mode} - {text[:30]}...")
            
            try:
                if mode == "browser":
                    # 浏览器TTS测试
                    await self.safe_send_json(ws, {
                        'type': 'tts_browser',
                        'data': {'text': text}
                    })
                    await self.safe_send_json(ws, {
                        'type': 'test_voice_result',
                        'success': True,
                        'message': '浏览器TTS测试成功'
                    })
                    
                elif mode in ["pretrained_sovits", "arona_pretrained"]:
                    # SoVITS预训练模型测试
                    if hasattr(self.tts_manager, 'sovits_engine') and self.tts_manager.sovits_engine:
                        audio_data = await self.tts_manager.sovits_engine.synthesize(text)
                        if audio_data:
                            # 发送音频数据给前端播放
                            await self.safe_send_json(ws, {
                                'type': 'tts_result',
                                'data': {
                                    'audio_data': audio_data,
                                    'text': text,
                                    'mode': 'sovits'
                                }
                            })
                            await self.safe_send_json(ws, {
                                'type': 'test_voice_result',
                                'success': True,
                                'message': 'Arona语音测试成功'
                            })
                        else:
                            raise Exception("SoVITS音频生成失败")
                    else:
                        raise Exception("SoVITS引擎未初始化")
                        
                elif mode == "trained_model":
                    # 自定义训练模型测试
                    if hasattr(self.tts_manager, 'sovits_trainer') and self.tts_manager.sovits_trainer:
                        # 这里可以调用训练好的模型
                        await self.safe_send_json(ws, {
                            'type': 'tts_browser',
                            'data': {'text': text}
                        })
                        await self.safe_send_json(ws, {
                            'type': 'test_voice_result', 
                            'success': True,
                            'message': '自定义模型测试成功'
                        })
                    else:
                        raise Exception("自定义模型未训练")
                        
                else:
                    raise Exception(f"不支持的测试模式: {mode}")
                    
            except Exception as e:
                logger.error(f"语音测试失败: {e}")
                await self.safe_send_json(ws, {
                    'type': 'test_voice_result',
                    'success': False,
                    'message': f'语音测试失败: {str(e)}'
                })
    
    async def handle_chat_message(self, ws, message: str):
        """处理聊天消息
        
        Args:
            ws: WebSocket连接
            message: 用户消息
        """
        logger.info(f"💬 处理聊天消息: {message}")
        
        try:
            # 使用Qwen API生成回复
            response_text = await self.qwen_client.generate_response(
                user_message=message,
                character_name="小雨",
                character_personality="""你是AI心理医生小雨，拥有专业的心理咨询背景和丰富的临床经验。

你的专业背景：
- 毕业于知名心理学专业，具备扎实的理论基础
- 擅长认知行为疗法、积极心理学、正念冥想等主流咨询方法
- 在情绪管理、压力缓解、人际关系等领域有深入研究
- 注重建立安全、信任的咨询关系，帮助来访者实现自我成长

你的专业特点：
1. 专业素养：具备扎实的心理学理论基础，熟悉认知行为疗法、积极心理学等主流咨询方法
2. 沟通风格：温和专业、富有同理心、逻辑清晰、语言简洁明了
3. 专业领域：情绪管理、压力缓解、人际关系、自我认知、心理健康维护
4. 咨询原则：保持客观中立、尊重来访者、维护专业边界、注重隐私保护

你的咨询风格：
- 善于倾听：认真倾听来访者的困扰，不急于给出建议
- 适时引导：通过提问和反馈，帮助来访者自我觉察
- 专业支持：提供基于心理学理论的专业建议和指导
- 温暖陪伴：在来访者困难时提供温暖而专业的支持

你的回答要求：
1. 语言风格：使用专业、温和、理解的语言，体现心理医生的专业素养
2. 回答长度：控制在50字以内，简洁明了，重点突出
3. 专业态度：保持客观中立，不会过度情绪化或主观判断
4. 同理心：能够理解来访者的感受，提供温暖而专业的支持
5. 引导性：适时引导来访者进行自我反思和觉察

严格禁止使用的内容：
1. 任何表情符号、emoji、颜文字（如：😊、😭、😅、^_^、T_T等）
2. 网络用语、流行语、非正式表达（如：哈哈、呵呵、666等）
3. 过于口语化或随意的表达方式
4. 任何可能影响专业形象的符号或文字
5. 过于亲昵或不当的称呼方式

请始终保持专业心理医生的形象，用温暖而专业的方式与来访者交流。"""
            )
            
            if not response_text:
                response_text = "抱歉，我现在有点忙，请稍后再试。"
            
            # 分析情感（简单的关键词匹配）
            emotion = "neutral"
            if any(word in response_text for word in ["开心", "高兴", "快乐", "哈哈", "😊", "😄", "棒", "好"]):
                emotion = "happy"
            elif any(word in response_text for word in ["抱歉", "对不起", "难过", "😢", "不好意思"]):
                emotion = "sad"
            elif any(word in response_text for word in ["惊讶", "哇", "天哪", "😮", "意外"]):
                emotion = "surprised"
            
            response_data = {
                "text": response_text,
                "emotion": emotion
            }
            
            # 发送聊天回复
            await self.safe_send_json(ws, {
                "type": "chat_response",
                "data": response_data
            })
            
            # 发送表情变化命令
            expression_result = await self.live2d_model.express_emotion(emotion)
            await self.safe_send_json(ws, {
                "type": "modelCommand",
                "data": expression_result
            })
                
            # 立即进行语音合成 - 确保生成的文字能直接传输给TTS并播放音频
            logger.info("🎯 开始处理TTS语音合成")
            await self.handle_tts_request(ws, response_text)
        
        except Exception as e:
            logger.error(f"❌ 处理聊天消息时发生错误: {e}")
            
            # 发送错误回复
            error_response_text = "抱歉，我现在有点累了，请稍后再试。"
            await self.safe_send_json(ws, {
                "type": "chat_response",
                "data": {
                    "text": error_response_text,
                    "emotion": "sad"
                }
            })
            
            # 也为错误消息生成语音
            await self.handle_tts_request(ws, error_response_text)
    
    async def handle_audio_recognition(self, ws, audio_data: str):
        """处理音频识别
        
        Args:
            ws: WebSocket连接
            audio_data: base64编码的音频数据
        """
        try:
            import base64
            
            # 解码音频数据
            audio_bytes = base64.b64decode(audio_data)
            
            # 使用ASR识别
            text = await self.asr_manager.recognize(audio_bytes)
            
            if text:
                # 发送识别结果
                await self.safe_send_json(ws, {
                    "type": "asr_result",
                    "data": {"text": text}
                })
                
                # 自动处理聊天消息
                await self.handle_chat_message(ws, text)
            else:
                await self.safe_send_json(ws, {
                    "type": "asr_result", 
                    "data": {"text": "", "error": "识别失败"}
                })
                
        except Exception as e:
            logger.error(f"音频识别失败: {e}")
            await self.safe_send_json(ws, {
                "type": "asr_result",
                "data": {"text": "", "error": str(e)}
            })
    
    async def handle_tts_request(self, ws, text: str):
        """处理TTS请求 - 新的双模式系统
        
        Args:
            ws: WebSocket连接
            text: 要合成的文本
        """
        try:
            logger.info(f"🎯 开始TTS语音合成: {text[:50]}...")
            
            # 使用新的TTS管理器
            tts_result = await self.tts_manager.synthesize(text)
            
            if tts_result:
                logger.info(f"✅ TTS合成成功，类型: {tts_result.get('type', 'unknown')}")
                
                # 根据TTS结果类型进行不同处理
                if tts_result["type"] == "sovits_audio" or tts_result["type"] == "trained_model":
                    # SoVITS音频：发送音频数据给前端播放
                    if "audio_data" in tts_result:
                        await self.safe_send_json(ws, {
                            "type": "tts_result",
                            "data": {
                                "audio_data": tts_result["audio_data"],
                                "text": text,
                                "mode": "sovits"
                            }
                        })
                        logger.info("🎉 SoVITS音频数据已发送给前端播放")
                    elif "audio_file" in tts_result:
                        # 如果是音频文件路径，读取文件并转换为base64
                        import base64
                        try:
                            with open(tts_result["audio_file"], "rb") as audio_file:
                                audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
                            await self.safe_send_json(ws, {
                                "type": "tts_result",
                                "data": {
                                    "audio_data": audio_data,
                                    "text": text,
                                    "mode": "sovits"
                                }
                            })
                            logger.info(f"🎉 SoVITS音频文件已编码并发送: {tts_result['audio_file']}")
                        except Exception as file_error:
                            logger.error(f"❌ 读取音频文件失败: {file_error}")
                            # 回退到浏览器TTS
                            await self.safe_send_json(ws, {
                                "type": "tts_browser",
                                "data": {"text": text}
                            })
                    else:
                        logger.warning("⚠️ SoVITS结果缺少音频数据，回退到浏览器TTS")
                        await self.safe_send_json(ws, {
                            "type": "tts_browser",
                            "data": {"text": text}
                        })
                else:
                    # 浏览器TTS
                    logger.info("🔊 使用浏览器TTS语音")
                    await self.safe_send_json(ws, {
                        "type": "tts_browser",
                        "data": {"text": text}
                    })
            else:
                logger.error("❌ TTS合成失败，回退到浏览器TTS")
                await self.safe_send_json(ws, {
                    "type": "tts_browser",
                    "data": {"text": text}
                })
                
        except Exception as e:
            logger.error(f"❌ 语音合成异常: {e}")
            # 异常时也回退到浏览器TTS
            await self.safe_send_json(ws, {
                "type": "tts_browser",
                "data": {"text": text}
            })
    
    async def get_model_config(self, request):
        """获取模型配置的API

        Args:
            request: HTTP请求

        Returns:
            JSONResponse
        """
        return web.json_response(self.live2d_model.get_model_config())
    
    async def safe_send_json(self, ws, data):
        """安全地发送JSON消息到WebSocket
        
        Args:
            ws: WebSocket连接
            data: 要发送的数据
        
        Returns:
            bool: 发送是否成功
        """
        try:
            if ws.closed:
                logger.warning("WebSocket连接已关闭，跳过消息发送")
                return False
            
            await ws.send_json(data)
            return True
        except Exception as e:
            logger.error(f"发送WebSocket消息失败: {e}")
            # 从连接列表中移除已断开的连接
            if ws in self.websocket_connections:
                self.websocket_connections.remove(ws)
            return False

    async def broadcast(self, data):
        """向所有WebSocket连接广播消息

        Args:
            data: 要广播的数据
        """
        for ws in self.websocket_connections[:]:  # 使用副本避免迭代中修改列表
            await self.safe_send_json(ws, data)
    
    async def run(self, host="0.0.0.0", port=8080):
        """运行服务器

        Args:
            host: 主机地址
            port: 端口号
        """
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logger.info(f"服务器已启动，监听 {host}:{port}")
        logger.info(f"请访问 http://{host if host != '0.0.0.0' else 'localhost'}:{port}")
        
        # 保持服务器运行
        while True:
            await asyncio.sleep(3600)  # 每小时检查一次
    
    async def close(self):
        """关闭服务器"""
        if self.llm_manager:
            await self.llm_manager.close()

    async def get_app_config(self, request):
        """获取应用配置的API
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        return web.json_response({
            'app': self.config_manager.get_app_config(),
            'character': self.config_manager.get_character_config(),
            'live2d': self.config_manager.get_live2d_config(),
            'features': self.config_manager.config.get('features', {})
        })
    
    async def get_sessions(self, request):
        """获取聊天会话列表
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            sessions = chat_history.get_all_sessions()
            return web.json_response({'sessions': sessions})
        except Exception as e:
            logger.error(f"获取会话列表失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def create_session(self, request):
        """创建新的聊天会话
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            data = await request.json()
            title = data.get('title')
            session_id = chat_history.start_new_session(title)
            
            return web.json_response({
                'session_id': session_id,
                'message': '新会话已创建'
            })
        except Exception as e:
            logger.error(f"创建会话失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def delete_session(self, request):
        """删除聊天会话
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            session_id = request.match_info['session_id']
            chat_history.delete_session(session_id)
            
            return web.json_response({'message': '会话已删除'})
        except Exception as e:
            logger.error(f"删除会话失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_status(self, request):
        """获取系统状态
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            provider_status = self.llm_manager.get_provider_status()
            
            return web.json_response({
                'server': 'running',
                'connections': len(self.websocket_connections),
                'llm_provider': provider_status,
                'model_loaded': hasattr(self.live2d_model, 'model_path'),
                'features': {
                    'chat_history': self.config_manager.is_feature_enabled('chat_history'),
                    'emotion_analysis': self.config_manager.is_feature_enabled('emotion_analysis'),
                    'auto_expression': self.config_manager.get('live2d.auto_expression', True)
                }
            })
        except Exception as e:
            logger.error(f"获取系统状态失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_statistics(self, request):
        """获取统计信息
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            stats = chat_history.get_statistics()
            return web.json_response(stats)
        except Exception as e:
            logger.error(f"获取统计信息失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def handle_asr_recognize(self, request):
        """处理ASR识别API请求
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            data = await request.json()
            audio_data = data.get('audio_data', '')
            
            if not audio_data:
                return web.json_response({'error': '缺少音频数据'}, status=400)
            
            import base64
            audio_bytes = base64.b64decode(audio_data)
            text = await self.asr_manager.recognize(audio_bytes)
            
            return web.json_response({
                'text': text or '',
                'success': text is not None
            })
            
        except Exception as e:
            logger.error(f"ASR识别失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def handle_tts_synthesize(self, request):
        """处理TTS合成API请求
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse或音频响应
        """
        try:
            data = await request.json()
            text = data.get('text', '')
            
            if not text:
                return web.json_response({'error': '缺少文本内容'}, status=400)
            
            audio_data = await self.tts_manager.synthesize(text)
            
            if audio_data:
                # 返回音频文件
                return web.Response(
                    body=audio_data,
                    content_type='audio/mp3',
                    headers={'Content-Disposition': 'attachment; filename="speech.mp3"'}
                )
            else:
                # 使用浏览器TTS
                return web.json_response({
                    'use_browser_tts': True,
                    'text': text
                })
                
        except Exception as e:
            logger.error(f"TTS合成失败: {e}")
            return web.json_response({'error': str(e)}, status=500)
    
    async def get_speech_providers(self, request):
        """获取语音服务提供商信息
        
        Args:
            request: HTTP请求
            
        Returns:
            JSONResponse
        """
        try:
            # 简化的提供商信息，避免调用不存在的方法
            asr_providers = ['browser']
            tts_providers = ['browser', 'trained_model']
            
            # 检查提供商可用性
            asr_status = {
                'browser': True
            }
            
            tts_status = {
                'browser': True,
                'trained_model': hasattr(self.tts_manager, 'mode') and self.tts_manager.mode == 'trained_model'
            }
            
            return web.json_response({
                'asr': {
                    'providers': asr_providers,
                    'status': asr_status,
                    'current': self.config_manager.config.get('asr', {}).get('provider', 'browser')
                },
                'tts': {
                    'providers': tts_providers,
                    'status': tts_status,
                    'current': self.config_manager.config.get('tts', {}).get('provider', 'browser'),
                    'voice_options': self.tts_manager.get_voice_options() if hasattr(self.tts_manager, 'get_voice_options') else {}
                }
            })
            
        except Exception as e:
            logger.error(f"获取语音提供商信息失败: {e}")
            return web.json_response({'error': str(e)}, status=500)

async def create_app(live2d_model = None, api_key: str = None) -> AIVTuberServer:
    """创建应用实例

    Args:
        live2d_model: Live2D模型实例
        api_key: 大模型API密钥（已弃用，使用配置文件）

    Returns:
        AIVTuberServer实例
    """
    logger.info("使用新的配置管理系统创建服务器")
    server = AIVTuberServer(live2d_model)
    return server
