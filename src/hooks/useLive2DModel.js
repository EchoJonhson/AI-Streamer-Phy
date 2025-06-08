import { useState, useEffect, useCallback } from 'react';

/**
 * Live2D模型钩子
 * 用于加载和控制Live2D模型
 */
export const useLive2DModel = (modelPath, options = {}) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positionFixed, setPositionFixed] = useState(false);
  
  // 检查必要的库是否已加载
  const checkDependencies = useCallback(() => {
    if (!window.PIXI) {
      console.error('PIXI.js未加载');
      return '缺少PIXI.js库';
    }
    
    if (!window.Live2DCubismCore) {
      console.error('Live2DCubismCore未加载');
      return '缺少Live2DCubismCore库';
    }
    
    if (!window.PIXI.live2d) {
      console.error('PIXI-Live2D-Display未加载');
      return '缺少PIXI-Live2D-Display库';
    }
    
    return null;
  }, []);

  // 加载模型
  const loadModel = useCallback(async (path) => {
    setLoading(true);
    setError(null);
    
    // 检查依赖
    const dependencyError = checkDependencies();
    if (dependencyError) {
      setError(dependencyError);
      setLoading(false);
      return;
    }
    
    try {
      // 安全调用from方法
      if (!window.PIXI.live2d.Live2DModel.from) {
        throw new Error('PIXI.live2d.Live2DModel.from方法不存在');
      }
      
      // 使用安全的方式调用from方法
      const modelObj = await window.PIXI.live2d.Live2DModel.from(path);
      
      // 检查模型是否加载成功
      if (!modelObj) {
        throw new Error('模型加载失败：返回了空模型');
      }
      
      setModel(modelObj);
      setLoading(false);
    } catch (err) {
      console.error('加载Live2D模型失败:', err);
      setError(err.message || '加载模型失败');
      setLoading(false);
    }
  }, [checkDependencies]);

  // 修复模型位置
  const fixModelPosition = useCallback(() => {
    if (!model || positionFixed) return;
    
    try {
      // 调整模型位置和尺寸
      const width = options.width || 300;
      const height = options.height || 500;
      
      // 计算合适的缩放比例
      const scale = Math.min(width / model.width, height / model.height) * 0.9;
      
      // 设置模型位置
      model.scale.set(scale, scale);
      model.position.set(width / 2, height * 0.7); // 将模型放在较低的位置
      model.anchor.set(0.5, 0.5);
      
      // 启用鼠标跟踪
      if (model.internalModel) {
        model.internalModel.followPointer = true;
      }
      
      setPositionFixed(true);
      console.log('模型位置已修复');
    } catch (error) {
      console.error('修复模型位置失败:', error);
    }
  }, [model, positionFixed, options.width, options.height]);

  // 尝试应用表情
  const applyExpression = useCallback((name) => {
    if (!model) return false;
    
    try {
      if (model.internalModel && model.internalModel.setExpression) {
        model.internalModel.setExpression(name);
        return true;
      }
      return false;
    } catch (error) {
      console.error('应用表情失败:', error);
      return false;
    }
  }, [model]);

  // 尝试应用动作
  const applyMotion = useCallback((group, index = 0) => {
    if (!model) return false;
    
    try {
      if (model.internalModel && model.internalModel.motion) {
        model.internalModel.motion(group, index);
        return true;
      }
      return false;
    } catch (error) {
      console.error('应用动作失败:', error);
      return false;
    }
  }, [model]);

  // 检查模型是否准备好
  const checkModelReady = useCallback(() => {
    if (!model) return;
    
    const checkInterval = setInterval(() => {
      if (model.internalModel) {
        clearInterval(checkInterval);
        fixModelPosition();
      }
    }, 100);
    
    // 10秒后清除定时器，防止无限检查
    setTimeout(() => clearInterval(checkInterval), 10000);
  }, [model, fixModelPosition]);

  // 重新尝试加载库
  const reloadDependencies = useCallback(() => {
    if (window.PIXI && window.Live2DCubismCore && window.PIXI.live2d) {
      return true; // 所有依赖都已加载
    }
    
    console.log('尝试重新加载缺失的库...');
    
    // 重新加载PIXI.js
    if (!window.PIXI) {
      const pixiScript = document.createElement('script');
      pixiScript.src = 'https://cdn.jsdelivr.net/npm/pixi.js@5.3.3/dist/pixi.min.js';
      document.head.appendChild(pixiScript);
    }
    
    // 重新加载Live2DCubismCore
    if (!window.Live2DCubismCore) {
      const coreScript = document.createElement('script');
      coreScript.src = './live2d/core/live2dcubismcore.min.js';
      document.head.appendChild(coreScript);
    }
    
    // 重新加载PIXI-Live2D-Display
    if (window.PIXI && !window.PIXI.live2d) {
      const displayScript = document.createElement('script');
      displayScript.src = 'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js';
      document.head.appendChild(displayScript);
    }
    
    return false; // 仍有依赖未加载
  }, []);

  // 监听模型变化
  useEffect(() => {
    if (model) {
      checkModelReady();
    }
  }, [model, checkModelReady]);

  // 监听模型路径变化，重试加载
  useEffect(() => {
    if (!modelPath) return;
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryLoadModel = () => {
      // 如果有依赖错误但重试次数未超过最大值，尝试重新加载依赖
      if (checkDependencies() && retryCount < maxRetries) {
        retryCount++;
        
        // 重新加载依赖并延迟重试
        if (reloadDependencies()) {
          setTimeout(() => {
            console.log(`第${retryCount}次尝试加载模型`);
            loadModel(modelPath);
          }, 1000); // 等待依赖加载完成
        } else {
          // 依赖仍未加载，延迟重试
          setTimeout(tryLoadModel, 1000);
        }
      } else if (retryCount < maxRetries) {
        // 没有依赖错误或重试次数已达最大值，直接加载模型
        loadModel(modelPath);
        setPositionFixed(false);
      } else {
        // 重试次数已达最大值，设置错误
        setError(`模型加载失败，已重试${maxRetries}次`);
        setLoading(false);
      }
    };
    
    tryLoadModel();
  }, [modelPath, loadModel, checkDependencies, reloadDependencies]);

  return {
    model,
    loading,
    error,
    applyExpression,
    applyMotion,
    fixModelPosition
  };
};

export default useLive2DModel; 