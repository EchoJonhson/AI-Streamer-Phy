import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [settings, setSettings] = useState({
    enableVoice: false,
    enableCamera: false,
    modelType: 'default',
    aiResponseSpeed: 'normal',
    theme: 'dark'
  });

  // 检查用户是否已登录
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      navigate('/');
    } else {
      setUsername(storedUsername);
      
      // 从本地存储加载设置（如果有）
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    // 保存设置到本地存储
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // 显示保存成功提示
    alert('设置已保存');
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>设置</h1>
        <p className="settings-username">当前用户: {username}</p>
        
        <div className="settings-section">
          <h2>基本设置</h2>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                name="enableVoice"
                checked={settings.enableVoice}
                onChange={handleChange}
              />
              启用语音回复
            </label>
            <p className="setting-description">允许AI主播使用语音与你交流</p>
          </div>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                name="enableCamera"
                checked={settings.enableCamera}
                onChange={handleChange}
              />
              启用摄像头识别
            </label>
            <p className="setting-description">使用摄像头进行手势和表情识别</p>
          </div>
          
          <div className="setting-item">
            <label htmlFor="modelType">主播模型选择</label>
            <select
              id="modelType"
              name="modelType"
              value={settings.modelType}
              onChange={handleChange}
            >
              <option value="default">默认模型</option>
              <option value="model1">模型1</option>
              <option value="model2">模型2</option>
            </select>
            <p className="setting-description">选择你喜欢的虚拟主播形象</p>
          </div>
          
          <div className="setting-item">
            <label htmlFor="aiResponseSpeed">AI响应速度</label>
            <select
              id="aiResponseSpeed"
              name="aiResponseSpeed"
              value={settings.aiResponseSpeed}
              onChange={handleChange}
            >
              <option value="fast">快速</option>
              <option value="normal">正常</option>
              <option value="slow">慢速</option>
            </select>
            <p className="setting-description">调整AI主播回复的速度</p>
          </div>
          
          <div className="setting-item">
            <label htmlFor="theme">界面主题</label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleChange}
            >
              <option value="dark">暗色主题</option>
              <option value="light">亮色主题</option>
              <option value="cyberpunk">赛博朋克</option>
            </select>
            <p className="setting-description">选择界面显示主题</p>
          </div>
        </div>
        
        <div className="settings-actions">
          <button className="save-button" onClick={handleSave}>保存设置</button>
          <button className="reset-button" onClick={() => navigate('/live')}>返回直播间</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;