import React, { useEffect, useRef, useState } from 'react';
import useLive2DModel from '../hooks/useLive2DModel';
import '../styles/Live2DModel.css';

/**
 * Live2D模型组件
 * @param {Object} props - 组件属性
 * @param {string} props.modelPath - 模型路径
 * @param {number} props.width - 宽度
 * @param {number} props.height - 高度
 * @param {boolean} props.draggable - 是否可拖动
 * @param {Function} props.onLoad - 加载完成回调
 * @param {Function} props.onError - 错误回调
 */
const Live2DModel = ({
  modelPath,
  width = 300,
  height = 500,
  draggable = false,
  onLoad = () => {},
  onError = () => {},
}) => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // 使用自定义钩子加载模型
  const { model, loading, error } = useLive2DModel(modelPath, { width, height });
  
  // 检查库是否已加载
  const checkLibrariesLoaded = () => {
    const pixiLoaded = !!window.PIXI;
    const cubismCoreLoaded = !!window.Live2DCubismCore;
    const live2dLoaded = !!window.Live2D;
    const pixiLive2dLoaded = pixiLoaded && !!window.PIXI.live2d;
    
    console.log('库加载状态:', {
      PIXI: pixiLoaded ? '已加载' : '未加载',
      Live2DCubismCore: cubismCoreLoaded ? '已加载' : '未加载',
      Live2D: live2dLoaded ? '已加载' : '未加载',
      'PIXI-Live2D-Display': pixiLive2dLoaded ? '已加载' : '未加载'
    });
    
    return pixiLoaded && cubismCoreLoaded && pixiLive2dLoaded;
  };

  // 初始化PIXI应用
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    try {
      // 检查必要的库是否已加载
      if (!window.PIXI || !window.PIXI.Application) {
        console.error('PIXI.js未加载');
        onError('PIXI.js未加载');
        return;
      }

      // 创建PIXI应用
      const app = new window.PIXI.Application({
        width,
        height,
        transparent: true,
        autoStart: true,
        antialias: true,
      });

      // 将PIXI应用添加到DOM
      containerRef.current.appendChild(app.view);
      appRef.current = app;

      setIsInitialized(true);
      console.log('PIXI应用已初始化');
    } catch (err) {
      console.error('初始化PIXI应用失败:', err);
      onError(`初始化PIXI应用失败: ${err.message}`);
    }
  }, [width, height, isInitialized, onError]);

  // 添加模型到场景
  useEffect(() => {
    if (!isInitialized || !appRef.current || !model) return;

    try {
      // 清除现有内容
      while (appRef.current.stage.children.length > 0) {
        appRef.current.stage.removeChild(appRef.current.stage.children[0]);
      }

      // 添加模型到场景
      appRef.current.stage.addChild(model);
      
      // 启动随机眨眼
      if (model.internalModel) {
        console.log('模型内部结构初始化完成');
        if (model.internalModel.startRandomMotion) {
          model.internalModel.startRandomMotion('idle');
        }
        if (model.internalModel.startRandomEyeBlink) {
          console.log('启动随机眨眼');
          model.internalModel.startRandomEyeBlink();
        }
      } else {
        // 如果internalModel还未加载，设置定时器等待
        const checkInternalModel = setInterval(() => {
          if (model.internalModel) {
            console.log('模型内部结构初始化完成');
            if (model.internalModel.startRandomMotion) {
              model.internalModel.startRandomMotion('idle');
            }
            if (model.internalModel.startRandomEyeBlink) {
              console.log('启动随机眨眼');
              model.internalModel.startRandomEyeBlink();
            }
            clearInterval(checkInternalModel);
          }
        }, 500);
        
        // 5秒后停止检查
        setTimeout(() => clearInterval(checkInternalModel), 5000);
      }

      // 调用加载完成回调
      onLoad(model);
    } catch (err) {
      console.error('添加模型到场景失败:', err);
      onError(`添加模型到场景失败: ${err.message}`);
    }
  }, [model, isInitialized, onLoad, onError]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, []);

  // 处理拖动开始
  const handleMouseDown = (e) => {
    if (!draggable) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y,
    };
  };

  // 处理拖动移动
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  // 处理拖动结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`live2d-container ${draggable ? 'draggable' : ''}`}
      style={{
        width,
        height,
        transform: draggable ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` : 'none',
        cursor: isDragging ? 'grabbing' : draggable ? 'grab' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div ref={containerRef} className="live2d-canvas-container"></div>
      {loading && (
        <div className="live2d-loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      )}
      {error && (
        <div className="live2d-error">
          <p>加载失败: {error}</p>
        </div>
      )}
    </div>
  );
};

export default Live2DModel; 