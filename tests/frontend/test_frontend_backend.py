#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import json
import aiohttp
import websockets
import logging
from urllib.parse import urljoin

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FrontendBackendTester:
    """前端后端集成测试器"""
    
    def __init__(self, server_url="http://localhost:8000"):
        self.server_url = server_url
        self.ws_url = server_url.replace("http://", "ws://").replace("https://", "wss://") + "/ws"
        
    async def test_http_endpoints(self):
        """测试HTTP端点"""
        print("🌐 测试HTTP端点...")
        
        endpoints = [
            "/",
            "/api/config",
            "/api/status",
            "/api/model/config"
        ]
        
        async with aiohttp.ClientSession() as session:
            for endpoint in endpoints:
                try:
                    url = urljoin(self.server_url, endpoint)
                    async with session.get(url) as response:
                        if response.status == 200:
                            print(f"✅ {endpoint} - 状态码: {response.status}")
                        else:
                            print(f"⚠️  {endpoint} - 状态码: {response.status}")
                except Exception as e:
                    print(f"❌ {endpoint} - 错误: {e}")
    
    async def test_websocket_connection(self):
        """测试WebSocket连接"""
        print("\n🔌 测试WebSocket连接...")
        
        try:
            async with websockets.connect(self.ws_url) as websocket:
                print("✅ WebSocket连接成功")
                
                # 测试心跳
                await websocket.send(json.dumps({"type": "ping"}))
                
                # 等待响应
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    print(f"📡 收到响应: {response[:100]}...")
                except asyncio.TimeoutError:
                    print("⚠️  WebSocket响应超时")
                
                return True
        except Exception as e:
            print(f"❌ WebSocket连接失败: {e}")
            return False
    
    async def test_chat_flow(self):
        """测试聊天流程"""
        print("\n💬 测试聊天流程...")
        
        try:
            async with websockets.connect(self.ws_url) as websocket:
                print("✅ WebSocket连接已建立")
                
                # 发送聊天消息
                test_message = "你好，我是测试用户！"
                chat_request = {
                    "type": "chat",
                    "message": test_message
                }
                
                print(f"📤 发送消息: {test_message}")
                await websocket.send(json.dumps(chat_request))
                
                # 等待AI回复
                print("⏳ 等待AI回复...")
                
                timeout = 15  # 15秒超时
                responses = []
                
                for _ in range(10):  # 最多接收10条消息
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=timeout)
                        data = json.loads(response)
                        responses.append(data)
                        
                        if data.get("type") == "chat_response":
                            ai_text = data.get("data", {}).get("text", "")
                            emotion = data.get("data", {}).get("emotion", "neutral")
                            print(f"🤖 AI回复: {ai_text}")
                            print(f"😊 识别情感: {emotion}")
                            
                        elif data.get("type") == "tts_browser":
                            tts_text = data.get("data", {}).get("text", "")
                            print(f"🔊 浏览器TTS: {tts_text[:50]}...")
                            
                        elif data.get("type") == "tts_result":
                            audio_data = data.get("data", {}).get("audio_data", "")
                            print(f"🎵 SoVITS音频: {len(audio_data)}字节")
                            
                        elif data.get("type") == "modelCommand":
                            command = data.get("data", {})
                            print(f"🎭 模型命令: {command.get('type', 'unknown')}")
                            
                        else:
                            print(f"📨 其他消息: {data.get('type', 'unknown')}")
                            
                    except asyncio.TimeoutError:
                        print(f"⏰ 等待超时({timeout}秒)")
                        break
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON解析错误: {e}")
                        break
                        
                print(f"📊 总计收到 {len(responses)} 条响应")
                
                # 检查是否收到了关键响应
                has_chat_response = any(r.get("type") == "chat_response" for r in responses)
                has_tts_response = any(r.get("type") in ["tts_browser", "tts_result"] for r in responses)
                
                if has_chat_response:
                    print("✅ 聊天响应正常")
                else:
                    print("❌ 未收到聊天响应")
                    
                if has_tts_response:
                    print("✅ TTS响应正常")
                else:
                    print("❌ 未收到TTS响应")
                
                return has_chat_response and has_tts_response
                
        except Exception as e:
            print(f"❌ 聊天流程测试失败: {e}")
            return False
    
    async def test_voice_modes(self):
        """测试语音模式"""
        print("\n🎵 测试语音模式...")
        
        try:
            async with websockets.connect(self.ws_url) as websocket:
                # 测试Arona预训练模式
                print("🎯 测试Arona预训练模式...")
                test_request = {
                    "type": "test_voice",
                    "mode": "arona_pretrained",
                    "text": "你好，我是来自蔚蓝档案的Arona！"
                }
                
                await websocket.send(json.dumps(test_request))
                
                # 等待测试结果
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    data = json.loads(response)
                    
                    if data.get("type") == "test_voice_result":
                        success = data.get("success", False)
                        message = data.get("message", "")
                        print(f"{'✅' if success else '❌'} Arona模式测试: {message}")
                    else:
                        print(f"📨 收到其他响应: {data.get('type')}")
                        
                except asyncio.TimeoutError:
                    print("⏰ 语音测试超时")
                    
                return True
                
        except Exception as e:
            print(f"❌ 语音模式测试失败: {e}")
            return False
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 前端后端集成测试开始")
        print("=" * 60)
        
        print(f"🔗 测试服务器: {self.server_url}")
        print(f"🔗 WebSocket地址: {self.ws_url}")
        
        # 执行所有测试
        test1 = await self.test_http_endpoints()
        test2 = await self.test_websocket_connection()
        test3 = await self.test_chat_flow()
        test4 = await self.test_voice_modes()
        
        print("\n" + "=" * 60)
        print("📊 测试总结:")
        print(f"   HTTP端点: ✅ 完成")
        print(f"   WebSocket连接: {'✅ 通过' if test2 else '❌ 失败'}")
        print(f"   聊天流程: {'✅ 通过' if test3 else '❌ 失败'}")
        print(f"   语音模式: {'✅ 通过' if test4 else '❌ 失败'}")
        
        if test2 and test3 and test4:
            print("\n🎉 所有核心功能测试通过！")
            print("💡 建议: 打开浏览器访问 http://localhost:8000 进行手动测试")
        else:
            print("\n⚠️  部分测试失败，请检查服务器日志")

async def main():
    """主函数"""
    tester = FrontendBackendTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main()) 
 
 