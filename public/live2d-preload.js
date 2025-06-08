// 预加载Live2D核心库
(function() {
  console.log('开始预加载Live2D核心库');
  
  // 检查是否已加载
  if (window.Live2DCubismCore) {
    console.log('Live2DCubismCore已加载');
  }
  
  // 检查Cubism 2运行时是否已加载
  if (window.Live2D) {
    console.log('Live2D Cubism 2运行时已加载');
  }
  
  // 加载Cubism 2运行时
  function loadLive2D() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/libs/live2d.min.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        console.log('Live2D Cubism 2运行时预加载成功');
        resolve();
      };
      
      script.onerror = (err) => {
        console.error('Live2D Cubism 2运行时预加载失败', err);
        reject(err);
      };
    });
  }
  
  // 加载核心库
  function loadCubismCore() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/live2d/core/live2dcubismcore.min.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        console.log('Live2DCubismCore预加载成功');
        resolve();
      };
      
      script.onerror = (err) => {
        console.error('Live2DCubismCore预加载失败', err);
        reject(err);
      };
    });
  }
  
  // 在页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        // 先加载Cubism 2运行时
        await loadLive2D();
        // 再加载Cubism 4核心库
        await loadCubismCore();
      } catch (err) {
        console.warn('预加载失败，将在组件中重试', err);
      }
    });
  } else {
    Promise.all([loadLive2D(), loadCubismCore()]).catch(err => {
      console.warn('预加载失败，将在组件中重试', err);
    });
  }
})(); 