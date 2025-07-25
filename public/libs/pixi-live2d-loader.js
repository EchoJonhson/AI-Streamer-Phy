/**
 * PIXI-Live2D 加载器脚本
 * 确保Live2D库正确加载和初始化
 */

(function() {
  // 记录库加载状态
  window.live2dLibraryStatus = {
    PIXI: false,
    Live2DCubismCore: false,
    Live2D: false,
    PIXILive2D: false
  };

  // 检测库是否已加载
  function checkLibraries() {
    // 检查PIXI.js
    window.live2dLibraryStatus.PIXI = !!window.PIXI;
    
    // 检查Live2DCubismCore
    window.live2dLibraryStatus.Live2DCubismCore = !!window.Live2DCubismCore;
    
    // 检查Live2D (Cubism 2)
    window.live2dLibraryStatus.Live2D = !!window.Live2D;
    
    // 检查PIXI-Live2D-Display - 使用validatePIXILive2D函数
    window.live2dLibraryStatus.PIXILive2D = validatePIXILive2D();
    
    console.log('[Live2D Loader] 库加载状态:', window.live2dLibraryStatus);
    
    return window.live2dLibraryStatus.PIXI && 
           window.live2dLibraryStatus.Live2DCubismCore && 
           window.live2dLibraryStatus.Live2D && 
           window.live2dLibraryStatus.PIXILive2D;
  }

  // 验证PIXI-Live2D-Display是否完全初始化
  function validatePIXILive2D() {
    try {
      if (!window.PIXI || !window.PIXI.live2d) {
        return false;
      }
      
      // 检查关键对象和方法是否存在
      if (!window.PIXI.live2d.Live2DModel ||
          typeof window.PIXI.live2d.Live2DModel.from !== 'function' ||
          !window.PIXI.live2d.config) {
        return false;
      }
      
      // 检查模型类是否可以正常创建
      const testModel = window.PIXI.live2d.Live2DModel.prototype;
      if (!testModel) {
        return false;
      }
      
      // 尝试安全地设置配置选项
      try {
        // 设置配置 - 通过复制而不是直接修改，避免引用错误
        const currentConfig = window.PIXI.live2d.config || {};
        window.PIXI.live2d.config = {
          ...currentConfig,
          motionFadingDuration: 500,
          expressionFadingDuration: 500,
          motionSync: true
        };
      } catch (configError) {
        console.warn('[Live2D Loader] 配置设置错误，但继续检查:', configError);
      }
      
      return true;
    } catch (error) {
      console.error('[Live2D Loader] 验证PIXI-Live2D-Display时出错:', error);
      return false;
    }
  }
  
  // 尝试修复初始化问题
  function tryFixInitialization() {
    try {
      console.log('[Live2D Loader] 尝试修复初始化问题');
      
      // 确保PIXI.live2d命名空间存在
      if (!window.PIXI.live2d) {
        window.PIXI.live2d = {};
      }
      
      // 确保配置对象存在
      if (!window.PIXI.live2d.config) {
        window.PIXI.live2d.config = {
          motionFadingDuration: 500,
          expressionFadingDuration: 500,
          motionSync: true
        };
      }
      
      // 如果Live2DModel类不存在，尝试从pixi-live2d-initialize.js加载
      if (!window.PIXI.live2d.Live2DModel && window.document.querySelector('script[src*="pixi-live2d-initialize.js"]')) {
        console.log('[Live2D Loader] 尝试从初始化脚本加载Live2DModel类');
        // 不做任何操作，因为初始化脚本会自动处理
      }
      
      console.log('[Live2D Loader] 修复尝试完成');
    } catch (error) {
      console.error('[Live2D Loader] 修复初始化时出错:', error);
    }
  }

  // 加载PIXI-Live2D-Display库
  function loadPIXILive2DDisplay() {
    return new Promise((resolve, reject) => {
      if (window.PIXI && window.PIXI.live2d && validatePIXILive2D()) {
        console.log('[Live2D Loader] PIXI-Live2D-Display已加载并正确初始化');
        resolve(true);
        return;
      }
      
      console.log('[Live2D Loader] 开始加载PIXI-Live2D-Display库');
      
      // 确保PIXI.js已加载
      if (!window.PIXI) {
        console.error('[Live2D Loader] PIXI.js未加载，无法加载PIXI-Live2D-Display');
        reject(new Error('PIXI.js未加载'));
        return;
      }
      
      // 创建脚本元素
      const script = document.createElement('script');
      script.src = './libs/pixi-live2d-display.min.js';
      script.async = true;
      
      // 设置加载事件
      script.onload = function() {
        console.log('[Live2D Loader] PIXI-Live2D-Display库加载成功');
        
        // 增加延迟时间，确保库正确初始化
        setTimeout(() => {
          if (validatePIXILive2D()) {
            console.log('[Live2D Loader] PIXI-Live2D-Display库初始化成功');
            
            // 配置PIXI.live2d
            if (window.PIXI.live2d.config) {
              window.PIXI.live2d.config.motionFadingDuration = 500;
              window.PIXI.live2d.config.expressionFadingDuration = 500;
              window.PIXI.live2d.config.motionSync = true;
              console.log('[Live2D Loader] PIXI-Live2D-Display配置已设置');
            }
            
            resolve(true);
          } else {
            console.error('[Live2D Loader] PIXI-Live2D-Display库加载成功但初始化失败');
            
            // 尝试手动修复初始化问题
            tryFixInitialization();
            
            // 再次检查
            setTimeout(() => {
              if (validatePIXILive2D()) {
                console.log('[Live2D Loader] PIXI-Live2D-Display库在修复后初始化成功');
                resolve(true);
              } else {
                reject(new Error('PIXI-Live2D-Display初始化失败'));
              }
            }, 500);
          }
        }, 1000); // 增加延迟时间到1秒
      };
      
      // 设置错误事件
      script.onerror = function() {
        console.error('[Live2D Loader] PIXI-Live2D-Display库加载失败');
        reject(new Error('PIXI-Live2D-Display加载失败'));
      };
      
      // 添加到文档
      document.head.appendChild(script);
    });
  }

  // 尝试从CDN加载PIXI-Live2D-Display
  function loadPIXILive2DDisplayFromCDN() {
    return new Promise((resolve, reject) => {
      console.log('[Live2D Loader] 尝试从CDN加载PIXI-Live2D-Display库');
      
      // 尝试多个CDN源
      const cdnUrls = [
        'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js',
        'https://unpkg.com/pixi-live2d-display@0.4.0/dist/index.min.js'
      ];
      
      // 创建脚本元素
      const script = document.createElement('script');
      script.src = cdnUrls[0]; // 首先尝试jsdelivr
      script.async = true;
      
      // 设置加载事件
      script.onload = function() {
        console.log('[Live2D Loader] CDN PIXI-Live2D-Display库加载成功');
        
        // 延迟检查，确保库正确初始化
        setTimeout(() => {
          if (validatePIXILive2D()) {
            console.log('[Live2D Loader] CDN PIXI-Live2D-Display库初始化成功');
            
            // 配置PIXI.live2d
            if (window.PIXI.live2d.config) {
              window.PIXI.live2d.config.motionFadingDuration = 500;
              window.PIXI.live2d.config.expressionFadingDuration = 500;
              window.PIXI.live2d.config.motionSync = true;
              console.log('[Live2D Loader] CDN PIXI-Live2D-Display配置已设置');
            }
            
            resolve(true);
          } else {
            console.error('[Live2D Loader] CDN PIXI-Live2D-Display库加载成功但初始化失败');
            
            // 尝试修复初始化问题
            tryFixInitialization();
            
            // 再次检查
            setTimeout(() => {
              if (validatePIXILive2D()) {
                console.log('[Live2D Loader] CDN PIXI-Live2D-Display库在修复后初始化成功');
                resolve(true);
                return;
              }
            
              // 如果第一个CDN失败，尝试第二个
              if (script.src === cdnUrls[0] && cdnUrls.length > 1) {
                console.log('[Live2D Loader] 尝试备用CDN源');
                const backupScript = document.createElement('script');
                backupScript.src = cdnUrls[1];
                backupScript.async = true;
                
                backupScript.onload = function() {
                  setTimeout(() => {
                    if (validatePIXILive2D()) {
                      console.log('[Live2D Loader] 备用CDN PIXI-Live2D-Display库初始化成功');
                      resolve(true);
                    } else {
                      reject(new Error('CDN PIXI-Live2D-Display初始化失败'));
                    }
                  }, 500);
                };
                
                backupScript.onerror = function() {
                  reject(new Error('备用CDN PIXI-Live2D-Display加载失败'));
                };
                
                document.head.appendChild(backupScript);
              } else {
                reject(new Error('CDN PIXI-Live2D-Display初始化失败'));
              }
            }, 500);
          }
        }, 500); // 增加延迟时间
      };
      
      // 设置错误事件
      script.onerror = function() {
        console.error('[Live2D Loader] CDN PIXI-Live2D-Display库加载失败');
        
        // 尝试备用CDN
        if (cdnUrls.length > 1) {
          console.log('[Live2D Loader] 尝试备用CDN源');
          const backupScript = document.createElement('script');
          backupScript.src = cdnUrls[1];
          backupScript.async = true;
          
          backupScript.onload = function() {
            setTimeout(() => {
              if (validatePIXILive2D()) {
                console.log('[Live2D Loader] 备用CDN PIXI-Live2D-Display库初始化成功');
                resolve(true);
              } else {
                reject(new Error('备用CDN PIXI-Live2D-Display初始化失败'));
              }
            }, 500);
          };
          
          backupScript.onerror = function() {
            reject(new Error('备用CDN PIXI-Live2D-Display加载失败'));
          };
          
          document.head.appendChild(backupScript);
        } else {
          reject(new Error('CDN PIXI-Live2D-Display加载失败'));
        }
      };
      
      // 添加到文档
      document.head.appendChild(script);
    });
  }

  // 初始化Live2D库
  function initLive2D() {
    console.log('[Live2D Loader] 开始初始化Live2D');
    
    // 先检查库是否已加载
    if (checkLibraries()) {
      console.log('[Live2D Loader] 所有Live2D库已加载');
      return Promise.resolve(true);
    }
    
    // 加载PIXI-Live2D-Display库
    return loadPIXILive2DDisplay()
      .catch(error => {
        console.error('[Live2D Loader] 本地库加载失败，尝试从CDN加载:', error);
        return loadPIXILive2DDisplayFromCDN();
      })
      .then(() => {
        // 再次检查所有库是否已加载
        return checkLibraries();
      })
      .catch(error => {
        console.error('[Live2D Loader] 初始化失败:', error);
        return false;
      });
  }

  // 当文档加载完成后执行初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLive2D);
  } else {
    // 如果DOMContentLoaded已经触发，立即初始化
    initLive2D();
  }

  // 暴露接口
  window.Live2DLoader = {
    checkLibraries,
    loadPIXILive2DDisplay,
    loadPIXILive2DDisplayFromCDN,
    initLive2D,
    validatePIXILive2D,
    tryFixInitialization
  };
})(); 