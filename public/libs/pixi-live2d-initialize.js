/**
 * PIXI-Live2D 初始化脚本
 * 确保Live2D库正确加载和初始化
 */

// 检查环境
(function() {
  // 检查PIXI是否已加载
  if (!window.PIXI) {
    console.error('PIXI.js未加载，请确保先加载PIXI.js库');
    return;
  }

  // 检查Cubism核心库是否已加载
  if (!window.Live2DCubismCore) {
    console.error('Live2DCubismCore未加载，请确保先加载Live2D核心库');
    return;
  }

  // 检查pixi-live2d-display是否已正确加载
  if (!window.PIXI.live2d) {
    console.error('PIXI.live2d未加载，请确保已加载pixi-live2d-display.min.js');
    return;
  }

  console.log('PIXI-Live2D 初始化检查完成');
  
  // 设置模型渲染选项
  if (window.PIXI.live2d.config) {
    // 设置动作淡入时间
    window.PIXI.live2d.config.motionFadingDuration = 500;
    
    // 设置表情淡入时间
    window.PIXI.live2d.config.expressionFadingDuration = 500;
    
    // 启用动作同步
    window.PIXI.live2d.config.motionSync = true;
    
    console.log('PIXI-Live2D 配置已初始化');
  }
})(); 