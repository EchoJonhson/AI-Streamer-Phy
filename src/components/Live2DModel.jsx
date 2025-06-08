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
      
          // 创建一个简单的HTML页面来加载Live2D模型
          const iframeContent = `
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
            </head>
            <body>
              <canvas id="live2d-canvas"></canvas>
              <script>
                // 简单的Live2D模型加载器
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
                      throw new Error('PIXI.js未加载。请确保PIXI库已正确加载。');
                    }
                    
                    // 设置PIXI最大WebGL上下文设置
                    // 解决"Invalid value of '0' passed to 'checkMaxIfStatementsInShader'"错误
                    PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
                    PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES, 16);
                    
                    // 设置canvas尺寸
                    canvas.width = ${width};
                    canvas.height = ${height};
        
                    // 通知父窗口模型开始加载
                    window.parent.postMessage({ type: 'live2d-loading', message: '开始加载模型' }, '*');
                    
                    // 创建PIXI应用
                    const modelPath = '${fullModelPath}';
                    
                    // 创建PIXI应用
                    const app = new PIXI.Application({
                      view: canvas,
                      width: ${width},
                      height: ${height},
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
                      if (window.Live2DModel) {
                        // 等待模型加载
                        window.Live2DModel.registerTicker(PIXI.Ticker);
                        model = await window.Live2DModel.from(modelPath, { autoInteract: false });
                        
                        // 调整模型尺寸和位置
                        const modelWidth = model.width;
                        const modelHeight = model.height;
                        const scale = Math.min(${width} / modelWidth, ${height} / modelHeight);
                        
                        model.scale.set(scale, scale);
                        model.position.set(${width} / 2, ${height} / 2);
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
    
                    // 添加接收命令的监听器
                    window.addEventListener('message', (event) => {
                      const data = event.data;
                      if (!data || !data.command || !model) return;
                      
                      try {
                        console.log('iframe接收到命令:', data.command, data);
            
                        // 处理表情命令
                        if (data.command === 'expression' && data.name) {
                          console.log('应用表情:', data.name);
                          if (model.internalModel && model.internalModel.setExpression) {
                            model.internalModel.setExpression(data.name);
                          } else if (model.expression) {
                            model.expression(data.name);
                          }
                        }
                        
                        // 处理动作命令
                        if (data.command === 'motion' && data.group) {
                          console.log('应用动作:', data.group, data.index || 0);
                          if (model.internalModel && model.internalModel.motion) {
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
                      modelPath: modelPath
                    }, '*');
                    
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
            iframe.contentWindow.document.write(iframeContent);
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

  return (
    <div className="live2d-container" style={{ width, height }}>
      <div ref={containerRef} className="live2d-iframe-container" style={{ width, height }}></div>
      {loadingState !== '模型加载成功' && (
        <div className="live2d-loading-overlay">
          <div className="live2d-loading-text">{loadingState}</div>
          {errorDetails && (
            <div className="live2d-error-details">
              {errorDetails}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Live2DModelComponent; 