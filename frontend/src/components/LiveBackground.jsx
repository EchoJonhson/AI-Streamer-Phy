import React from 'react';
import './LiveBackground.css';

const LiveBackground = ({ type = 'video', src }) => {
  if (!src) {
    // 默认背景
    src = type === 'video' 
      ? './backgrounds/default-bg.mp4' 
      : './backgrounds/default-bg.gif';
  }

  return (
    <div className="live-background">
      {type === 'video' ? (
        <video 
          className="background-media"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src={src} type="video/mp4" />
          您的浏览器不支持视频标签。
        </video>
      ) : (
        <img 
          className="background-media"
          src={src} 
          alt="直播背景" 
        />
      )}
      <div className="background-overlay"></div>
    </div>
  );
};

export default LiveBackground; 