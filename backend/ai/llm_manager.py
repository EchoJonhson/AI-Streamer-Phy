"""
LLM管理器模块 - 重构阶段3迁移

负责管理和协调不同的LLM提供商（Qwen、OpenAI、Ollama等）
支持多种AI模型的统一接口和切换功能
"""

import re
import json
import requests
import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Generator

# 暂时使用相对导入，等待后续重构阶段处理
from ..core.config import ConfigManager
from .chat_history import chat_history

logger = logging.getLogger(__name__)

class BaseLLMProvider(ABC):
    """LLM提供商基类"""
    
    def __init__(self, config: Dict[str, Any]):
        """初始化LLM提供商
        
        Args:
            config: 配置字典
        """
        self.config = config
    
    @abstractmethod
    def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """生成回复
        
        Args:
            messages: 对话历史
            **kwargs: 额外参数
            
        Returns:
            包含text和emotion的字典
        """
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """检查服务是否可用"""
        pass

class QwenProvider(BaseLLMProvider):
    """通义千问LLM提供商 - 按照阿里云API文档标准实现"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('api_key')
        self.model = config.get('model', 'qwen-plus')
        self.base_url = config.get('base_url', 'https://dashscope.aliyuncs.com/compatible-mode/v1')
        self.max_tokens = config.get('max_tokens', 2000)
        self.temperature = config.get('temperature', 0.7)
        self.timeout = config.get('timeout', 45)
        
        # 验证配置
        if not self.api_key:
            logger.error("千问API密钥未配置")
        if not self.api_key.startswith('sk-'):
            logger.warning("千问API密钥格式可能不正确，应以'sk-'开头")
        
        logger.info(f"初始化千问提供商:")
        logger.info(f"  - 模型: {self.model}")
        logger.info(f"  - API端点: {self.base_url}")
        logger.info(f"  - 超时时间: {self.timeout}秒")
        logger.info(f"  - API密钥: {self.api_key[:10]}...{self.api_key[-4:] if len(self.api_key) > 14 else '***'}")
    
    def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """生成回复 - 按照阿里云API文档格式"""
        try:
            # 准备请求头 - 严格按照文档要求
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # 准备请求数据 - 按照文档格式
            data = {
                'model': self.model,
                'messages': messages,
                'max_tokens': kwargs.get('max_tokens', self.max_tokens),
                'temperature': kwargs.get('temperature', self.temperature),
                'stream': False,  # 明确设置为非流式
                'top_p': kwargs.get('top_p', 0.9),     # 添加推荐参数
                'frequency_penalty': 0.1,  # 减少重复
                'presence_penalty': 0.1,   # 鼓励新话题
            }
            
            # 构建完整URL
            url = f"{self.base_url}/chat/completions"
            
            logger.info(f"发送千问API请求:")
            logger.info(f"  - URL: {url}")
            logger.info(f"  - 模型: {data['model']}")
            logger.info(f"  - 消息数量: {len(messages)}")
            logger.info(f"  - 最大tokens: {data['max_tokens']}")
            
            # 发送请求 - 增加重试机制
            max_retries = 2
            for attempt in range(max_retries + 1):
                try:
                    response = requests.post(
                        url,
                        headers=headers,
                        json=data,
                        timeout=self.timeout
                    )
                    
                    # 详细日志记录
                    logger.info(f"千问API响应 (尝试 {attempt + 1}):")
                    logger.info(f"  - 状态码: {response.status_code}")
                    logger.info(f"  - 响应头: {dict(response.headers)}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        # 记录完整响应结构
                        logger.info(f"  - 响应结构: {list(result.keys())}")
                        if 'usage' in result:
                            logger.info(f"  - Token使用: {result['usage']}")
                        if 'request_id' in result:
                            logger.info(f"  - 请求ID: {result['request_id']}")
                        
                        # 提取响应内容
                        if 'choices' in result and len(result['choices']) > 0:
                            choice = result['choices'][0]
                            if 'message' in choice:
                                text = choice['message'].get('content', '').strip()
                                finish_reason = choice.get('finish_reason', 'unknown')
                                
                                logger.info(f"  - 生成文本长度: {len(text)}")
                                logger.info(f"  - 完成原因: {finish_reason}")
                                
                                if text:
                                    emotion = self._analyze_emotion(text)
                                    logger.info(f"  - 识别情感: {emotion}")
                                    
                                    return {
                                        'text': text,
                                        'emotion': emotion,
                                        'success': True,
                                        'request_id': result.get('request_id'),
                                        'usage': result.get('usage'),
                                        'finish_reason': finish_reason
                                    }
                                else:
                                    logger.error("API返回空内容")
                            else:
                                logger.error(f"响应choice结构异常: {choice}")
                        else:
                            logger.error(f"响应缺少choices字段: {result}")
                    
                    elif response.status_code == 401:
                        logger.error("API密钥无效或已过期")
                        logger.error(f"响应内容: {response.text}")
                        break  # 不重试认证错误
                    
                    elif response.status_code == 429:
                        wait_time = 2 ** attempt
                        logger.warning(f"API速率限制，等待{wait_time}秒后重试...")
                        if attempt < max_retries:
                            time.sleep(wait_time)
                            continue
                    
                    elif response.status_code >= 500:
                        logger.error(f"API服务器错误 {response.status_code}: {response.text}")
                        if attempt < max_retries:
                            time.sleep(1)
                            continue
                    
                    else:
                        logger.error(f"API请求失败 {response.status_code}: {response.text}")
                        if attempt < max_retries:
                            time.sleep(1)
                            continue
                    
                    break  # 退出重试循环
                    
                except requests.exceptions.Timeout:
                    logger.error(f"API请求超时 (尝试 {attempt + 1}, 超时时间: {self.timeout}秒)")
                    if attempt < max_retries:
                        time.sleep(2)
                        continue
                except requests.exceptions.ConnectionError as e:
                    logger.error(f"API连接错误 (尝试 {attempt + 1}): {e}")
                    if attempt < max_retries:
                        time.sleep(2)
                        continue
                except requests.exceptions.RequestException as e:
                    logger.error(f"API请求异常 (尝试 {attempt + 1}): {e}")
                    if attempt < max_retries:
                        time.sleep(1)
                        continue
            
            # 所有重试都失败
            logger.error("千问API调用完全失败，返回默认回复")
            return {'text': '抱歉，我暂时无法回答您的问题', 'emotion': 'neutral', 'success': False}
            
        except Exception as e:
            logger.error(f"千问API调用异常: {e}", exc_info=True)
            return {'text': '服务暂时不可用，请稍后再试', 'emotion': 'neutral', 'success': False}
    
    def is_available(self) -> bool:
        """检查服务是否可用 - 按照文档要求测试连接"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # 发送简单的测试请求
            test_data = {
                'model': self.model,
                'messages': [{'role': 'user', 'content': 'hi'}],
                'max_tokens': 10,
                'stream': False
            }
            
            url = f"{self.base_url}/chat/completions"
            
            logger.info(f"开始千问API可用性检查:")
            logger.info(f"  - URL: {url}")
            logger.info(f"  - 模型: {test_data['model']}")
            
            # 增加重试机制
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = requests.post(
                        url,
                        headers=headers,
                        json=test_data,
                        timeout=30  # 可用性检查用较短超时
                    )
                    
                    logger.info(f"可用性检查响应 (尝试 {attempt + 1}/{max_retries}):")
                    logger.info(f"  - 状态码: {response.status_code}")
                    
                    if response.status_code == 200:
                        result = response.json()
                        logger.info(f"  - 请求ID: {result.get('request_id', 'N/A')}")
                        logger.info("✅ 千问API服务可用")
                        return True
                    elif response.status_code == 401:
                        logger.error(f"  - API密钥无效: {response.text}")
                        return False  # 不重试认证错误
                    elif response.status_code == 429:  # 速率限制
                        wait_time = 2 ** attempt
                        logger.warning(f"  - API速率限制，等待{wait_time}秒后重试...")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.warning(f"  - API返回错误状态码: {response.status_code}")
                        logger.warning(f"  - 错误内容: {response.text}")
                        if attempt < max_retries - 1:
                            time.sleep(1)
                            continue
                        return False
                        
                except requests.exceptions.Timeout:
                    logger.warning(f"  - API请求超时 (尝试 {attempt + 1}/{max_retries})")
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                    return False
                except requests.exceptions.ConnectionError as e:
                    logger.warning(f"  - API连接错误 (尝试 {attempt + 1}/{max_retries}): {e}")
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                    return False
                except Exception as e:
                    logger.warning(f"  - 检查过程异常 (尝试 {attempt + 1}/{max_retries}): {e}")
                    if attempt < max_retries - 1:
                        time.sleep(1)
                        continue
                    return False
            
            logger.error("❌ 千问API服务不可用 (所有重试已用尽)")
            return False
            
        except Exception as e:
            logger.error(f"千问API可用性检查失败: {e}", exc_info=True)
            return False
    
    def _analyze_emotion(self, text: str) -> str:
        """分析文本情感"""
        # 情感关键词映射
        emotion_keywords = {
            'happy': ['开心', '高兴', '快乐', '哈哈', '笑', '😊', '😄', '好棒', '太好了', '棒极了'],
            'sad': ['难过', '伤心', '哭', '😢', '😭', '失望', '沮丧', '可惜'],
            'angry': ['生气', '愤怒', '气愤', '😠', '😡', '讨厌', '烦躁'],
            'surprised': ['惊讶', '震惊', '意外', '😲', '😱', '天哪', '不敢相信', '哇'],
            'neutral': []
        }
        
        text_lower = text.lower()
        
        # 计算各种情感的得分
        emotion_scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = 0
            for keyword in keywords:
                score += text_lower.count(keyword.lower())
            emotion_scores[emotion] = score
        
        # 返回得分最高的情感，如果都为0则返回neutral
        if max(emotion_scores.values()) == 0:
            return 'neutral'
        
        return max(emotion_scores, key=emotion_scores.get)

class OpenAIProvider(BaseLLMProvider):
    """OpenAI LLM提供商"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('api_key')
        self.model = config.get('model', 'gpt-3.5-turbo')
        self.base_url = config.get('base_url', 'https://api.openai.com/v1/chat/completions')
        self.max_tokens = config.get('max_tokens', 200)
        self.temperature = config.get('temperature', 0.8)
    
    def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """生成回复"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': self.model,
                'messages': messages,
                'max_tokens': self.max_tokens,
                'temperature': self.temperature
            }
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                text = result['choices'][0]['message']['content']
                emotion = self._analyze_emotion(text)
                
                return {
                    'text': text,
                    'emotion': emotion,
                    'success': True
                }
            
            logger.error(f"OpenAI API错误: {response.status_code} - {response.text}")
            return {'text': '抱歉，我暂时无法回答', 'emotion': 'neutral', 'success': False}
            
        except Exception as e:
            logger.error(f"OpenAI API调用失败: {e}")
            return {'text': '服务暂时不可用', 'emotion': 'neutral', 'success': False}
    
    def is_available(self) -> bool:
        """检查服务是否可用"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            # 发送模型列表请求测试连接
            test_url = self.base_url.replace('/chat/completions', '/models')
            response = requests.get(test_url, headers=headers, timeout=10)
            
            return response.status_code == 200
            
        except Exception:
            return False
    
    def _analyze_emotion(self, text: str) -> str:
        """分析文本情感"""
        # 使用与Qwen相同的情感分析逻辑
        emotion_keywords = {
            'happy': ['happy', 'joy', 'excited', '开心', '高兴', '快乐', '哈哈', '笑'],
            'sad': ['sad', 'sorry', 'disappointed', '难过', '伤心', '哭', '失望'],
            'angry': ['angry', 'mad', 'frustrated', '生气', '愤怒', '气愤'],
            'surprised': ['surprised', 'amazing', 'wow', '惊讶', '震惊', '意外', '哇'],
            'neutral': []
        }
        
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in emotion_keywords.items():
            score = sum(text_lower.count(keyword.lower()) for keyword in keywords)
            emotion_scores[emotion] = score
        
        if max(emotion_scores.values()) == 0:
            return 'neutral'
        
        return max(emotion_scores, key=emotion_scores.get)

class OllamaProvider(BaseLLMProvider):
    """Ollama本地LLM提供商"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.model = config.get('model', 'llama2')
        self.base_url = config.get('base_url', 'http://localhost:11434')
        self.temperature = config.get('temperature', 0.8)
    
    def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """生成回复"""
        try:
            # 将消息转换为Ollama格式
            prompt = self._messages_to_prompt(messages)
            
            url = f"{self.base_url}/api/generate"
            data = {
                'model': self.model,
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': self.temperature
                }
            }
            
            response = requests.post(url, json=data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                text = result.get('response', '').strip()
                emotion = self._analyze_emotion(text)
                
                return {
                    'text': text,
                    'emotion': emotion,
                    'success': True
                }
            
            logger.error(f"Ollama API错误: {response.status_code} - {response.text}")
            return {'text': '本地模型暂时不可用', 'emotion': 'neutral', 'success': False}
            
        except Exception as e:
            logger.error(f"Ollama调用失败: {e}")
            return {'text': '本地服务连接失败', 'emotion': 'neutral', 'success': False}
    
    def is_available(self) -> bool:
        """检查服务是否可用"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def _messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """将消息列表转换为prompt"""
        prompt_parts = []
        
        for msg in messages:
            role = msg['role']
            content = msg['content']
            
            if role == 'system':
                prompt_parts.append(f"System: {content}")
            elif role == 'user':
                prompt_parts.append(f"Human: {content}")
            elif role == 'assistant':
                prompt_parts.append(f"Assistant: {content}")
        
        prompt_parts.append("Assistant:")
        return "\n\n".join(prompt_parts)
    
    def _analyze_emotion(self, text: str) -> str:
        """分析文本情感"""
        # 简单的情感分析
        if any(word in text.lower() for word in ['happy', 'great', 'good', '好', '棒']):
            return 'happy'
        elif any(word in text.lower() for word in ['sad', 'sorry', '难过', '抱歉']):
            return 'sad'
        elif any(word in text.lower() for word in ['angry', 'mad', '生气']):
            return 'angry'
        elif any(word in text.lower() for word in ['wow', 'amazing', '惊']):
            return 'surprised'
        else:
            return 'neutral'

class LLMManager:
    """LLM管理器"""
    
    def __init__(self):
        """初始化LLM管理器"""
        self.config_manager = ConfigManager()
        self.providers = {}
        self.current_provider = None
        self._init_providers()
    
    def _init_providers(self):
        """初始化所有提供商"""
        llm_config = self.config_manager.config.get('llm', {})
        provider_name = llm_config.get('provider', 'qwen')
        
        # 注册所有可用的提供商
        provider_classes = {
            'qwen': QwenProvider,
            'openai': OpenAIProvider,
            'ollama': OllamaProvider
        }
        
        # 创建当前配置的提供商
        if provider_name in provider_classes:
            try:
                # 传递整个llm配置，因为配置是直接在llm下的
                provider_config = llm_config
                logger.info(f"初始化{provider_name}提供商，配置: {provider_config}")
                
                self.providers[provider_name] = provider_classes[provider_name](provider_config)
                self.current_provider = self.providers[provider_name]
                logger.info(f"LLM提供商初始化成功: {provider_name}")
            except Exception as e:
                logger.error(f"初始化LLM提供商失败: {e}", exc_info=True)
        else:
            logger.error(f"不支持的LLM提供商: {provider_name}")
    
    def generate_chat_response(self, user_message: str) -> Dict[str, Any]:
        """生成聊天回复"""
        try:
            logger.info(f"处理用户消息: {user_message}")
            
            # 获取聊天历史
            history = chat_history.get_recent_messages(limit=3)  # 减少历史消息数量提升速度
            
            # 构建消息列表，添加系统prompt
            messages = []
            
            # 添加系统角色设定 - 简短有效的prompt
            system_prompt = (
                "你是可爱的AI虚拟主播小雨，性格活泼开朗。"
                "请用简洁友好的语气回复，控制在50字以内。"
                "表达要自然生动，适合语音播报。"
            )
            messages.append({"role": "system", "content": system_prompt})
            
            # 添加历史对话（最近3轮）
            for msg in history[-6:]:  # 最多3轮对话（用户+助手各3条）
                messages.append({
                    "role": "user" if msg['role'] == 'user' else "assistant",
                    "content": msg['content']
                })
            
            # 添加当前用户消息
            messages.append({"role": "user", "content": user_message})
            
            logger.info(f"发送给LLM的消息: {messages}")
            
            # 检查提供商可用性（使用缓存避免重复检查）
            if not hasattr(self, '_last_availability_check') or \
               time.time() - self._last_availability_check > 60:  # 1分钟缓存
                self._provider_available = self.current_provider.is_available()
                self._last_availability_check = time.time()
            
            if not self._provider_available:
                logger.warning("LLM提供商不可用，使用默认回复")
                return self._get_fallback_response()
            
            # 调用LLM生成回复 - 使用优化参数
            response = self.current_provider.generate_response(
                messages,
                max_tokens=150,  # 减少最大token数量提升速度
                temperature=0.8,  # 稍微提高创造性
                top_p=0.9,
                stream=False
            )
            
            if response.get('success', False):
                # 保存到聊天历史
                chat_history.add_message('user', user_message)
                chat_history.add_message('assistant', response['text'])
                
                logger.info(f"LLM响应: {response}")
                return response
            else:
                logger.error("LLM生成失败，使用默认回复")
                return self._get_fallback_response()
                
        except Exception as e:
            logger.error(f"生成聊天回复失败: {e}", exc_info=True)
            return self._get_fallback_response()
    
    def _get_fallback_response(self) -> Dict[str, Any]:
        """获取默认回复"""
        fallback_responses = [
            "嗯嗯，我明白了！还有什么想聊的吗？",
            "哈哈，有趣的问题呢～",
            "让我想想...你还想了解什么呢？",
            "好的好的，我在认真听你说话哦！",
            "哇，这个话题很棒呢！"
        ]
        
        import random
        response_text = random.choice(fallback_responses)
        
        return {
            'text': response_text,
            'emotion': 'happy',
            'success': True,
            'fallback': True
        }
    
    def get_provider_status(self) -> Dict[str, Any]:
        """获取提供商状态
        
        Returns:
            状态信息
        """
        status = {
            'current_provider': self.config_manager.config.get('llm', {}).get('provider'),
            'available': False,
            'error': None
        }
        
        if self.current_provider:
            try:
                status['available'] = self.current_provider.is_available()
            except Exception as e:
                status['error'] = str(e)
        
        return status
    
    def switch_provider(self, provider_name: str) -> bool:
        """切换提供商
        
        Args:
            provider_name: 提供商名称
            
        Returns:
            是否切换成功
        """
        if provider_name in self.providers:
            self.current_provider = self.providers[provider_name]
            # 更新配置
            llm_config = self.config_manager.config.get('llm', {})
            llm_config['provider'] = provider_name
            self.config_manager.config['llm'] = llm_config
            logger.info(f"LLM提供商已切换为: {provider_name}")
            return True
        else:
            logger.error(f"未找到LLM提供商: {provider_name}")
            return False

# 全局LLM管理器实例
llm_manager = LLMManager()