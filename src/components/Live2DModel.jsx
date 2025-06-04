import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import './Live2DModel.css';

// 将PIXI暴露给window，以便pixi-live2d-display能够自动更新Live2D模型
window.PIXI = PIXI;

// 配置PIXI加载器，设置CORS模式
PIXI.LoaderResource.setExtensionLoadType('json', PIXI.LoaderResource.LOAD_TYPE.XHR);
PIXI.LoaderResource.setExtensionXhrType('json', PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON);

// 设置全局CORS模式
PIXI.settings.CORS_MODE = 'no-cors';

const Live2DModelComponent = ({ modelPath, width = 300, height = 500 }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const modelRef = useRef(null);
  const [loadingState, setLoadingState] = useState('初始化中...');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    // 初始化PIXI应用
    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      width,
      height,
      backgroundColor: 0x00000000, // 透明背景
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    appRef.current = app;

    // 加载Live2D模型
    const loadModel = async () => {
      try {
        setLoadingState('加载模型中...');
        console.log('开始加载模型:', modelPath);
        
        // 检查模型文件是否存在
        try {
          const response = await fetch(modelPath, { mode: 'no-cors' });
          console.log('模型文件请求状态:', response.status, response.statusText);
        } catch (fetchError) {
          console.warn('模型文件预检失败，但将继续尝试加载:', fetchError);
        }
        
        // 从指定路径加载模型
        const model = await Live2DModel.from(modelPath, {
          autoInteract: true,
          autoUpdate: true,
          motionPreload: true,
        });
        
        console.log('模型加载成功:', model);
        setLoadingState('模型加载成功');
        
        // 设置模型属性
        model.anchor.set(0.5, 0.5);
        
        // 将模型位置调整到画布的中部，使其完全露出脸部
        model.position.set(width / 2, height * 0.55);
        
        // 调整模型大小
        const scale = Math.min(width / model.width, height / model.height) * 1.6;
        model.scale.set(scale, scale);
        
        // 添加模型到舞台
        app.stage.addChild(model);
        
        // 保存模型引用
        modelRef.current = model;
        
        // 设置交互
        setupInteraction(model);
      } catch (error) {
        console.error('加载Live2D模型失败:', error);
        setLoadingState(`加载失败`);
        setErrorDetails(`错误详情: ${error.message}\n堆栈: ${error.stack}`);
      }
    };
    
    loadModel();
    
    // 清理函数
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        modelRef.current = null;
      }
    };
  }, [modelPath, width, height]);
  
  // 设置模型交互
  const setupInteraction = (model) => {
    // 使模型可交互
    model.interactive = true;
    
    // 点击模型触发动作
    model.on('pointerdown', (event) => {
      // 获取点击位置
      const point = event.data.global;
      
      // 检查点击的命中区域
      const hitAreas = model.hitTest(point.x, point.y);
      console.log('点击模型:', hitAreas);
      
      if (hitAreas && hitAreas.length > 0) {
        // 触发模型的hit事件
        model.emit('hit', hitAreas);
        
        // 根据点击区域执行不同动作
        if (hitAreas.includes('body')) {
          model.motion('tap_body');
        } else if (hitAreas.includes('head')) {
          model.motion('tap_head');
        }
      }
    });
  };
  
  return (
    <div className="live2d-container">
      <canvas ref={canvasRef} className="live2d-canvas" />
      {loadingState !== '模型加载成功' && (
        <div className="loading-overlay">
          <div className="loading-text">{loadingState}</div>
          {errorDetails && (
            <div className="error-details">
              {errorDetails}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Live2DModelComponent; 