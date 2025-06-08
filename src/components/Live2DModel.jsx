import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import './Live2DModel.css';

// 将PIXI暴露给window，以便pixi-live2d-display能够使用
window.PIXI = PIXI;

// 配置PIXI加载器，设置CORS模式
PIXI.LoaderResource.setExtensionLoadType('json', PIXI.LoaderResource.LOAD_TYPE.XHR);
PIXI.LoaderResource.setExtensionXhrType('json', PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON);

// 设置全局CORS模式
PIXI.settings.CORS_MODE = 'anonymous';

// 确保live2dcubismcore.min.js已经加载
const ensureCubismCoreLoaded = async () => {
  console.log('检查Live2DCubismCore是否已加载');
  
  if (!window.Live2DCubismCore) {
    console.log('Live2DCubismCore未加载，尝试加载...');
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './live2d/core/live2dcubismcore.min.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        console.log('Live2DCubismCore加载成功');
        resolve();
      };
      
      script.onerror = () => {
        console.error('无法加载Live2D核心库');
        reject(new Error('无法加载Live2D核心库'));
      };
      
      // 设置超时
      setTimeout(() => {
        if (!window.Live2DCubismCore) {
          console.error('加载Live2D核心库超时');
          reject(new Error('加载Live2D核心库超时'));
        }
      }, 5000);
    });
  } else {
    console.log('Live2DCubismCore已加载');
    return Promise.resolve();
  }
};

const Live2DModelComponent = ({ modelPath, width = 300, height = 500 }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const modelRef = useRef(null);
  const tickerRef = useRef(null);
  const [loadingState, setLoadingState] = useState('初始化中...');
  const [errorDetails, setErrorDetails] = useState('');
  const [resolvedModelPath, setResolvedModelPath] = useState('');
  const containerRef = useRef(null);
  const onMouseMoveRef = useRef(null);
  const blinkTimerRef = useRef(null);
  
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
    let app = null;
    
    // 解析模型路径
    const resolveModelPath = () => {
      // 如果是绝对URL，直接使用
      if (modelPath.startsWith('http')) {
        return modelPath;
      }
      
      // 如果是相对路径，构建完整URL
      const basePath = window.location.origin;
      // 确保路径以斜杠开头，避免重复斜杠
      const normalizedPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
      const fullPath = `${basePath}${normalizedPath}`;
      console.log('解析后的模型路径:', fullPath);
      setResolvedModelPath(fullPath);
      return fullPath;
    };
    
    // 初始化PIXI应用和加载模型
    const initializeApp = async () => {
      try {
        // 初始化PIXI应用
        console.log('初始化PIXI应用，宽度:', width, '高度:', height);
        app = new PIXI.Application({
          view: canvasRef.current,
          autoStart: true,
          width,
          height,
          backgroundColor: 0x00000000, // 完全透明背景
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          backgroundAlpha: 0, // 使用backgroundAlpha替代transparent
        });
        
        appRef.current = app;
        
        // 确保核心库已加载
        await ensureCubismCoreLoaded();
        
        // 解析模型路径并加载模型
        const fullModelPath = resolveModelPath();
        
        // 加载模型
        await loadModel(app, fullModelPath);
      } catch (error) {
        console.error('初始化应用失败:', error);
        setLoadingState('初始化失败');
        setErrorDetails(`错误详情: ${error.message}\n堆栈: ${error.stack}`);
      }
    };
    
    initializeApp();

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
      
      // 移除ticker
      if (tickerRef.current && appRef.current && appRef.current.ticker) {
        appRef.current.ticker.remove(tickerRef.current);
        tickerRef.current = null;
      }
      
      // 销毁PIXI应用
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        modelRef.current = null;
      }
    };
  }, [modelPath, width, height]);
  
  // 加载Live2D模型
  const loadModel = async (app, fullModelPath) => {
    try {
      setLoadingState('加载模型中...');
      console.log('开始加载模型:', fullModelPath);
      
      // 检查模型文件是否可访问
      try {
        console.log('尝试获取模型文件...');
        const response = await fetch(fullModelPath);
        console.log('模型文件请求状态:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`模型文件请求失败: ${response.status} ${response.statusText}`);
        }
        
        const modelJson = await response.json();
        console.log('模型配置内容:', modelJson);
        
        // 验证纹理文件路径
        if (modelJson.FileReferences && modelJson.FileReferences.Textures) {
          const texturePaths = modelJson.FileReferences.Textures;
          console.log('纹理文件路径:', texturePaths);
          
          // 尝试预加载第一个纹理文件
          if (texturePaths.length > 0) {
            const texturePath = texturePaths[0];
            // 从模型路径中提取基础目录
            const baseUrl = fullModelPath.substring(0, fullModelPath.lastIndexOf('/') + 1);
            const textureUrl = `${baseUrl}${texturePath}`;
            console.log('尝试加载纹理:', textureUrl);
            
            const textureResponse = await fetch(textureUrl);
            if (!textureResponse.ok) {
              console.warn(`纹理文件可能不可访问: ${textureUrl}, 状态: ${textureResponse.status}`);
              setErrorDetails(prev => prev + `\n纹理文件可能不可访问: ${textureUrl}`);
            } else {
              console.log('纹理文件可访问');
            }
          }
        }
      } catch (fetchError) {
        console.error('模型文件预检失败:', fetchError);
        setErrorDetails(`模型文件预检失败: ${fetchError.message}`);
        throw fetchError;
      }
      
      // 从指定路径加载模型
      console.log('开始使用Live2DModel.from加载模型');
      
      // 设置PIXI加载器基础路径
      PIXI.Loader.shared.baseUrl = fullModelPath.substring(0, fullModelPath.lastIndexOf('/') + 1);
      console.log('设置PIXI Loader基础路径:', PIXI.Loader.shared.baseUrl);
      
      // 确保核心库已加载
      if (!window.Live2DCubismCore) {
        console.error('Live2DCubismCore未加载，尝试手动加载');
        await ensureCubismCoreLoaded();
      }
      
      // 不使用registerTicker，避免autoUpdate相关问题
      console.log('使用配置加载模型');
      
      // 完全避免使用autoUpdate属性
      const model = await Live2DModel.from(fullModelPath, {
        autoInteract: false,
        // 不设置autoUpdate属性
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
    
    // 点击模型触发动作 - 使用安全检查
    model.on('pointerdown', (event) => {
      // 获取点击位置
      const point = event.data.global;
      
      try {
        // 检查hitTest方法是否存在
        if (typeof model.hitTest === 'function') {
          // 检查点击的命中区域
          const hitAreas = model.hitTest(point.x, point.y);
          console.log('点击模型:', hitAreas);
          
          if (hitAreas && hitAreas.length > 0) {
            // 触发模型的hit事件
            model.emit('hit', hitAreas);
            
            // 根据点击区域执行不同动作
            if (hitAreas.includes('body')) {
              if (typeof model.motion === 'function') {
                model.motion('tap_body');
              }
            } else if (hitAreas.includes('head')) {
              if (typeof model.motion === 'function') {
                model.motion('tap_head');
              }
            }
          }
        }
      } catch (error) {
        console.warn('处理模型点击事件时出错:', error);
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
    
    // 创建自定义更新函数
    const updateFunction = (delta) => {
      if (!model) return;
      
      try {
        const internalModel = model.internalModel;
        if (!internalModel) return;
        
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
        
        // 更新呼吸状态
        const breath = breathStateRef.current;
        breath.time += delta * 0.016; // 控制呼吸速度
        const breathValue = Math.sin(breath.time * breath.frequency * Math.PI) * breath.amplitude;
        
        // 安全地设置参数值
        const safeSetParam = (paramId, value) => {
          try {
            if (internalModel.coreModel && typeof internalModel.coreModel.setParameterValueById === 'function') {
              internalModel.coreModel.setParameterValueById(paramId, value);
            } else if (typeof internalModel.setParameterValueById === 'function') {
              internalModel.setParameterValueById(paramId, value);
            } else if (typeof internalModel.setParam === 'function') {
              internalModel.setParam(paramId, value);
            }
          } catch (e) {
            // 忽略参数设置错误
          }
        };
        
        // 眼球跟踪
        safeSetParam('ParamEyeBallX', current.eyeX);
        safeSetParam('ParamEyeBallY', current.eyeY);
        
        // 头部跟踪
        safeSetParam('ParamAngleX', current.headX);
        safeSetParam('ParamAngleY', current.headY + breathValue * 2);
        safeSetParam('ParamAngleZ', breathValue * 2);
        
        // 身体跟踪
        safeSetParam('ParamBodyAngleX', current.bodyX);
        safeSetParam('ParamBodyAngleY', current.bodyY + breathValue * 0.8);
        safeSetParam('ParamBodyAngleZ', breathValue);
        
        // 应用呼吸效果到胸部
        safeSetParam('ParamBreath', breathValue + 0.5);
        
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
          safeSetParam('ParamEyeLOpen', 1 - blink.value);
          safeSetParam('ParamEyeROpen', 1 - blink.value);
        }
        
        // 手动更新模型
        try {
          // 尝试直接调用模型的update方法
          if (typeof model.update === 'function') {
            model.update(delta / 60); // 转换为秒
          }
        } catch (updateError) {
          console.warn('更新模型时出错:', updateError);
        }
      } catch (error) {
        console.warn('更新模型参数时出错:', error);
      }
    };
    
    // 保存updateFunction引用以便清理
    tickerRef.current = updateFunction;
    
    // 添加到ticker
    app.ticker.add(updateFunction);
  };

  return (
    <div className="live2d-container" ref={containerRef} style={{ zIndex: 20 }}>
      <canvas ref={canvasRef} className="live2d-canvas" style={{ zIndex: 30 }} />
      {loadingState !== '模型加载成功' && (
        <div className="loading-overlay" style={{ zIndex: 40 }}>
          <div className="loading-text">{loadingState}</div>
          {errorDetails && (
            <div className="error-details">
              <pre>{errorDetails}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Live2DModelComponent; 