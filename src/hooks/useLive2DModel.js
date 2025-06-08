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

  // 加载模型
  const loadModel = useCallback(async (path) => {
    setLoading(true);
    setError(null);
    try {
      const modelObj = await window.Live2DModel.from(path);
      setModel(modelObj);
      setLoading(false);
    } catch (err) {
      console.error('加载Live2D模型失败:', err);
      setError(err.message || '加载模型失败');
      setLoading(false);
    }
  }, []);

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

  // 监听模型变化
  useEffect(() => {
    if (model) {
      checkModelReady();
    }
  }, [model, checkModelReady]);

  // 监听模型路径变化
  useEffect(() => {
    if (modelPath) {
      loadModel(modelPath);
      setPositionFixed(false);
    }
  }, [modelPath, loadModel]);

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