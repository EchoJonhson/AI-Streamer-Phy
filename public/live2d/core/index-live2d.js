/**
 * PIXI-Live2D-Display替代库
 * 提供基本功能以防止主库加载失败
 */

console.log('已加载本地PIXI-Live2D-Display库替代版本');

// 确保PIXI存在
if (window.PIXI) {
  // 创建命名空间
  window.PIXI.live2d = window.PIXI.live2d || {};
  
  // 创建简单的Live2DModel类
  window.PIXI.live2d.Live2DModel = class Live2DModel extends window.PIXI.Container {
    constructor() {
      super();
      
      // 设置基本属性
      this._anchor = { x: 0.5, y: 0.5 };
      
      // 定义anchor getter和setter
      Object.defineProperty(this, 'anchor', {
        get: function() {
          return this._anchor;
        },
        set: function(value) {
          this._anchor = value;
        }
      });
      
      // 为anchor添加set方法
      this._anchor.set = function(x, y) {
        this.x = x;
        this.y = y;
      };
      
      // 内部模型属性
      this.internalModel = {
        motions: {},
        expressions: {},
        followPointer: true,
        
        // 模拟方法
        setExpression: function() {
          return Promise.resolve();
        },
        startRandomMotion: function() {
          return Promise.resolve();
        },
        startMotion: function() {
          return Promise.resolve();
        },
        motion: function() {
          return Promise.resolve();
        }
      };
    }
    
    // 静态from方法，用于创建模型实例
    static async from(modelPath) {
      try {
        console.log('尝试加载模型:', modelPath);
        
        // 加载模型JSON配置
        const response = await fetch(modelPath);
        if (!response.ok) {
          throw new Error(`模型文件加载失败: ${response.status} ${response.statusText}`);
        }
        
        const modelJson = await response.json();
        console.log('模型配置:', modelJson);
        
        // 创建模型实例
        const model = new this();
        
        // 设置模型尺寸
        model.width = 300;
        model.height = 500;
        
        // 添加图形显示
        const graphics = new window.PIXI.Graphics();
        graphics.beginFill(0xaaaaaa, 0.2);
        graphics.drawRoundedRect(0, 0, 300, 500, 20);
        graphics.endFill();
        model.addChild(graphics);
        
        // 添加文本
        const text = new window.PIXI.Text('模型 ' + (modelJson.name || '未命名'), {
          fontFamily: 'Arial',
          fontSize: 16,
          fill: 0xffffff,
          align: 'center'
        });
        text.x = 150 - text.width / 2;
        text.y = 250 - text.height / 2;
        model.addChild(text);
        
        return model;
      } catch (error) {
        console.error('模型加载失败:', error);
        throw error;
      }
    }
  };
  
  // 设置工厂函数
  window.PIXI.live2d.Live2DModel.from = async function(modelPath) {
    try {
      const model = await window.PIXI.live2d.Live2DModel.prototype.constructor.from(modelPath);
      return model;
    } catch (error) {
      console.error('工厂函数创建模型失败:', error);
      throw error;
    }
  };
  
  console.log('PIXI-Live2D-Display替代库初始化完成');
} else {
  console.error('PIXI未加载，无法初始化PIXI-Live2D-Display替代库');
} 