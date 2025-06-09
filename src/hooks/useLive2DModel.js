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
  
  // 使用内置的简易模型加载器 - 仅在标准加载器失败时使用
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
        throw new Error('PIXI.js未加载，请确保先加载PIXI.js库');
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
      const text = new window.PIXI.Text('模型加载中...', {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xFFFFFF,
        align: 'center'
      });
      text.anchor.set(0.5);
      text.position.set((options.width || 300) / 2, (options.height || 500) / 2);
      model.addChild(text);
      
      // 添加自定义锚点属性
      model.anchor = { x: 0.5, y: 0.5 };
      
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
      
      // 设置初始位置
      model.position.x = (options.width || 300) / 2;
      model.position.y = (options.height || 500) / 2;
      
      return model;
    } catch (error) {
      console.error('简易模型加载失败:', error);
      throw error;
    }
  }, [options.width, options.height]);
  
  // 检查必要的库是否已加载
  const checkDependencies = useCallback(() => {
    // 检查PIXI.js
    if (!window.PIXI) {
      console.error('PIXI.js未加载，请确保先加载PIXI.js库');
      return 'PIXI.js未加载，请确保先加载PIXI.js库';
    }
    
    // 检查pixi-live2d-display
    if (!window.PIXI.live2d) {
      console.error('PIXI-Live2D-Display未加载，请确保先加载pixi-live2d-display.min.js');
      return 'PIXI-Live2D-Display未加载，请访问 #/library-help 页面获取帮助';
    }
    
    // 检查Live2DCubismCore
    if (!window.Live2DCubismCore) {
      console.error('Live2DCubismCore未加载，请确保先加载live2dcubismcore.min.js');
      return 'Live2DCubismCore未加载，请访问 #/library-help 页面获取帮助';
    }
    
    // 一切正常
    return null;
  }, []);
  
  // 尝试检查模型文件是否存在
  const checkModelFile = useCallback(async (path) => {
    try {
      console.log('尝试检查模型:', path);
      const response = await fetch(path);
      if (!response.ok) {
        console.error('模型文件不存在:', path);
        return false;
      }
      console.log('模型文件存在:', path);
      return true;
    } catch (error) {
      console.error('检查模型文件时出错:', error);
      return false;
    }
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
    
    // 检查模型文件是否存在
    const modelExists = await checkModelFile(path);
    if (!modelExists) {
      setError(`模型文件不存在: ${path}`);
      setLoading(false);
      return;
    }
    
    try {
      // 使用标准的PIXI.live2d.Live2DModel.from加载
      if (window.PIXI && window.PIXI.live2d && 
          typeof window.PIXI.live2d.Live2DModel.from === 'function') {
        try {
          console.log('使用PIXI.live2d.Live2DModel.from加载模型');
          
          // 设置加载选项
          const loadOptions = {
            autoInteract: true,
            motionPreload: 'IDLE',
            expressionPreload: true,
            ...options.loadOptions
          };
          
          // 加载模型
          const modelObj = await window.PIXI.live2d.Live2DModel.from(path, loadOptions);
          
          if (modelObj) {
            // 设置模型尺寸和位置
            modelObj.scale.set(
              (options.scale !== undefined) ? options.scale : 0.25
            );
            
            // 设置模型位置
            modelObj.position.set(
              (options.width || 300) / 2,
              (options.height || 500) / 2
            );
            
            // 如果模型加载成功，使用标准模型
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
  }, [checkDependencies, useSimpleModelLoader, checkModelFile, options]);

  // 修复模型位置
  const fixModelPosition = useCallback(() => {
    if (!model || positionFixed) return;
    
    try {
      console.log('尝试修复模型位置');
      
      // 调整模型位置和尺寸
      const width = options.width || 300;
      const height = options.height || 500;
      
      // 设置模型位置
      if (model.position) {
        model.position.x = width / 2;
        model.position.y = height * 0.7; // 将模型放在较低的位置
      }
      
      // 设置模型缩放
      if (model.scale) {
        const scale = options.scale !== undefined ? options.scale : 0.25;
        model.scale.x = scale;
        model.scale.y = scale;
      }
      
      // 安全地设置锚点 - 避免使用set方法，直接设置属性
      if (model.anchor) {
        // 检查anchor是否有set方法，如果有，则安全地调用
        if (typeof model.anchor.set === 'function') {
          try {
            model.anchor.set(0.5, 0.5);
          } catch (err) {
            console.warn('设置anchor.set失败，尝试直接设置属性:', err);
            model.anchor.x = 0.5;
            model.anchor.y = 0.5;
          }
        } else {
          // 如果没有set方法，直接设置属性
          model.anchor.x = 0.5;
          model.anchor.y = 0.5;
        }
      } else if (typeof model.anchor === 'undefined') {
        // 如果anchor不存在，创建一个新的对象
        model.anchor = { x: 0.5, y: 0.5 };
      }
      
      // 启用鼠标跟踪
      if (model.internalModel) {
        model.internalModel.followPointer = true;
      }
      
      setPositionFixed(true);
      console.log('模型位置已修复');
    } catch (error) {
      console.error('修复模型位置失败:', error);
      // 即使失败，也标记为已修复，避免重复尝试
      setPositionFixed(true);
    }
  }, [model, positionFixed, options.width, options.height, options.scale]);

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
    
    // 修复模型位置
    fixModelPosition();
    
    // 读取模型配置
    try {
      console.log('模型配置:', model.internalModel.settings);
    } catch (error) {
      console.warn('读取模型配置失败:', error);
    }
  }, [model, fixModelPosition]);

  // 当模型路径变化时加载模型
  useEffect(() => {
    if (modelPath) {
      loadModel(modelPath);
    }
  }, [modelPath, loadModel]);

  // 当模型加载完成后，检查模型是否准备好
  useEffect(() => {
    if (model) {
      checkModelReady();
    }
  }, [model, checkModelReady]);

  // 返回模型状态和控制函数
  return {
    model,
    loading,
    error,
    applyExpression,
    applyMotion
  };
};

export default useLive2DModel; 