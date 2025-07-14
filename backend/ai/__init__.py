"""
AI智能系统模块 - 重构阶段3

包含：
- llm_manager: LLM管理器和多提供商支持
- qwen_client: Qwen API客户端
- chat_history: 聊天历史管理
- llm_api: 通用LLM API接口
- agent: AI代理模块
- conversations: 对话管理（将在后续阶段完善）
"""

# 导出主要AI模块
from .llm_manager import LLMManager, llm_manager
from .qwen_client import QwenClient  
from .chat_history import ChatHistoryManager, chat_history
from .llm_api import QwenAPI
from .agent import SimpleAgent, create_agent

__all__ = [
    'LLMManager',
    'llm_manager',
    'QwenClient',
    'ChatHistoryManager', 
    'chat_history',
    'QwenAPI',
    'SimpleAgent',
    'create_agent'
]