/**
 * Live2D核心库预加载脚本
 * 用于确保Live2D相关库按正确顺序加载
 */

console.log('开始预加载Live2D核心库');

// 定义全局变量以跟踪加载状态
window.LIVE2D_LOADED = window.LIVE2D_LOADED || {
  cubism4: false,
  cubism2: false,
  pixi: false,
  pixiLive2d: false
};

// 加载Cubism 4运行时
function loadCubism4() {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.Live2DCubismCore) {
      window.LIVE2D_LOADED.cubism4 = true;
      console.log('Live2DCubismCore已加载');
      resolve();
      return;
    }
    
    // 创建脚本元素
    const script = document.createElement('script');
    script.src = '/live2d/core/live2dcubismcore.min.js';
    script.onload = () => {
      window.LIVE2D_LOADED.cubism4 = true;
      console.log('Live2DCubismCore已加载');
      resolve();
    };
    script.onerror = (err) => {
      console.error('加载Live2DCubismCore失败:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });
}

// 加载Cubism 2运行时
function loadCubism2() {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
    if (window.Live2D) {
      window.LIVE2D_LOADED.cubism2 = true;
      console.log('Live2D Cubism 2运行时已加载');
      resolve();
      return;
    }
    
    // 创建脚本元素
    const script = document.createElement('script');
    script.src = '/live2d/core/live2d.min.js';
    script.onload = () => {
      window.LIVE2D_LOADED.cubism2 = true;
      console.log('Live2D Cubism 2运行时已加载');
      resolve();
    };
    script.onerror = (err) => {
      console.error('加载Live2D Cubism 2运行时失败:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });
}

// 加载本地PIXI Live2D Display库
function loadLocalPixiLive2D() {
  return new Promise((resolve, reject) => {
    if (window.PIXI && window.PIXI.live2d) {
      window.LIVE2D_LOADED.pixiLive2d = true;
      console.log('PIXI-Live2D-Display已加载');
      resolve();
      return;
    }
    
    // 创建脚本元素
    const script = document.createElement('script');
    script.src = '/live2d/core/index-live2d.js';
    script.onload = () => {
      if (window.PIXI && window.PIXI.live2d) {
        window.LIVE2D_LOADED.pixiLive2d = true;
        console.log('本地PIXI-Live2D-Display库已加载');
        resolve();
      } else {
        console.error('本地PIXI-Live2D-Display库加载失败');
        reject(new Error('本地PIXI-Live2D-Display库加载失败'));
      }
    };
    script.onerror = (err) => {
      console.error('加载本地PIXI-Live2D-Display库失败:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });
}

// 检查并更新库加载状态
function checkLoadStatus() {
  window.LIVE2D_LOADED.pixi = !!window.PIXI;
  window.LIVE2D_LOADED.cubism4 = !!window.Live2DCubismCore;
  window.LIVE2D_LOADED.cubism2 = !!window.Live2D;
  window.LIVE2D_LOADED.pixiLive2d = window.PIXI && !!window.PIXI.live2d;
  
  console.log('Cubism 4运行时状态:', window.LIVE2D_LOADED.cubism4 ? '已加载' : '未加载');
  console.log('Cubism 2运行时状态:', window.LIVE2D_LOADED.cubism2 ? '已加载' : '未加载');
  console.log('PIXI.js状态:', window.LIVE2D_LOADED.pixi ? '已加载' : '未加载');
  console.log('PIXI-Live2D-Display状态:', window.LIVE2D_LOADED.pixiLive2d ? '已加载' : '未加载');
}

// 按顺序加载库
async function preloadLibraries() {
  try {
    // 首先加载Cubism核心库
    await Promise.all([
      loadCubism4(),
      loadCubism2()
    ]);
    
    console.log('Live2D Cubism运行时预加载成功');
    
    // 检查PIXI是否已加载
    if (!window.PIXI) {
      console.warn('PIXI.js未加载，Live2D模型可能无法正常显示');
    } else {
      window.LIVE2D_LOADED.pixi = true;
      
      // 尝试加载本地PIXI Live2D Display库
      try {
        await loadLocalPixiLive2D();
        console.log('Live2DCubismCore预加载成功');
      } catch (error) {
        console.warn('本地PIXI-Live2D-Display库加载失败，将使用简易模型');
      }
    }
    
    // 更新最终状态
    checkLoadStatus();
  } catch (error) {
    console.error('预加载Live2D库失败:', error);
  }
}

// 执行预加载
preloadLibraries(); 