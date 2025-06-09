/**
 * PIXI-Live2D-Display初始化脚本
 * 确保PIXI-Live2D-Display库正确初始化
 */

(function() {
  // 检查库是否已经初始化
  if (window.PIXI && window.PIXI.live2d && 
      window.PIXI.live2d.Live2DModel && 
      typeof window.PIXI.live2d.Live2DModel.from === 'function') {
    console.log('PIXI-Live2D-Display已初始化');
    return;
  }
  
  // 等待PIXI.js加载完成
  function waitForPIXI(callback) {
    if (window.PIXI) {
      callback();
    } else {
      setTimeout(function() {
        waitForPIXI(callback);
      }, 100);
    }
  }
  
  // 手动初始化PIXI-Live2D-Display
  function initializePIXILive2D() {
    try {
      // 确保PIXI.js已加载
      if (!window.PIXI) {
        console.error('PIXI-Live2D初始化失败: PIXI.js未加载');
        return;
      }
      
      // 确保Live2DCubismCore已加载
      if (!window.Live2DCubismCore) {
        console.error('PIXI-Live2D初始化失败: Live2DCubismCore未加载');
        return;
      }
      
      // 确保Live2D已加载
      if (!window.Live2D) {
        console.error('PIXI-Live2D初始化失败: Live2D未加载');
        return;
      }
      
      // 手动定义PIXI.live2d命名空间（如果不存在）
      if (!window.PIXI.live2d) {
        window.PIXI.live2d = {};
      }
      
      // 设置配置
      if (!window.PIXI.live2d.config) {
        window.PIXI.live2d.config = {
          LOG_LEVEL_VERBOSE: 0,
          LOG_LEVEL_WARNING: 1,
          LOG_LEVEL_ERROR: 2,
          LOG_LEVEL_NONE: 999,
          logLevel: 1, // 默认警告级别
          sound: true,
          motionSync: true,
          motionFadingDuration: 500,
          idleMotionFadingDuration: 2000,
          expressionFadingDuration: 500,
          preserveExpressionOnMotion: true
        };
      }
      
      console.log('PIXI-Live2D-Display基础配置已设置');
      
      // 尝试修复Live2DModel注册
      if (typeof window.PIXI.live2d.Live2DModel === 'undefined' && window.PIXI.live2d.Live2DModel === undefined) {
        console.warn('尝试手动注册Live2DModel类');
        
        // 简单的模型类实现
        window.PIXI.live2d.Live2DModel = class Live2DModel extends PIXI.Container {
          constructor() {
            super();
            this.anchor = new PIXI.Point(0.5, 0.5);
            this.textures = [];
            this.modelConfig = null;
          }
          
          static from(source) {
            console.warn('使用简易版Live2DModel.from方法');
            return new Promise((resolve, reject) => {
              try {
                const model = new window.PIXI.live2d.Live2DModel();
                
                // 如果source是字符串（URL），尝试加载模型配置
                if (typeof source === 'string') {
                  fetch(source)
                    .then(response => response.json())
                    .then(config => {
                      model.modelConfig = config;
                      console.log('模型配置加载成功:', config);
                      resolve(model);
                    })
                    .catch(error => {
                      console.error('模型加载失败:', error);
                      reject(error);
                    });
                } else {
                  model.modelConfig = source;
                  resolve(model);
                }
              } catch (error) {
                console.error('创建模型时出错:', error);
                reject(error);
              }
            });
          }
          
          // 基本方法
          motion(group, index) {
            console.log(`播放动作: ${group}, ${index}`);
            return Promise.resolve();
          }
          
          expression(id) {
            console.log(`设置表情: ${id}`);
            return Promise.resolve();
          }
          
          destroy() {
            super.destroy();
          }
        };
      }
      
      // 输出当前状态
      console.log('PIXI-Live2D初始化状态:', {
        'PIXI': !!window.PIXI,
        'PIXI.live2d': !!window.PIXI.live2d,
        'PIXI.live2d.Live2DModel': !!(window.PIXI.live2d && window.PIXI.live2d.Live2DModel),
        'PIXI.live2d.Live2DModel.from': !!(window.PIXI.live2d && window.PIXI.live2d.Live2DModel && typeof window.PIXI.live2d.Live2DModel.from === 'function')
      });
      
      // 尝试全局修复一些已知问题
      try {
        // 注入必要的函数，如果库中这些函数不存在
        if (!window.PIXI.live2d.utils) {
          window.PIXI.live2d.utils = {
            logger: {
              log: console.log,
              warn: console.warn,
              error: console.error
            },
            clamp: function(value, min, max) {
              return Math.min(Math.max(value, min), max);
            }
          };
        }
        
        // 模拟插件注册系统
        if (!window.PIXI.live2d.Live2DModel.registerTicker) {
          window.PIXI.live2d.Live2DModel.registerTicker = function(ticker) {
            console.log('注册ticker:', ticker);
          };
        }
        
        // 设置默认ticker
        if (window.PIXI.Ticker) {
          window.PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker.shared);
        }
        
        console.log('PIXI-Live2D-Display扩展功能已注册');
      } catch (error) {
        console.error('注册扩展功能时出错:', error);
      }
    } catch (error) {
      console.error('PIXI-Live2D初始化过程中出错:', error);
    }
  }
  
  // 当文档加载完成后执行初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      waitForPIXI(initializePIXILive2D);
    });
  } else {
    // 如果DOMContentLoaded已经触发，立即初始化
    waitForPIXI(initializePIXILive2D);
  }
})(); 