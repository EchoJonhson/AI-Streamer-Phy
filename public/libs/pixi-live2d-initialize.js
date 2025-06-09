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
      
      // 尝试从pixi-live2d-display.min.js中获取Live2DModel
      if (typeof window.PIXI.live2d.Live2DModel === 'undefined') {
        console.warn('无法找到PIXI.live2d.Live2DModel，库可能未正确加载');
      }
      
      // 输出当前状态
      console.log('PIXI-Live2D初始化状态:', {
        'PIXI': !!window.PIXI,
        'PIXI.live2d': !!window.PIXI.live2d,
        'PIXI.live2d.Live2DModel': !!(window.PIXI.live2d && window.PIXI.live2d.Live2DModel),
        'PIXI.live2d.Live2DModel.from': !!(window.PIXI.live2d && window.PIXI.live2d.Live2DModel && typeof window.PIXI.live2d.Live2DModel.from === 'function')
      });
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