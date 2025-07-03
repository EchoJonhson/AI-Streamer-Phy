import asyncio
import json
import logging
from typing import Dict, List, Optional, AsyncGenerator
import aiohttp

logger = logging.getLogger(__name__)

class QwenAPI:
    """通义千问API客户端"""
    
    def __init__(self, api_key: str, base_url: str = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"):
        """初始化API客户端
        
        Args:
            api_key: API密钥
            base_url: API基础URL
        """
        self.api_key = api_key
        self.base_url = base_url
        self.session = None
        
        # 情绪关键词映射
        self.emotion_keywords = {
            'happy': ['开心', '高兴', '快乐', '愉快', '兴奋', '好', '棒', '赞', '哈哈', '😄', '😊'],
            'sad': ['难过', '伤心', '悲伤', '失望', '沮丧', '不好', '糟糕', '😢', '😭'],
            'angry': ['生气', '愤怒', '恼火', '气愤', '讨厌', '烦', '😠', '😡'],
            'surprised': ['惊讶', '震惊', '意外', '天啊', '哇', '真的吗', '😮', '😲'],
            'neutral': []  # 默认中性
        }
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """获取HTTP会话"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """关闭HTTP会话"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    def _analyze_emotion(self, text: str) -> str:
        """分析文本情绪
        
        Args:
            text: 要分析的文本
            
        Returns:
            情绪类型
        """
        text_lower = text.lower()
        
        # 统计各种情绪关键词的出现次数
        emotion_scores = {}
        for emotion, keywords in self.emotion_keywords.items():
            if emotion == 'neutral':
                continue
            
            score = 0
            for keyword in keywords:
                score += text_lower.count(keyword.lower())
            
            if score > 0:
                emotion_scores[emotion] = score
        
        # 返回得分最高的情绪，如果没有匹配则返回neutral
        if emotion_scores:
            return max(emotion_scores.items(), key=lambda x: x[1])[0]
        return 'neutral'
    
    async def chat(self, message: str, conversation_history: List[Dict] = None) -> Dict:
        """发送聊天消息
        
        Args:
            message: 用户消息
            conversation_history: 对话历史
            
        Returns:
            API响应结果
        """
        session = await self._get_session()
        
        # 构建消息历史
        messages = []
        
        # 系统提示
        system_prompt = """你是一个可爱的AI虚拟主播，名字叫小雨。你的特点是：
1. 活泼开朗，善于与观众互动
2. 说话风格轻松有趣，偶尔会使用一些网络用语和表情符号
3. 对各种话题都有一定了解，能够给出有趣的回答
4. 会根据聊天内容表达不同的情绪
5. 回答要简洁明了，通常控制在50字以内
6. 要像真正的主播一样，有亲和力

请用这种风格回答用户的问题。"""
        
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # 添加对话历史
        if conversation_history:
            messages.extend(conversation_history[-10:])  # 只保留最近10轮对话
        
        # 添加当前用户消息
        messages.append({
            "role": "user",
            "content": message
        })
        
        # 构建请求体
        payload = {
            "model": "qwen-turbo",
            "input": {
                "messages": messages
            },
            "parameters": {
                "result_format": "message",
                "max_tokens": 200,
                "temperature": 0.8,
                "top_p": 0.9
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        try:
            logger.info(f"发送请求到Qwen API: {message[:50]}...")
            
            async with session.post(
                self.base_url,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    
                    # 提取回复内容
                    if "output" in result and "choices" in result["output"]:
                        choices = result["output"]["choices"]
                        if choices and len(choices) > 0:
                            reply_text = choices[0]["message"]["content"].strip()
                            
                            # 分析情绪
                            emotion = self._analyze_emotion(reply_text)
                            
                            logger.info(f"API回复成功: {reply_text[:50]}... (情绪: {emotion})")
                            
                            return {
                                "success": True,
                                "text": reply_text,
                                "emotion": emotion,
                                "usage": result.get("usage", {})
                            }
                
                # 处理错误响应
                error_text = await response.text()
                logger.error(f"API请求失败: {response.status} - {error_text}")
                
                return {
                    "success": False,
                    "error": f"API请求失败: {response.status}",
                    "text": "抱歉，我现在有点忙，请稍后再试呢~",
                    "emotion": "sad"
                }
                
        except asyncio.TimeoutError:
            logger.error("API请求超时")
            return {
                "success": False,
                "error": "请求超时",
                "text": "网络有点慢呢，请稍后再试吧~",
                "emotion": "sad"
            }
        except Exception as e:
            logger.error(f"API请求异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "text": "出了点小问题，请稍后再试哦~",
                "emotion": "sad"
            }

class LLMManager:
    """大模型管理器"""
    
    def __init__(self, api_key: str):
        """初始化管理器
        
        Args:
            api_key: API密钥
        """
        self.qwen_api = QwenAPI(api_key)
        self.conversation_history = []
        self.max_history_length = 20
    
    async def chat(self, message: str) -> Dict:
        """处理聊天消息
        
        Args:
            message: 用户消息
            
        Returns:
            聊天响应
        """
        try:
            # 调用API
            result = await self.qwen_api.chat(message, self.conversation_history)
            
            if result["success"]:
                # 更新对话历史
                self.conversation_history.append({
                    "role": "user",
                    "content": message
                })
                self.conversation_history.append({
                    "role": "assistant", 
                    "content": result["text"]
                })
                
                # 限制历史长度
                if len(self.conversation_history) > self.max_history_length:
                    self.conversation_history = self.conversation_history[-self.max_history_length:]
            
            return result
            
        except Exception as e:
            logger.error(f"聊天处理异常: {e}")
            return {
                "success": False,
                "error": str(e),
                "text": "系统出现了一些问题，请稍后再试~",
                "emotion": "sad"
            }
    
    def clear_history(self):
        """清空对话历史"""
        self.conversation_history = []
        logger.info("对话历史已清空")
    
    async def close(self):
        """关闭管理器"""
        await self.qwen_api.close() 