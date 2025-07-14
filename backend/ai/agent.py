"""AI代理模块"""

import logging
import asyncio
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class SimpleAgent:
    """简单的AI代理"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.character = config.get('character', {})
        self.llm_config = config.get('llm', {})
        self.prompts = config.get('prompts', {})
        
        self.character_name = self.character.get('name', '小雨')
        self.personality = self.character.get('personality', '可爱、活泼、友善的虚拟主播')
        
        # 简单的回复模板
        self.responses = [
            f"你好呀！我是{self.character_name}，很高兴和你聊天呢~",
            f"哇！听起来很有趣呢！作为{self.character_name}，我想了解更多~",
            f"嗯嗯，我明白了！{self.character_name}觉得你说得很对呢~",
            f"真的吗？{self.character_name}觉得这个话题超棒的！",
            f"哈哈，{self.character_name}也这么想！你真聪明呢~",
            f"好奇好奇！{self.character_name}想知道更多详情呢！",
            f"太棒了！和你聊天{self.character_name}感觉很开心呢~",
            f"哇塞！{self.character_name}学到了新知识，谢谢你！",
            f"嗯，{self.character_name}正在思考...这确实是个好问题呢！",
            f"咦？这个问题让{self.character_name}很感兴趣呢！"
        ]
        
        logger.info(f"AI代理初始化成功，角色: {self.character_name}")
    
    async def a_step(self, user_input: str) -> str:
        """处理用户输入并生成回复"""
        try:
            if not user_input or not user_input.strip():
                return f"咦？{self.character_name}没有听清楚，可以再说一遍吗？"
            
            user_input = user_input.strip()
            logger.info(f"处理用户输入: {user_input[:50]}...")
            
            # 简单的关键词响应
            response = self._generate_simple_response(user_input)
            
            logger.info(f"生成回复: {response[:50]}...")
            return response
            
        except Exception as e:
            logger.error(f"处理用户输入失败: {e}")
            return f"哎呀，{self.character_name}有点困惑了，能换个话题吗？"
    
    def _generate_simple_response(self, user_input: str) -> str:
        """生成简单回复"""
        user_lower = user_input.lower()
        
        # 问候类
        if any(word in user_lower for word in ['你好', 'hello', 'hi', '嗨']):
            return f"你好呀！我是{self.character_name}，很开心见到你呢~今天想聊什么呢？"
        
        # 询问名字
        if any(word in user_lower for word in ['你叫什么', '你是谁', '名字']):
            return f"我是{self.character_name}！{self.personality}！很高兴认识你呢~"
        
        # 询问功能
        if any(word in user_lower for word in ['能做什么', '功能', '会什么']):
            return f"{self.character_name}可以陪你聊天，用甜美的声音和你对话呢！还能训练专属的个性化语音哦~"
        
        # 夸奖类
        if any(word in user_lower for word in ['可爱', '漂亮', '好看', '棒', '厉害']):
            return f"哇～谢谢夸奖！{self.character_name}好开心呢！你也很棒哦~"
        
        # 再见类
        if any(word in user_lower for word in ['再见', 'bye', '拜拜', '下次见']):
            return f"拜拜～期待下次和你聊天呢！{self.character_name}会想你的~"
        
        # 语音相关
        if any(word in user_lower for word in ['语音', '声音', '训练', 'tts']):
            return f"哇！{self.character_name}的语音系统超棒的！你可以训练专属的个性化语音，让我的声音更像你想要的呢~"
        
        # 情感表达
        if any(word in user_lower for word in ['开心', '高兴', '快乐']):
            return f"哇！{self.character_name}也很开心呢！快乐的情绪会传染的~"
        
        if any(word in user_lower for word in ['难过', '伤心', '不开心']):
            return f"哎呀，别难过啦！{self.character_name}陪着你呢，有什么心事可以和我说~"
        
        # 默认回复
        import random
        return random.choice(self.responses)

def create_agent(config: Dict[str, Any] = None) -> SimpleAgent:
    """创建AI代理实例"""
    if config is None:
        # 使用默认配置
        config: Dict[str, Any] = {
            'character': {
                'name': '小雨',
                'personality': '可爱、活泼、友善的AI心理疏导师'
            },
            'llm': {},
            'prompts': {}
        }
    return SimpleAgent(config)

__all__ = ['SimpleAgent', 'create_agent']