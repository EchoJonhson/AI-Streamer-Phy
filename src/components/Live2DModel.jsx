import React, { useEffect, useRef, useState } from 'react';
import './Live2DModel.css';

const Live2DModelComponent = ({ modelPath, width = 300, height = 500, onModelLoaded }) => {
  const canvasRef = useRef(null);
  const [loadingState, setLoadingState] = useState('初始化中...');
  const [errorDetails, setErrorDetails] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      if (!isMounted) return;
      
      try {
        setLoadingState('正在加载模型...');
    
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
          return fullPath;
        };
    
        const fullModelPath = resolveModelPath();
        
        // 检查模型文件是否存在
        try {
          console.log('尝试检查模型:', fullModelPath);
          const response = await fetch(fullModelPath);
          
          if (!response.ok) {
            throw new Error(`模型文件请求失败: ${response.status} ${response.statusText}`);
          }
        
          console.log('模型文件存在:', modelPath);
          const modelConfig = await response.json();
          console.log('模型配置:', modelConfig);
        
          // 成功加载模型配置
          setLoadingState('模型文件已加载');
          
          // 创建一个iframe来加载Live2D模型
          // 这种方法避免了PIXI.js的初始化问题
          const iframe = document.createElement('iframe');
          iframe.style.width = `${width}px`;
          iframe.style.height = `${height}px`;
          iframe.style.border = 'none';
          iframe.style.overflow = 'hidden';
          iframe.style.backgroundColor = 'transparent';
      
          // 创建模型加载脚本
          const createIframeContent = () => {
            return `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <title>Live2D Model Viewer</title>
                <style>
                  body, html { 
                    margin: 0; 
                    padding: 0; 
                    overflow: hidden; 
                    width: 100%; 
                    height: 100%;
                    background-color: transparent;
                  }
                  canvas { 
                    display: block; 
                    width: 100%; 
                    height: 100%;
                  }
                </style>
                <script src="${window.location.origin}/libs/live2d.min.js"></script>
                <script src="${window.location.origin}/live2d/core/live2dcubismcore.min.js"></script>
                <script src="${window.location.origin}/libs/pixi.min.js"></script>
                <script src="${window.location.origin}/libs/pixi-live2d-display.min.js"></script>
                <script>
                  // 检查库是否正确加载
                  console.log('库加载检查:');
                  console.log('- live2d.min.js 加载状态:', typeof Live2D !== 'undefined' ? '已加载' : '未加载');
                  console.log('- live2dcubismcore.min.js 加载状态:', typeof Live2DCubismCore !== 'undefined' ? '已加载' : '未加载');
                  console.log('- pixi.min.js 加载状态:', typeof PIXI !== 'undefined' ? '已加载' : '未加载');
                  console.log('- pixi-live2d-display.min.js 加载状态:', typeof PIXI !== 'undefined' && PIXI.live2d ? '已加载' : '未加载');
                  
                  // 尝试手动设置全局PIXI变量
                  if (typeof PIXI !== 'undefined' && !window.PIXI) {
                    window.PIXI = PIXI;
                    console.log('已手动设置全局PIXI变量');
                  }
                </script>
              </head>
              <body>
                <canvas id="live2d-canvas"></canvas>
                <script>
                  // 模型路径和配置
                  const modelConfig = {
                    width: ${width},
                    height: ${height},
                    modelPath: "${fullModelPath}"
                  };
                
                  // Live2D模型加载器
                  window.addEventListener('DOMContentLoaded', async () => {
                    try {
                      // 检查WebGL兼容性
                      const canvas = document.getElementById('live2d-canvas');
                      let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                      
                      if (!gl) {
                        throw new Error('WebGL不可用。您的浏览器可能不支持WebGL或WebGL已被禁用。');
                      }
                                          
                      // 检查PIXI是否可用
                      if (!window.PIXI) {
                        throw new Error('PIXI.js未加载。请访问 #/library-help 页面下载所需库文件。');
                      }
                       
                      // 检查PIXI-Live2D-Display是否可用
                      if (!window.PIXI.live2d) {
                        console.log('PIXI.live2d未找到，尝试手动初始化PIXI-Live2D-Display');
                        // 尝试创建全局live2d对象
                        window.PIXI.live2d = {};
                        throw new Error('PIXI-Live2D-Display未加载。请访问 #/library-help 页面下载所需库文件。');
                      }
                      
                      // 设置PIXI最大WebGL上下文设置
                      PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
                      PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES, 16);
                      
                      // 设置canvas尺寸
                      canvas.width = modelConfig.width;
                      canvas.height = modelConfig.height;
          
                      // 通知父窗口模型开始加载
                      window.parent.postMessage({ type: 'live2d-loading', message: '开始加载模型' }, '*');
                      
                      // 创建PIXI应用
                      const app = new PIXI.Application({
                        view: canvas,
                        width: modelConfig.width,
                        height: modelConfig.height,
                        transparent: true,
                        autoStart: true,
                        antialias: true,
                        preserveDrawingBuffer: true,
                        powerPreference: "high-performance"
                      });
                      
                      // 异步加载Live2D模型
                      let model;
                      try {
                        window.parent.postMessage({ type: 'live2d-loading', message: '开始加载PIXI-Live2D模型' }, '*');
                        
                        // 设置PIXI-Live2D-Display环境
                        if (window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel) {
                          // 使用PIXI.live2d.Live2DModel
                          console.log('使用PIXI.live2d.Live2DModel加载模型');
                          window.PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);
                          model = await window.PIXI.live2d.Live2DModel.from(modelConfig.modelPath, { autoInteract: false });
                          
                          // 调整模型尺寸和位置
                          const modelWidth = model.width;
                          const modelHeight = model.height;
                          const scale = Math.min(modelConfig.width / modelWidth, modelConfig.height / modelHeight);
                          
                          model.scale.set(scale, scale);
                          model.position.set(modelConfig.width / 2, modelConfig.height / 2);
                          model.anchor.set(0.5, 0.5);
                          
                          // 添加到舞台
                          app.stage.addChild(model);
                        } else if (window.Live2DModel) {
                          // 兼容旧版API
                          console.log('使用window.Live2DModel加载模型');
                          window.Live2DModel.registerTicker(PIXI.Ticker);
                          model = await window.Live2DModel.from(modelConfig.modelPath, { autoInteract: false });
                        
                          // 调整模型尺寸和位置
                          const modelWidth = model.width;
                          const modelHeight = model.height;
                          const scale = Math.min(modelConfig.width / modelWidth, modelConfig.height / modelHeight);
                          
                          model.scale.set(scale, scale);
                          model.position.set(modelConfig.width / 2, modelConfig.height / 2);
                          model.anchor.set(0.5, 0.5);
                          
                          // 添加到舞台
                          app.stage.addChild(model);
                        } else {
                          throw new Error('PIXI-Live2D-Display未加载');
                        }
                      } catch (modelError) {
                        console.error('加载模型失败:', modelError);
                        window.parent.postMessage({ 
                          type: 'live2d-error', 
                          message: '模型加载失败', 
                          error: modelError.message 
                        }, '*');
                        return;
                      }
      
                      // 辅助函数：安全检查model对象
                      const safeAccessModel = () => {
                        if (!model) {
                          console.error('模型对象不存在');
                          return false;
                        }
                        
                        if (model.internalModel === undefined) {
                          console.error('模型的internalModel不存在');
                          // 延迟重试
                          setTimeout(() => {
                            if (model && model.internalModel) {
                              console.log('延迟后internalModel已加载');
                            }
                          }, 500);
                          return false;
                        }
                        
                        return true;
                      };
                      
                      // 添加自动眨眼功能
                      let eyeBlinkIntervalId;
                      const startRandomEyeBlink = () => {
                        if (!model) return;
                        
                        console.log('启动随机眨眼');
                        // 清除已有的眨眼定时器
                        if (eyeBlinkIntervalId) {
                          clearInterval(eyeBlinkIntervalId);
                        }
                        
                        // 设置新的眨眼定时器
                        eyeBlinkIntervalId = setInterval(() => {
                          try {
                            if (model && model.internalModel) {
                              // 尝试触发眨眼
                              if (typeof model.internalModel.eyeBlink === 'function') {
                                model.internalModel.eyeBlink();
                              }
                            } else {
                              console.log('模型的internalModel不存在');
                            }
                          } catch (err) {
                            // 忽略眨眼错误
                          }
                        }, 3000 + Math.random() * 5000); // 3-8秒随机眨眼
                      };
                      
                      // 添加模型初始化完成检查
                      let modelInitCheckIntervalId;
                      const checkModelInitialization = () => {
                        // 清除已有的检查定时器
                        if (modelInitCheckIntervalId) {
                          clearInterval(modelInitCheckIntervalId);
                        }
                        
                        // 设置检查定时器
                        let checkCount = 0;
                        modelInitCheckIntervalId = setInterval(() => {
                          try {
                            // 尝试检查模型内部结构
                            if (model && model.internalModel) {
                              console.log('模型内部结构初始化完成');
                              clearInterval(modelInitCheckIntervalId);
                              
                              // 启动随机眨眼功能
                              startRandomEyeBlink();
                              
                              // 尝试应用初始表情（如果有）
                              if (typeof model.internalModel.setExpression === 'function') {
                                try {
                                  model.internalModel.setExpression('default');
                                } catch (exprError) {
                                  console.log('应用默认表情失败:', exprError);
                                }
                              }
                            } else {
                              checkCount++;
                              if (checkCount % 10 === 0) {
                                console.log('等待模型内部结构初始化 (' + (checkCount/2) + '秒)...');
                              }
                              
                              // 超过10秒仍未初始化，尝试重新加载
                              if (checkCount > 100) {
                                console.log('模型内部结构初始化超时，停止检查');
                                clearInterval(modelInitCheckIntervalId);
                              }
                            }
                          } catch (err) {
                            console.error('检查模型初始化时出错:', err);
                          }
                        }, 100); // 每100ms检查一次
                      };
                      
                      // 添加接收命令的监听器
                      window.addEventListener('message', (event) => {
                        const data = event.data;
                        if (!data || !data.command || !model) return;
                        
                        try {
                          console.log('iframe接收到命令:', data.command, data);
              
                          // 处理表情命令
                          if (data.command === 'expression' && data.name) {
                            console.log('应用表情:', data.name);
                            if (safeAccessModel() && model.internalModel && model.internalModel.setExpression) {
                              model.internalModel.setExpression(data.name);
                            } else if (model.expression) {
                              model.expression(data.name);
                            }
                          }
                          
                          // 处理动作命令
                          if (data.command === 'motion' && data.group) {
                            console.log('应用动作:', data.group, data.index || 0);
                            if (safeAccessModel() && model.internalModel && model.internalModel.motion) {
                              model.internalModel.motion(data.group, data.index || 0);
                            } else if (model.motion) {
                              model.motion(data.group, data.index || 0);
                            }
                          }
                        } catch (error) {
                          console.error('处理命令时出错:', error);
                        }
                      });

                      // 通知父窗口模型加载成功
                      window.parent.postMessage({ 
                        type: 'live2d-loaded', 
                        message: '模型加载成功',
                        modelPath: modelConfig.modelPath
                      }, '*');
                      
                      // 延迟启动模型初始化检查
                      setTimeout(checkModelInitialization, 500);
                      
                    } catch (error) {
                      console.error('模型加载失败:', error);
                      window.parent.postMessage({ 
                        type: 'live2d-error', 
                        message: '模型加载失败', 
                        error: error.message 
                      }, '*');
                    }
                  });
                </script>
              </body>
              </html>
            `;
          };

          // 设置iframe内容加载事件
          iframe.onload = () => {
            if (isMounted) {
              setLoadingState('iframe已加载');
            }
          };
          
          // 监听来自iframe的消息
          const messageHandler = (event) => {
            if (!isMounted) return;
      
            try {
              const data = event.data;
              
              if (data && data.type) {
                switch (data.type) {
                  case 'live2d-loading':
                    setLoadingState('模型加载中...');
                    break;
                  case 'live2d-loaded':
                    setLoadingState('模型加载成功');
                    if (onModelLoaded) {
                      onModelLoaded({
                        modelPath: data.modelPath,
                        // 提供一些基本方法
                        expression: (name) => {
                          iframe.contentWindow.postMessage({ 
                            command: 'expression', 
                            name 
                          }, '*');
                        },
                        motion: (group, index) => {
                          iframe.contentWindow.postMessage({ 
                            command: 'motion', 
                            group, 
                            index 
                          }, '*');
                        }
                      });
                    }
                    break;
                  case 'live2d-error':
                    setLoadingState('加载失败');
                    setErrorDetails(data.error || '未知错误');
                    break;
                }
              }
            } catch (err) {
              console.error('处理iframe消息失败:', err);
            }
          };
          
          window.addEventListener('message', messageHandler);
        
          // 添加iframe到容器
          if (containerRef.current && isMounted) {
            // 清除容器内容
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(iframe);
        
            // 写入iframe内容
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(createIframeContent());
            iframe.contentWindow.document.close();
          }
          
          // 清理函数
          return () => {
            window.removeEventListener('message', messageHandler);
            if (containerRef.current) {
              containerRef.current.innerHTML = '';
            }
          };
          
        } catch (error) {
          console.error('模型文件检查失败:', error);
          if (isMounted) {
            setLoadingState('加载失败');
            setErrorDetails(`模型文件检查失败: ${error.message}`);
          }
        }
        
      } catch (error) {
        console.error('加载Live2D模型失败:', error);
        if (isMounted) {
          setLoadingState('加载失败');
          setErrorDetails(`错误详情: ${error.message}`);
        }
      }
    };
    
    loadModel();
    
    // 组件卸载时清理
    return () => {
      isMounted = false;
    };
  }, [modelPath, width, height, onModelLoaded]);

  // 检查错误信息是否与缺少库相关
  const isMissingLibraryError = errorDetails && (errorDetails.includes('PIXI.js未加载') || errorDetails.includes('library-help'));

  return (
    <div className="live2d-container" style={{ width, height }}>
      <div ref={containerRef} className="live2d-iframe-container" style={{ width, height }}></div>
      {loadingState !== '模型加载成功' && (
        <div className="live2d-loading-overlay">
          <div className="live2d-loading-text">{loadingState}</div>
          {errorDetails && (
            <div className="live2d-error-details">
              {errorDetails}
              {isMissingLibraryError && (
                <div style={{ marginTop: '15px' }}>
                  <a 
                    href="#/library-help" 
                    style={{ 
                      display: 'inline-block',
                      background: '#4285f4',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    下载缺失的库文件
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Live2DModelComponent; 