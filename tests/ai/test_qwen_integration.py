#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import logging
import os
import sys

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from backend.ai.qwen_client import QwenClient

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def test_qwen_integration():
    """测试Qwen API集成"""
    print("🤖 Qwen API集成测试开始")
    print("=" * 50)
    
    try:
        # 创建Qwen客户端
        client = QwenClient()
        
        # 测试连接
        print("📡 测试API连接...")
        connection_ok = await client.test_connection()
        
        if connection_ok:
            print("✅ Qwen API连接正常")
        else:
            print("❌ Qwen API连接失败")
            return False
            
        # 测试角色对话
        print("\n💬 测试Arona角色对话...")
        test_messages = [
            "你好，Arona！",
            "你是谁？",
            "你能做什么？",
            "今天天气怎么样？",
            "给我讲个笑话吧"
        ]
        
        for i, message in enumerate(test_messages, 1):
            print(f"\n{i}. 用户: {message}")
            
            response = await client.generate_response(
                user_message=message,
                character_name="Arona",
                character_personality="你是来自蔚蓝档案的AI助理Arona，聪明、友善、可靠。"
            )
            
            if response:
                print(f"   Arona: {response}")
            else:
                print("   ❌ 生成回复失败")
                
        print("\n🎯 测试完成！")
        return True
        
    except Exception as e:
        logger.error(f"测试异常: {e}")
        print(f"❌ 测试异常: {e}")
        return False

async def test_complete_workflow():
    """测试完整的聊天-TTS工作流程"""
    print("\n🔄 完整工作流程测试")
    print("-" * 30)
    
    try:
        client = QwenClient()
        
        # 模拟用户发送聊天消息
        user_message = "你好，我是新来的学生，请多指教！"
        print(f"👤 用户输入: {user_message}")
        
        # 生成AI回复
        ai_response = await client.generate_response(
            user_message=user_message,
            character_name="Arona"
        )
        
        if ai_response:
            print(f"🤖 Arona回复: {ai_response}")
            print(f"📝 回复长度: {len(ai_response)}字符")
            
            # 模拟情感分析
            emotion = "neutral"
            if any(word in ai_response for word in ["欢迎", "开心", "高兴", "好"]):
                emotion = "happy"
            elif any(word in ai_response for word in ["抱歉", "对不起"]):
                emotion = "sad"
                
            print(f"😊 识别情感: {emotion}")
            
            # 模拟TTS处理
            print("🎵 模拟TTS处理...")
            print(f"   文本长度适合语音合成: {'是' if len(ai_response) <= 100 else '否'}")
            print("   准备发送到SoVITS引擎...")
            
            print("✅ 完整工作流程测试成功")
            return True
        else:
            print("❌ AI回复生成失败")
            return False
            
    except Exception as e:
        logger.error(f"工作流程测试异常: {e}")
        return False

async def main():
    """主测试函数"""
    print("🚀 Qwen集成与工作流程测试")
    print("=" * 60)
    
    # 检查API密钥
    print("🔑 检查配置...")
    client = QwenClient()
    if client.api_key:
        print(f"   API Key: {client.api_key[:20]}...")
        print(f"   Base URL: {client.base_url}")
        print(f"   Model: {client.model}")
    else:
        print("❌ API Key未配置")
        return
    
    # 执行测试
    success1 = await test_qwen_integration()
    success2 = await test_complete_workflow()
    
    print("\n" + "=" * 60)
    print("📊 测试总结:")
    print(f"   Qwen API测试: {'✅ 通过' if success1 else '❌ 失败'}")
    print(f"   工作流程测试: {'✅ 通过' if success2 else '❌ 失败'}")
    
    if success1 and success2:
        print("\n🎉 所有测试通过！系统准备就绪。")
        print("💡 提示: 现在可以启动服务器并测试完整的对话功能。")
    else:
        print("\n⚠️  部分测试失败，请检查配置和网络连接。")

if __name__ == "__main__":
    asyncio.run(main()) 
 
 