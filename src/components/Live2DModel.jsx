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
            </head>
            <body>
              <canvas id="live2d-canvas"></canvas>
              <script>
                // 简单的Live2D模型加载器
                window.addEventListener('DOMContentLoaded', async () => {
                  try {
                    const canvas = document.getElementById('live2d-canvas');
                    canvas.width = ${width};
                    canvas.height = ${height};
                    
                    // 通知父窗口模型开始加载
                    window.parent.postMessage({ type: 'live2d-loading', message: '开始加载模型' }, '*');
                    
                    // 加载模型（使用第三方库或自定义代码）
                    // 这里只是一个占位符，实际实现取决于您使用的Live2D库
                    const modelPath = '${fullModelPath}';
                    
                    // 通知父窗口模型加载成功
                    window.parent.postMessage({ 
                      type: 'live2d-loaded', 
                      message: '模型加载成功',
                      modelPath: modelPath
                    }, '*');
                    
                    // 简单的动画循环
                    function animate() {
                      // 在这里添加模型更新代码
                      requestAnimationFrame(animate);
                    }
                    animate();
                    
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