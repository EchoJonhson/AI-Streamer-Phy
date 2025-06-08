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
PIXI.settings.CORS_MODE = 'anonymous';

const Live2DModelComponent = ({ modelPath, width = 300, height = 500 }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const modelRef = useRef(null);
  const [loadingState, setLoadingState] = useState('初始化中...');
  const [errorDetails, setErrorDetails] = useState('');
  const containerRef = useRef(null);
  const onMouseMoveRef = useRef(null); // 用于存储事件处理函数引用，以便清理
  const blinkTimerRef = useRef(null); // 用于存储眨眼计时器
  
  // 用于平滑过渡的目标值和当前值
  const targetValuesRef = useRef({
    eyeX: 0,
    eyeY: 0,
    headX: 0,
    headY: 0,
    bodyX: 0,
    bodyY: 0
  });
  
  const currentValuesRef = useRef({
    eyeX: 0,
    eyeY: 0,
    headX: 0,
    headY: 0,
    bodyX: 0,
    bodyY: 0
  });
  
  // 眨眼状态
  const blinkStateRef = useRef({
    isBlinking: false,
    value: 0,
    phase: 'close' // 'close' 或 'open'
  });
  
  // 呼吸状态
  const breathStateRef = useRef({
    time: 0,
    amplitude: 0.2, // 呼吸幅度
    frequency: 0.3  // 呼吸频率
  });

  useEffect(() => {
    // 初始化PIXI应用
    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      width,
      height,
      backgroundColor: 0x00000000, // 完全透明背景
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      transparent: true, // 确保应用背景透明
    });
    
    appRef.current = app;
          
    // 加载Live2D模型
    const loadModel = async () => {
      try {
        setLoadingState('加载模型中...');
        console.log('开始加载模型:', modelPath);
        
        // 确保live2dcubismcore.min.js已经加载
        if (!window.Live2DCubismCore) {
          const script = document.createElement('script');
          script.src = './live2d/core/live2dcubismcore.min.js';
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('无法加载Live2D核心库'));
            
            // 设置超时
            setTimeout(() => {
              if (!window.Live2DCubismCore) {
                reject(new Error('加载Live2D核心库超时'));
              }
            }, 5000);
          });
        }
        
        // 从指定路径加载模型
        const model = await Live2DModel.from(modelPath, {
          autoInteract: false, // 关闭自动交互，我们将自定义交互
          autoUpdate: true,
          motionPreload: true,
        });
        
        console.log('模型加载成功:', model);
        setLoadingState('模型加载成功');
          
        // 设置模型属性
        model.anchor.set(0.5, 0.5);
        
        // 将模型位置调整到画布的底部，按照要求调整
        model.position.set(width / 2, height * 1.2);
          
        // 调整模型大小为2.5倍
        const scale = Math.min(width / model.width, height / model.height) * 2.5;
        model.scale.set(scale, scale);
          
        // 添加模型到舞台
        app.stage.addChild(model);
        
        // 保存模型引用
        modelRef.current = model;
        
        // 设置交互
        setupInteraction(model, app);
        
        // 设置随机眨眼
        setupRandomBlinking(model);
      } catch (error) {
        console.error('加载Live2D模型失败:', error);
        setLoadingState(`加载失败`);
        setErrorDetails(`错误详情: ${error.message}\n堆栈: ${error.stack}`);
      }
    };
    
    loadModel();

    // 清理函数
    return () => {
      // 移除鼠标移动事件监听器
      if (onMouseMoveRef.current) {
        document.removeEventListener('mousemove', onMouseMoveRef.current);
        onMouseMoveRef.current = null;
      }
      
      // 清除眨眼计时器
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
        blinkTimerRef.current = null;
      }
      
      // 销毁PIXI应用
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        modelRef.current = null;
      }
    };
  }, [modelPath, width, height]);
  
  // 设置随机眨眼
  const setupRandomBlinking = (model) => {
    const scheduleNextBlink = () => {
      // 随机2-6秒后眨眼
      const nextBlinkTime = 2000 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        blinkStateRef.current.isBlinking = true;
        blinkStateRef.current.phase = 'close';
        blinkStateRef.current.value = 0;
        
        // 眨眼结束后安排下一次眨眼
        setTimeout(() => {
          scheduleNextBlink();
        }, 300); // 眨眼动作持续约300毫秒
      }, nextBlinkTime);
    };
    
    // 开始眨眼循环
    scheduleNextBlink();
  };
  
  // 设置模型交互
  const setupInteraction = (model, app) => {
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

    // 添加鼠标移动跟踪
    const onMouseMove = (event) => {
      if (!model || !containerRef.current) return;
      
      // 获取容器的位置和大小
      const rect = containerRef.current.getBoundingClientRect();
      
      // 计算鼠标在容器内的相对位置 (-1 到 1 的范围)
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      
      // 限制范围在 -1 到 1 之间
      const limitedX = Math.max(-1, Math.min(1, mouseX));
      const limitedY = Math.max(-1, Math.min(1, mouseY));
      
      // 更新目标值
      targetValuesRef.current = {
        eyeX: limitedX,
        eyeY: limitedY,
        headX: limitedX * 30,
        headY: limitedY * 30,
        bodyX: limitedX * 10,
        bodyY: limitedY * 10
      };
    };

    // 保存事件处理函数引用，以便清理
    onMouseMoveRef.current = onMouseMove;
    
    // 添加鼠标移动事件监听器
    document.addEventListener('mousemove', onMouseMove);
    
    // 添加清理函数到app.ticker，确保在每一帧更新模型
    app.ticker.add((delta) => {
      if (model && model.internalModel && model.internalModel.coreModel) {
        // 平滑过渡到目标值
        const current = currentValuesRef.current;
        const target = targetValuesRef.current;
        
        // 不同部位的平滑系数 (越小越平滑)
        const eyeSmoothing = 0.1;
        const headSmoothing = 0.05;
        const bodySmoothing = 0.02;
        
        // 平滑插值
        current.eyeX += (target.eyeX - current.eyeX) * eyeSmoothing;
        current.eyeY += (target.eyeY - current.eyeY) * eyeSmoothing;
        current.headX += (target.headX - current.headX) * headSmoothing;
        current.headY += (target.headY - current.headY) * headSmoothing;
        current.bodyX += (target.bodyX - current.bodyX) * bodySmoothing;
        current.bodyY += (target.bodyY - current.bodyY) * bodySmoothing;
        
        // 应用到模型参数
        const coreModel = model.internalModel.coreModel;
        
        // 更新呼吸状态
        const breath = breathStateRef.current;
        breath.time += delta * 0.016; // 控制呼吸速度
        const breathValue = Math.sin(breath.time * breath.frequency * Math.PI) * breath.amplitude;
        
        // 眼球跟踪
        if (coreModel.getParameterCount) {
          // 检查参数是否存在并应用
          if (coreModel.getParameterId('ParamEyeBallX') !== -1) {
            coreModel.setParameterValueById('ParamEyeBallX', current.eyeX);
          }
          if (coreModel.getParameterId('ParamEyeBallY') !== -1) {
            coreModel.setParameterValueById('ParamEyeBallY', current.eyeY);
          }
          
          // 头部跟踪
          if (coreModel.getParameterId('ParamAngleX') !== -1) {
            coreModel.setParameterValueById('ParamAngleX', current.headX);
          }
          if (coreModel.getParameterId('ParamAngleY') !== -1) {
            coreModel.setParameterValueById('ParamAngleY', current.headY + breathValue * 2);
          }
          if (coreModel.getParameterId('ParamAngleZ') !== -1) {
            coreModel.setParameterValueById('ParamAngleZ', breathValue * 2);
          }
          
          // 身体跟踪
          if (coreModel.getParameterId('ParamBodyAngleX') !== -1) {
            coreModel.setParameterValueById('ParamBodyAngleX', current.bodyX);
          }
          if (coreModel.getParameterId('ParamBodyAngleY') !== -1) {
            coreModel.setParameterValueById('ParamBodyAngleY', current.bodyY + breathValue * 0.8);
          }
          if (coreModel.getParameterId('ParamBodyAngleZ') !== -1) {
            coreModel.setParameterValueById('ParamBodyAngleZ', breathValue);
          }
          
          // 应用呼吸效果到胸部
          if (coreModel.getParameterId('ParamBreath') !== -1) {
            coreModel.setParameterValueById('ParamBreath', breathValue + 0.5);
          }
          
          // 处理眨眼
          if (blinkStateRef.current.isBlinking) {
            const blink = blinkStateRef.current;
            
            // 眨眼动画
            if (blink.phase === 'close') {
              blink.value += 0.1; // 控制眨眼速度
              if (blink.value >= 1) {
                blink.phase = 'open';
              }
            } else {
              blink.value -= 0.05; // 控制睁眼速度，比眨眼慢一些
              if (blink.value <= 0) {
                blink.isBlinking = false;
                blink.value = 0;
              }
            }
            
            // 应用眨眼参数
            if (coreModel.getParameterId('ParamEyeLOpen') !== -1) {
              coreModel.setParameterValueById('ParamEyeLOpen', 1 - blink.value);
            }
            if (coreModel.getParameterId('ParamEyeROpen') !== -1) {
              coreModel.setParameterValueById('ParamEyeROpen', 1 - blink.value);
            }
          }
        }
        
        // 确保物理效果正常工作
        if (model.internalModel.motionManager) {
          model.internalModel.motionManager.update();
        }
        
        // 更新模型
        model.update(app.ticker.deltaMS / 1000);
      }
    });
  };

  return (
    <div className="live2d-container" ref={containerRef}>
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