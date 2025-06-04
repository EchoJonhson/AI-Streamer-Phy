import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LivePage.css';

const LivePage = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // 检查用户是否已登录
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      navigate('/');
    } else {
      setUsername(storedUsername);
      // 添加欢迎消息
      setMessages([
        {
          id: Date.now(),
          sender: 'AI主播',
          content: `欢迎 ${storedUsername} 来到直播间！我是你的虚拟主播，很高兴见到你~`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: username,
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      isUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');

    // 模拟AI回复（这里将来会替换为真实的AI API调用）
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'AI主播',
        content: `谢谢你的消息！这是一个AI回复的示例。将来这里会集成真实的AI模型来回应你的消息："${message}"`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    }, 1000);
  };

  return (
    <div className="live-page">
      <div className="live-container">
        <div className="model-container">
          {/* 这里将来会放置Live2D模型 */}
          <div className="model-placeholder">
            <div className="placeholder-text">Live2D模型将在这里显示</div>
          </div>
        </div>
        
        <div className="chat-container">
          <div className="chat-header">
            <h2>直播间聊天</h2>
            <div className="online-status">
              <span className="status-dot"></span>
              在线
            </div>
          </div>
          
          <div className="messages-container">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.isUser ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-header">
                  <span className="sender">{msg.sender}</span>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
          </div>
          
          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="发送消息给AI主播..."
              className="message-input"
            />
            <button type="submit" className="send-button">发送</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LivePage; 