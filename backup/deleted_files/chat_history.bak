import os
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class ChatMessage:
    """聊天消息类"""
    
    def __init__(self, role: str, content: str, timestamp: datetime = None, 
                 emotion: str = None, session_id: str = None):
        """初始化聊天消息
        
        Args:
            role: 角色 ('user' 或 'assistant')
            content: 消息内容
            timestamp: 时间戳
            emotion: 情感标签
            session_id: 会话ID
        """
        self.role = role
        self.content = content
        self.timestamp = timestamp or datetime.now()
        self.emotion = emotion
        self.session_id = session_id
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'emotion': self.emotion,
            'session_id': self.session_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ChatMessage':
        """从字典创建"""
        timestamp = datetime.fromisoformat(data['timestamp']) if data.get('timestamp') else None
        return cls(
            role=data['role'],
            content=data['content'],
            timestamp=timestamp,
            emotion=data.get('emotion'),
            session_id=data.get('session_id')
        )

class ChatHistoryManager:
    """聊天记录管理器"""
    
    def __init__(self, db_path: str = "chat_history.db"):
        """初始化聊天记录管理器
        
        Args:
            db_path: 数据库文件路径
        """
        self.db_path = db_path
        self.current_session_id = None
        self._init_database()
    
    def _init_database(self):
        """初始化数据库"""
        os.makedirs(os.path.dirname(self.db_path) if os.path.dirname(self.db_path) else '.', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 创建聊天记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                emotion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建会话表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                title TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
        
        logger.info(f"聊天记录数据库初始化完成: {self.db_path}")
    
    def start_new_session(self, title: str = None) -> str:
        """开始新会话
        
        Args:
            title: 会话标题
            
        Returns:
            会话ID
        """
        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        if not title:
            title = f"聊天会话 {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_sessions (id, title)
            VALUES (?, ?)
        ''', (session_id, title))
        
        conn.commit()
        conn.close()
        
        self.current_session_id = session_id
        logger.info(f"新会话已创建: {session_id}")
        return session_id
    
    def add_message(self, role: str, content: str, emotion: str = None) -> ChatMessage:
        """添加消息
        
        Args:
            role: 角色
            content: 内容
            emotion: 情感
            
        Returns:
            聊天消息对象
        """
        if not self.current_session_id:
            self.start_new_session()
        
        message = ChatMessage(
            role=role,
            content=content,
            emotion=emotion,
            session_id=self.current_session_id
        )
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 插入消息
        cursor.execute('''
            INSERT INTO chat_messages (session_id, role, content, timestamp, emotion)
            VALUES (?, ?, ?, ?, ?)
        ''', (message.session_id, message.role, message.content, 
              message.timestamp.isoformat(), message.emotion))
        
        # 更新会话信息
        cursor.execute('''
            UPDATE chat_sessions 
            SET updated_at = CURRENT_TIMESTAMP, 
                message_count = message_count + 1
            WHERE id = ?
        ''', (self.current_session_id,))
        
        conn.commit()
        conn.close()
        
        return message
    
    def get_session_messages(self, session_id: str = None, limit: int = 50) -> List[ChatMessage]:
        """获取会话消息
        
        Args:
            session_id: 会话ID，None则使用当前会话
            limit: 限制数量
            
        Returns:
            消息列表
        """
        if not session_id:
            session_id = self.current_session_id
            
        if not session_id:
            return []
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT role, content, timestamp, emotion, session_id
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY timestamp ASC
            LIMIT ?
        ''', (session_id, limit))
        
        messages = []
        for row in cursor.fetchall():
            message = ChatMessage(
                role=row[0],
                content=row[1],
                timestamp=datetime.fromisoformat(row[2]),
                emotion=row[3],
                session_id=row[4]
            )
            messages.append(message)
        
        conn.close()
        return messages
    
    def get_recent_context(self, limit: int = 10) -> List[Dict[str, str]]:
        """获取最近的对话上下文，格式化为LLM使用
        
        Args:
            limit: 限制数量
            
        Returns:
            格式化的消息列表
        """
        messages = self.get_session_messages(limit=limit)
        return [{'role': msg.role, 'content': msg.content} for msg in messages]
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """获取所有会话
        
        Returns:
            会话列表
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, created_at, updated_at, message_count
            FROM chat_sessions
            ORDER BY updated_at DESC
        ''')
        
        sessions = []
        for row in cursor.fetchall():
            sessions.append({
                'id': row[0],
                'title': row[1],
                'created_at': row[2],
                'updated_at': row[3],
                'message_count': row[4]
            })
        
        conn.close()
        return sessions
    
    def delete_session(self, session_id: str):
        """删除会话
        
        Args:
            session_id: 会话ID
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 删除消息
        cursor.execute('DELETE FROM chat_messages WHERE session_id = ?', (session_id,))
        
        # 删除会话
        cursor.execute('DELETE FROM chat_sessions WHERE id = ?', (session_id,))
        
        conn.commit()
        conn.close()
        
        if self.current_session_id == session_id:
            self.current_session_id = None
        
        logger.info(f"会话已删除: {session_id}")
    
    def clear_old_sessions(self, days: int = 30):
        """清理旧会话
        
        Args:
            days: 保留天数
        """
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取要删除的会话
        cursor.execute('''
            SELECT id FROM chat_sessions 
            WHERE updated_at < ?
        ''', (cutoff_date.isoformat(),))
        
        old_sessions = [row[0] for row in cursor.fetchall()]
        
        # 删除旧消息和会话
        for session_id in old_sessions:
            cursor.execute('DELETE FROM chat_messages WHERE session_id = ?', (session_id,))
            cursor.execute('DELETE FROM chat_sessions WHERE id = ?', (session_id,))
        
        conn.commit()
        conn.close()
        
        logger.info(f"已清理 {len(old_sessions)} 个旧会话")
    
    def export_session(self, session_id: str, format: str = 'json') -> str:
        """导出会话
        
        Args:
            session_id: 会话ID
            format: 导出格式 ('json' 或 'txt')
            
        Returns:
            导出内容
        """
        messages = self.get_session_messages(session_id)
        
        if format == 'json':
            return json.dumps([msg.to_dict() for msg in messages], 
                            ensure_ascii=False, indent=2)
        elif format == 'txt':
            lines = []
            for msg in messages:
                timestamp = msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                role_name = '用户' if msg.role == 'user' else 'AI助手'
                lines.append(f"[{timestamp}] {role_name}: {msg.content}")
            return '\n'.join(lines)
        else:
            raise ValueError(f"不支持的导出格式: {format}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息
        
        Returns:
            统计数据
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 总消息数
        cursor.execute('SELECT COUNT(*) FROM chat_messages')
        total_messages = cursor.fetchone()[0]
        
        # 总会话数
        cursor.execute('SELECT COUNT(*) FROM chat_sessions')
        total_sessions = cursor.fetchone()[0]
        
        # 最近7天消息数
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        cursor.execute('SELECT COUNT(*) FROM chat_messages WHERE timestamp > ?', (week_ago,))
        recent_messages = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_messages': total_messages,
            'total_sessions': total_sessions,
            'recent_messages': recent_messages
        }

# 全局聊天记录管理器实例
chat_history = ChatHistoryManager() 