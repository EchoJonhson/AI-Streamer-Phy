import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

// 必须暴露给 window
window.PIXI = PIXI;

// 尝试多种可能的路径
const MODEL_PATHS = [
  '/assets/models/wuwuwu.model3.json',
  './assets/models/wuwuwu.model3.json',
  '../assets/models/wuwuwu.model3.json',
  '../../assets/models/wuwuwu.model3.json',
  'assets/models/wuwuwu.model3.json'
];

export default function Live2DModelComponent() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    async function setupLive2D() {
      try {
        console.log('初始化Live2D模型...');
        
        // 创建 PIXI 应用
        const app = new PIXI.Application({
          view: canvasRef.current,
          autoStart: true,
          backgroundAlpha: 0,
          resizeTo: canvasRef.current.parentElement || canvasRef.current.parentNode,
        });
        
        appRef.current = app;
        console.log('PIXI应用创建成功');

        // 尝试加载模型，使用多个可能的路径
        let model = null;
        let loadError = null;
        
        for (const path of MODEL_PATHS) {
          try {
            console.log('尝试加载模型:', path);
            model = await Live2DModel.from(path);
            console.log('模型加载成功:', path);
            break; // 如果成功加载，跳出循环
          } catch (err) {
            console.warn(`路径 ${path} 加载失败:`, err);
            loadError = err;
          }
        }
        
        if (!model) {
          throw new Error('所有模型路径都加载失败: ' + (loadError ? loadError.message : '未知错误'));
        }
        
        // 设置模型属性
        model.x = app.screen.width / 2;
        model.y = app.screen.height / 2;
        model.anchor.set(0.5, 0.5);
        model.scale.set(0.3, 0.3);

        // 添加到舞台
        app.stage.addChild(model);
        setLoading(false);

        // 添加交互
        model.on('hit', (hitAreas) => {
          if (hitAreas.includes('body')) {
            model.motion('tap_body');
          }
        });
        
        // 添加拖拽功能
        model.buttonMode = true;
        model.interactive = true;
        model.on('pointerdown', (e) => {
          model.dragging = true;
          model.dragData = e.data;
          model.dragOffset = { x: model.x - e.data.global.x, y: model.y - e.data.global.y };
        });
        
        model.on('pointermove', (e) => {
          if (model.dragging) {
            const newPosition = e.data.global;
            model.x = newPosition.x + model.dragOffset.x;
            model.y = newPosition.y + model.dragOffset.y;
          }
        });
        
        model.on('pointerup', () => {
          model.dragging = false;
        });
        
        model.on('pointerupoutside', () => {
          model.dragging = false;
        });
        
        // 添加滚轮缩放
        const wheelHandler = (e) => {
          if (e.deltaY < 0) {
            // 放大
            model.scale.x *= 1.1;
            model.scale.y *= 1.1;
          } else {
            // 缩小
            model.scale.x /= 1.1;
            model.scale.y /= 1.1;
          }
        };
        
        canvasRef.current.addEventListener('wheel', wheelHandler);
        
        return () => {
          canvasRef.current?.removeEventListener('wheel', wheelHandler);
        };
      } catch (err) {
        console.error('初始化失败:', err);
        setError(`初始化失败: ${err.message}`);
        setLoading(false);
      }
    }

    setupLive2D();

    // 清理
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, true);
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'red',
        padding: '20px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '8px'
      }}>
        <div>
          <h3>模型加载错误</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#00ffff',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '8px'
      }}>
        <div className="neon-text">
          <h3>加载中...</h3>
          <p>正在初始化Live2D模型</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} style={{ 
        width: '100%', 
        height: '100%',
        display: 'block'
      }} />
    </div>
  );
} 