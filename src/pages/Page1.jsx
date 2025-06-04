import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page1.css';
import Live2DModelComponent from '../components/Live2DModel';

function Page1() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      // 保存昵称到 localStorage
      localStorage.setItem('userNickname', nickname);
      // 导航到直播页面
      navigate('/live');
    }
  };

  return (
    <div className="page1-bg">
      {/* 背景装饰，可后续加入图片 */}
      <div className="page1-content">
        <h1 className="page1-title">Virtual AI Streamer</h1>
        <h2 className="page1-subtitle">一个基于 React + Vite 的虚拟主播体验</h2>
        <p className="page1-desc">
          你来了。噢，看来直播间来了新的观众呢。
        </p>
        {/* 新增昵称输入表单 */}
        <form onSubmit={handleSubmit} className="nickname-form">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入你的昵称"
            required
          />
          <button type="submit">进入直播间</button>
        </form>
        <div className="page1-features">
          <div className="feature-card animated-card">
            {/* 可替换为图标或图片 */}
            <div className="feature-icon">🎤</div>
            <div className="feature-title">AI 实时对话</div>
            <div className="feature-desc">与AI主播畅聊，体验智能互动。</div>
          </div>
          <div className="feature-card animated-card">
            <div className="feature-icon">😊</div>
            <div className="feature-title">丰富表情动画</div>
            <div className="feature-desc">多种表情和动作，主播更生动。</div>
          </div>
          <div className="feature-card animated-card">
            <div className="feature-icon">💬</div>
            <div className="feature-title">观众互动</div>
            <div className="feature-desc">弹幕、点赞、送礼物，乐趣无穷。</div>
          </div>
        </div>
        {/* Live2D 模型区域 */}
        <div className="live2d-container">
          <Live2DModelComponent />
        </div>
      </div>
    </div>
  );
}

export default Page1; 