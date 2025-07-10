#!/usr/bin/env python3
"""
测试训练完成后的自动播放功能
"""

import asyncio
import json
import websockets
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_training_workflow():
    """测试训练工作流程"""
    uri = "ws://localhost:8001/ws"
    
    try:
        async with websockets.connect(uri) as websocket:
            logger.info("✅ WebSocket连接成功")
            
            # 1. 发送训练请求
            logger.info("🎤 发送语音训练请求...")
            await websocket.send(json.dumps({
                "type": "train_voice"
            }))
            
            # 2. 等待训练完成和自动播放
            logger.info("⏳ 等待训练完成和自动播放...")
            
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                    data = json.loads(message)
                    
                    logger.info(f"📨 收到消息: {data.get('type', 'unknown')}")
                    
                    if data.get('type') == 'voice_trained':
                        logger.info(f"✅ 训练完成: {data.get('message', '')}")
                        if data.get('success'):
                            logger.info("🎵 等待自动播放音频...")
                        else:
                            logger.error("❌ 训练失败")
                            break
                            
                    elif data.get('type') == 'tts_response':
                        logger.info(f"🎵 收到TTS响应，音频文件: {data.get('audio_file', 'N/A')}")
                        logger.info(f"📝 文本内容: {data.get('text', 'N/A')}")
                        if data.get('auto_play'):
                            logger.info("✅ 自动播放功能正常")
                        break
                        
                    elif data.get('type') == 'error':
                        logger.error(f"❌ 错误: {data.get('message', '')}")
                        break
                        
                except asyncio.TimeoutError:
                    logger.warning("⏰ 等待超时，可能训练还在进行中")
                    break
                    
    except Exception as e:
        logger.error(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    logger.info("🚀 开始测试训练完成后的自动播放功能")
    asyncio.run(test_training_workflow())
    logger.info("✅ 测试完成") 