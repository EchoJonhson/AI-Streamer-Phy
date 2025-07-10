import React from 'react';

const LibraryHelp = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>库文件下载说明</h1>
      
      <p>您的项目需要以下两个库文件才能正确加载Live2D模型：</p>
      
      <ol>
        <li>
          <strong>PIXI.js</strong>
          <p>下载链接：<a href="https://pixijs.download/v6.5.0/pixi.min.js" download>pixi.min.js (v6.5.0)</a></p>
          <p>将下载的文件保存到 <code>public/libs/pixi.min.js</code></p>
        </li>
        
        <li>
          <strong>pixi-live2d-display</strong>
          <p>下载链接：<a href="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js" download>pixi-live2d-display.min.js (v0.4.0)</a></p>
          <p>将下载的文件保存到 <code>public/libs/pixi-live2d-display.min.js</code></p>
        </li>
      </ol>
      
      <h2>手动下载说明</h2>
      <p>如果上方链接无法正常工作，您可以：</p>
      <ol>
        <li>访问 <a href="https://pixijs.download/v6.5.0/pixi.min.js" target="_blank">https://pixijs.download/v6.5.0/pixi.min.js</a></li>
        <li>右键点击页面，选择"另存为"</li>
        <li>保存为 pixi.min.js</li>
        <li>访问 <a href="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js" target="_blank">https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js</a></li>
        <li>右键点击页面，选择"另存为"</li>
        <li>保存为 pixi-live2d-display.min.js</li>
      </ol>
      
      <h2>库文件内容</h2>
      <p>您也可以直接复制以下内容创建文件：</p>
      
      <h3>1. pixi.min.js 下载链接</h3>
      <a href="https://pixijs.download/v6.5.0/pixi.min.js" download className="download-button">
        下载 PIXI.js v6.5.0
      </a>
      
      <h3>2. pixi-live2d-display.min.js 下载链接</h3>
      <a href="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js" download className="download-button">
        下载 pixi-live2d-display v0.4.0
      </a>
      
      <style jsx>{`
        .download-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          text-decoration: none;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .download-button:hover {
          background-color: #45a049;
        }
        
        code {
          background-color: #f1f1f1;
          padding: 2px 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default LibraryHelp; 