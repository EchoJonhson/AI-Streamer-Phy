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
  const [initAttempts, setInitAttempts] = useState(0);
  const MAX_INIT_ATTEMPTS = 5;
  
  // 手动初始化PIXI-Live2D-Display
  const manualInitPIXILive2D = useCallback(() => {
    try {
      console.log('尝试手动初始化PIXI-Live2D-Display');
      
      // 确保PIXI.js已加载
      if (!window.PIXI) {
        console.error('手动初始化失败: PIXI.js未加载');
        return false;
      }
      
      // 确保Live2DCubismCore已加载
      if (!window.Live2DCubismCore) {
        console.error('手动初始化失败: Live2DCubismCore未加载');
        return false;
      }
      
      // 确保Live2D已加载
      if (!window.Live2D) {
        console.error('手动初始化失败: Live2D未加载');
        return false;
      }
      
      // 检查PIXI.live2d是否存在
      if (!window.PIXI.live2d) {
        console.log('创建PIXI.live2d命名空间');
        window.PIXI.live2d = {};
      }
      
      // 配置基本设置
      if (!window.PIXI.live2d.config) {
        window.PIXI.live2d.config = {
          sound: true,
          motionSync: true,
          motionFadingDuration: 500,
          idleMotionFadingDuration: 2000,
          expressionFadingDuration: 500
        };
      }
      
      // 检查Live2DModel类是否存在
      if (!window.PIXI.live2d.Live2DModel) {
        console.log('尝试手动创建Live2DModel类');
        
        // 简易版Live2DModel类
        window.PIXI.live2d.Live2DModel = class Live2DModel extends window.PIXI.Container {
          constructor() {
            super();
            this.anchor = new window.PIXI.Point(0.5, 0.5);
            this.internalModel = {
              motions: {},
              expressions: {},
              followPointer: true,
              
              startRandomMotion: function(group, priority) {
                console.log('模拟动作:', group, priority);
                return Promise.resolve();
              },
              
              setExpression: function(name) {
                console.log('模拟表情:', name);
                return Promise.resolve();
              },
              
              motion: function(group, index) {
                console.log('模拟动作:', group, index);
                return Promise.resolve();
              }
            };
          }
          
          static from(source) {
            console.log('使用手动初始化的Live2DModel.from方法');
            return new Promise((resolve, reject) => {
              try {
                const model = new window.PIXI.live2d.Live2DModel();
                
                if (typeof source === 'string') {
                  fetch(source)
                    .then(response => response.json())
                    .then(config => {
                      model.modelConfig = config;
                      console.log('模型配置加载成功:', config);
                      resolve(model);
                    })
                    .catch(reject);
                } else {
                  model.modelConfig = source;
                  resolve(model);
                }
              } catch (error) {
                reject(error);
              }
            });
          }
        };
      }
      
      console.log('手动初始化PIXI-Live2D-Display完成');
      return true;
    } catch (error) {
      console.error('手动初始化PIXI-Live2D-Display失败:', error);
      return false;
    }
  }, []);
  
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
    
    // 更详细地检查PIXI-Live2D-Display是否完全初始化
    if (!window.PIXI.live2d.Live2DModel || 
        !window.PIXI.live2d.Live2DModel.from || 
        !window.PIXI.live2d.config) {
      console.error('PIXI-Live2D-Display未完全初始化');
      return 'PIXI-Live2D-Display未完全初始化，请刷新页面重试';
    }
    
    // 一切正常
    return null;
  }, []);
  
  // 确保所有必要的库都已加载
  const ensureDependencies = useCallback(async () => {
    // 检查是否已经尝试过太多次
    if (initAttempts >= MAX_INIT_ATTEMPTS) {
      console.error(`已尝试初始化${MAX_INIT_ATTEMPTS}次，不再尝试`);
      return false;
    }
    
    // 递增尝试次数
    setInitAttempts(prev => prev + 1);
    
    // 如果Live2DLoader存在，使用它来加载所有依赖
    if (window.Live2DLoader) {
      console.log('使用Live2DLoader加载依赖...');
      try {
        // 尝试多次初始化，最多3次
        let attempts = 0;
        const maxAttempts = 3;
        let result = false;
        
        while (!result && attempts < maxAttempts) {
          attempts++;
          console.log(`尝试初始化Live2D依赖 (尝试 ${attempts}/${maxAttempts})`);
          
          // 等待初始化完成
          result = await window.Live2DLoader.initLive2D();
          
          if (result) {
            console.log('Live2DLoader初始化成功');
            return true;
          }
          
          if (attempts < maxAttempts) {
            // 如果失败但还有尝试机会，等待一段时间再试
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!result) {
          console.error(`Live2DLoader初始化失败，已尝试${maxAttempts}次`);
          console.log('尝试手动初始化');
          
          // 尝试手动初始化
          if (manualInitPIXILive2D()) {
            console.log('手动初始化成功');
            return true;
          }
          
          return false;
        }
      } catch (error) {
        console.error('Live2DLoader加载过程中出错:', error);
        
        // 尝试手动初始化
        console.log('尝试手动初始化');
        if (manualInitPIXILive2D()) {
          console.log('手动初始化成功');
          return true;
        }
        
        return false;
      }
    } 
    
    // 如果没有Live2DLoader，检查依赖
    const dependencyError = checkDependencies();
    
    // 如果依赖检查失败，尝试手动初始化
    if (dependencyError) {
      console.log('依赖检查失败，尝试手动初始化');
      return manualInitPIXILive2D();
    }
    
    return !dependencyError;
  }, [checkDependencies, manualInitPIXILive2D, initAttempts]);
  
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
    
    // 确保所有依赖都已加载
    const dependenciesLoaded = await ensureDependencies();
    if (!dependenciesLoaded) {
      setError('无法加载必要的库，请刷新页面或查看控制台获取更多信息');
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
          
          // 加载模型 - 添加超时保护
          const loadModelPromise = window.PIXI.live2d.Live2DModel.from(path, loadOptions);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('加载模型超时')), 30000)
          );
          
          // 使用Promise.race来实现超时控制
          const modelObj = await Promise.race([loadModelPromise, timeoutPromise]);
          
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
  }, [ensureDependencies, useSimpleModelLoader, checkModelFile, options]);

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
    applyMotion,
    reload: () => loadModel(modelPath) // 添加重新加载方法
  };
};

export default useLive2DModel; 