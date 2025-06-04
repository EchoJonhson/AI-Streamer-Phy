import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

// 必须暴露给 window
window.PIXI = PIXI;

// 模型路径
const MODEL_PATH = '/assets/models/wuwuwu.model3.json';

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
        
        // 等待一段时间，确保运行时库加载完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 检查Cubism 2运行时是否已加载
        if (!window.Live2D || !window.Live2D.init) {
          console.warn('Cubism 2运行时未加载，尝试从备用CDN加载...');
          
          // 创建并添加脚本
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js';
          document.head.appendChild(script);
          
          // 等待脚本加载
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('无法加载Cubism 2运行时'));
            // 设置超时
            setTimeout(() => reject(new Error('加载Cubism 2运行时超时')), 5000);
          });
        }
        
        console.log('Cubism 2运行时状态:', window.Live2D ? '已加载' : '未加载');
        
        // 检查Cubism 4运行时是否已加载
        if (!window.Live2DCubismCore) {
          console.warn('Cubism 4运行时未加载');
        } else {
          console.log('Cubism 4运行时已加载');
        }
        
        // 创建 PIXI 应用
        const app = new PIXI.Application({
          view: canvasRef.current,
          autoStart: true,
          backgroundAlpha: 0,
          resizeTo: canvasRef.current.parentElement || canvasRef.current.parentNode,
        });
        
        appRef.current = app;
        console.log('PIXI应用创建成功');

        // 加载模型
        try {
          console.log('尝试加载模型:', MODEL_PATH);
          const model = await Live2DModel.from(MODEL_PATH);
          console.log('模型加载成功');
          
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
          console.error('模型加载失败:', err);
          throw err;
        }
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