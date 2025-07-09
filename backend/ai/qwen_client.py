#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Qwen API客户端 - 重构阶段3迁移

专门针对通义千问API的客户端实现
兼容OpenAI格式，提供异步和同步调用接口
"""

import logging
import asyncio
import aiohttp
import json
import requests
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class QwenClient:
    """Qwen API客户端，兼容OpenAI格式"""
    
    def __init__(self, api_key: str = "sk-1ff3a1c15f884e31b3a7492748e37a97", model: str = "qwen-turbo"):
        self.api_key = api_key
        self.base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
        self.model = model
        self.max_tokens = 200
        self.temperature = 0.8
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # 小雨心理医生的system prompt - 强化专业人设和禁用规则
        self.system_prompt = """你是AI心理医生小雨，拥有专业的心理咨询背景和丰富的临床经验。

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
        
    def build_messages(self, user_input: str, system_prompt: str = None) -> List[Dict[str, str]]:
        """构建消息列表"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        else:
            messages.append({"role": "system", "content": self.system_prompt})
        messages.append({"role": "user", "content": user_input})
        return messages
        
    async def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Optional[str]:
        """
        发送聊天请求到Qwen API
        
        Args:
            messages: 消息列表，格式：[{"role": "user", "content": "你好"}]
            **kwargs: 其他参数
            
        Returns:
            生成的回复文本
        """
        try:
            # 构建请求数据
            data = {
                "model": self.model,
                "messages": messages,
                "temperature": kwargs.get("temperature", self.temperature),
                "max_tokens": kwargs.get("max_tokens", self.max_tokens),
                "top_p": kwargs.get("top_p", 0.8)
            }
            
            logger.info(f"🤖 发送Qwen API请求: {len(messages)}条消息")
            logger.debug(f"请求数据: {json.dumps(data, ensure_ascii=False)}")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=data,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        
                        # 提取回复内容
                        if "choices" in result and len(result["choices"]) > 0:
                            content = result["choices"][0]["message"]["content"]
                            
                            # 记录Token使用情况
                            if "usage" in result:
                                usage = result["usage"]
                                logger.info(f"✅ Qwen API调用成功 - 输入:{usage.get('prompt_tokens', 0)} 输出:{usage.get('completion_tokens', 0)} Token")
                            
                            logger.info(f"🎯 Qwen回复: {content[:100]}...")
                            return content
                        else:
                            logger.error("❌ Qwen API返回格式异常，缺少choices")
                            return None
                            
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Qwen API请求失败: {response.status} - {error_text}")
                        return None
                        
        except asyncio.TimeoutError:
            logger.error("❌ Qwen API请求超时")
            return None
        except Exception as e:
            logger.error(f"❌ Qwen API调用异常: {e}")
            return None
    
    async def generate_response(self, user_message: str, character_name: str = "小雨", character_personality: str = None) -> Optional[str]:
        """
        生成角色回复
        
        Args:
            user_message: 用户消息
            character_name: 角色名称
            character_personality: 角色性格描述
            
        Returns:
            生成的回复
        """
        if not character_personality:
            character_personality = self.system_prompt
        
        messages = [
            {
                "role": "system", 
                "content": character_personality
            },
            {
                "role": "user", 
                "content": user_message
            }
        ]
        
        return await self.chat_completion(messages)
    
    async def test_connection(self) -> bool:
        """测试API连接"""
        try:
            response = await self.generate_response("你好")
            if response:
                logger.info("✅ Qwen API连接测试成功")
                return True
            else:
                logger.error("❌ Qwen API连接测试失败")
                return False
        except Exception as e:
            logger.error(f"❌ Qwen API连接测试异常: {e}")
            return False

    def chat(self, user_input, system_prompt=None):
        """同步聊天接口（保持向后兼容）"""
        messages = self.build_messages(user_input, system_prompt or self.system_prompt)
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }
        print("[调试] Qwen API请求体:", payload)
        response = requests.post(f"{self.base_url}/chat/completions", headers=self.headers, json=payload, timeout=45)
        
        if response.status_code == 200:
            result = response.json()
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"]
        
        logger.error(f"同步API调用失败: {response.status_code} - {response.text}")
        return None