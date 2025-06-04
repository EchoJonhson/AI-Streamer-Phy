import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from '@pixi/live2d-display';

// 注册 Live2D 模型
window.PIXI = PIXI;

const Live2DModelComponent = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 初始化 PIXI 应用
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      transparent: true,
    });
    containerRef.current.appendChild(app.view);

    // 加载模型
    const loadModel = async () => {
      try {
        const model = await Live2DModel.from('/assets/models/wuwuwu.model3.json');
        
        // 设置模型位置和大小
        model.scale.set(0.5);
        model.x = app.screen.width / 2;
        model.y = app.screen.height / 2;
        
        // 添加到舞台
        app.stage.addChild(model);

        // 添加鼠标交互
        model.on('pointerdown', () => {
          model.motion('Tap');
        });
      } catch (error) {
        console.error('加载模型失败:', error);
      }
    };

    loadModel();

    // 清理函数
    return () => {
      app.destroy(true);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        zIndex: 1
      }}
    />
  );
};

export default Live2DModelComponent; 