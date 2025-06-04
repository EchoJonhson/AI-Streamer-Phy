import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // 保存用户名到本地存储
      localStorage.setItem('username', username.trim());
      // 导航到直播间
      navigate('/live');
    }
  };

  return (
    <div className="home-page">
      <div className="welcome-container">
        <h1 className="welcome-title">欢迎来到虚拟AI主播</h1>
        <p className="welcome-subtitle">与AI驱动的虚拟主播互动，体验未来的娱乐方式</p>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">请输入您的昵称</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="您的昵称"
                required
              />
            </div>
            <button type="submit" className="enter-button">
              进入直播间
            </button>
          </form>
        </div>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>AI驱动</h3>
            <p>由先进的AI模型提供支持，实现自然的对话体验</p>
          </div>
          <div className="feature">
            <div className="feature-icon">👋</div>
            <h3>手势互动</h3>
            <p>通过摄像头识别手势，与虚拟主播进行互动</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💬</div>
            <h3>实时对话</h3>
            <p>与虚拟主播进行实时对话，获得个性化的回应</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 