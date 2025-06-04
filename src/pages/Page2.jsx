import React, { useState } from 'react';
import './Page2.css';
import Live2DModelComponent from '../components/Live2DModel';

function Page2() {
  const [message, setMessage] = useState('');
  const [danmakuList, setDanmakuList] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newDanmaku = {
        id: Date.now(),
        text: message,
        user: localStorage.getItem('userNickname') || '游客'
      };
      setDanmakuList([...danmakuList, newDanmaku]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="page2-container">
      {/* 左侧：Live2D 模型区域 */}
      <div className="live2d-section">
        <Live2DModelComponent />
        <div className="gesture-hints neon-text">
          <h3>互动提示</h3>
          <p>👆 点击模型触发动作</p>
          <p>🖱️ 拖动模型改变位置</p>
          <p>🔍 滚轮缩放模型大小</p>
        </div>
      </div>
      
      {/* 右侧：互动区域 */}
      <div className="interaction-section">
        {/* 弹幕区域 */}
        <div className="danmaku-container">
          <div className="danmaku-list">
            {danmakuList.map(danmaku => (
              <div key={danmaku.id} className="danmaku-item">
                <span className="user-name">{danmaku.user}:</span>
                <span className="danmaku-text">{danmaku.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 互动按钮区域 */}
        <div className="interaction-buttons">
          <button className="interaction-btn like-btn">点赞</button>
          <button className="interaction-btn gift-btn">送礼物</button>
          <button className="interaction-btn follow-btn">关注</button>
        </div>
        
        {/* 输入框区域 */}
        <div className="input-area">
          <input 
            type="text" 
            className="danmaku-input" 
            placeholder="发送弹幕..." 
            maxLength={50}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="send-btn" onClick={handleSendMessage}>发送</button>
        </div>
      </div>
    </div>
  );
}

export default Page2; 