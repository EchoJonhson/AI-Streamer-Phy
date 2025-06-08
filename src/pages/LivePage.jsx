import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Live2DModelComponent from '../components/Live2DModel';
import LiveBackground from '../components/LiveBackground';
import './LivePage.css';

const LivePage = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [modelPath, setModelPath] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [backgroundType, setBackgroundType] = useState('image'); // 'video' or 'image'
  const [backgroundSrc, setBackgroundSrc] = useState('./backgrounds/custom-bg.png');
  const [debugMode, setDebugMode] = useState(true);
  const navigate = useNavigate();

  // 初始化模型路径
  useEffect(() => {
    // 修正模型路径，使用相对路径
    const modelPath = '/live2d/models/wuwuwu/wuwuwu.model3.json';
    console.log('设置模型路径:', modelPath);
    setModelPath(modelPath);
  }, []);

  // 检查用户是否已登录
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      // 如果没有用户名，设置一个默认值而不是跳转
      const defaultName = '游客' + Math.floor(Math.random() * 1000);
      localStorage.setItem('username', defaultName);
      setUsername(defaultName);
      
      // 添加欢迎消息
      setMessages([
        {
          id: Date.now(),
          sender: 'AI主播',
          content: `欢迎 ${defaultName} 来到直播间！我是你的虚拟主播，很高兴见到你~`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
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

  // 检查模型文件是否存在
  useEffect(() => {
    if (!modelPath) return;
    
    const checkModelExists = async () => {
      try {
        setModelLoading(true);
        console.log(`尝试检查模型: ${modelPath}`);
        
        const response = await fetch(modelPath);
        if (response.ok) {
          console.log(`模型文件存在: ${modelPath}`);
          const jsonData = await response.json();
          console.log('模型配置:', jsonData);
        } else {
          console.error(`模型文件不存在: ${modelPath}, 状态: ${response.status}`);
        }
      } catch (error) {
        console.error(`检查模型文件失败: ${error.message}`);
      } finally {
        setModelLoading(false);
      }
    };
    
    checkModelExists();
  }, [modelPath]);

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

  // 切换调试模式
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  return (
    <div className="live-page">
      <div className="live-container">
        <div className="model-container">
          {/* 添加背景 */}
          <LiveBackground type={backgroundType} src={backgroundSrc} />
          
          {/* 集成Live2D模型组件 */}
          {modelPath && (
            <Live2DModelComponent 
              modelPath={modelPath}
              width={window.innerWidth * 0.6}
              height={window.innerHeight - 150}
            />
          )}
          
          {/* 调试信息 */}
          {debugMode && (
            <div className="debug-info">
              <p>当前模型路径: {modelPath}</p>
              <p>模型状态: {modelLoading ? '检查中...' : '已检查'}</p>
              <p>背景类型: {backgroundType}</p>
              <button onClick={toggleDebugMode}>隐藏调试信息</button>
            </div>
          )}
          
          {!debugMode && (
            <button className="debug-toggle" onClick={toggleDebugMode}>
              显示调试信息
            </button>
          )}
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
