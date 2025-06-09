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
  
  // 使用内置的简易模型加载器
  const useSimpleModelLoader = useCallback(async (path) => {
    console.log('使用简易模型加载器:', path);
    
    try {
      // 尝试加载模型
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`模型文件加载失败: ${response.status} ${response.statusText}`);
      }
      
      const modelJson = await response.json();
      console.log('模型配置加载成功:', modelJson);
      
      // 创建PIXI应用和容器
      if (!window.PIXI) {
        throw new Error('PIXI.js未加载');
      }
      
      // 创建简易模型对象
      const model = new window.PIXI.Container();
      model.width = options.width || 300;
      model.height = options.height || 500;
      
      // 添加临时精灵作为占位符
      const graphics = new window.PIXI.Graphics();
      graphics.beginFill(0xFFFFFF, 0.2);
      graphics.drawRoundedRect(0, 0, options.width || 300, options.height || 500, 20);
      graphics.endFill();
      model.addChild(graphics);
      
      // 添加文本
      const text = new window.PIXI.Text('简易模型已加载', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xFFFFFF,
        align: 'center'
      });
      text.anchor.set(0.5);
      text.position.set((options.width || 300) / 2, (options.height || 500) / 2);
      model.addChild(text);
      
      // 模拟internalModel
      model.internalModel = {
        motions: {},
        expressions: {},
        followPointer: true,
        
        // 模拟动作方法
        startRandomMotion: function(group, priority) {
          console.log('模拟动作:', group, priority);
          return Promise.resolve();
        },
        
        // 模拟表情方法
        setExpression: function(name) {
          console.log('模拟表情:', name);
          return Promise.resolve();
        },
        
        // 模拟眨眼方法
        startRandomEyeBlink: function() {
          console.log('模拟眨眼');
        },
        
        // 模拟动作方法
        motion: function(group, index) {
          console.log('模拟动作:', group, index);
          return Promise.resolve();
        }
      };
      
      return model;
    } catch (error) {
      console.error('简易模型加载失败:', error);
      throw error;
    }
  }, [options.width, options.height]);
  
  // 检查必要的库是否已加载
  const checkDependencies = useCallback(() => {
    if (!window.PIXI) {
      console.error('PIXI.js未加载');
      return '缺少PIXI.js库';
    }
    
    // 检查Live2D相关库，但返回null表示可以继续
    // 我们会使用备用的简易模型加载器
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
      // 首先尝试使用PIXI.live2d.Live2DModel.from加载
      if (window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel && 
          typeof window.PIXI.live2d.Live2DModel.from === 'function') {
        try {
          console.log('尝试使用PIXI.live2d.Live2DModel.from加载模型');
          const modelObj = await window.PIXI.live2d.Live2DModel.from(path);
          if (modelObj) {
            setModel(modelObj);
            setLoading(false);
            return;
          }
        } catch (pixi_error) {
          console.warn('PIXI.live2d.Live2DModel.from加载失败:', pixi_error);
          // 继续使用简易模型加载器
        }
      }
      
      // 使用简易模型加载器
      console.log('尝试使用简易模型加载器');
      const simpleModel = await useSimpleModelLoader(path);
      setModel(simpleModel);
      setLoading(false);
    } catch (err) {
      console.error('加载Live2D模型失败:', err);
      setError(err.message || '加载模型失败');
      setLoading(false);
    }
  }, [checkDependencies, useSimpleModelLoader]);

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
    if (!modelPath) return;
    
    loadModel(modelPath);
    setPositionFixed(false);
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