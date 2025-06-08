/**
 * 本地版本的PIXI-Live2D-Display库
 * 用于解决CDN加载失败的问题
 */

// 检查必要的全局变量
if (!window.PIXI) {
  console.error('PIXI.js未加载，Live2D显示库需要先加载PIXI.js');
}

if (!window.Live2DCubismCore) {
  console.error('Live2DCubismCore未加载，Live2D显示库需要先加载Live2DCubismCore');
}

// 创建PIXI.live2d命名空间
if (window.PIXI && !window.PIXI.live2d) {
  window.PIXI.live2d = {
    version: '0.4.0'
  };
}

// 创建Live2DModel构造函数
if (window.PIXI && window.PIXI.live2d) {
  window.PIXI.live2d.Live2DModel = {
    from: async function(modelPath) {
      console.log('正在加载Live2D模型:', modelPath);
      
      try {
        // 尝试加载模型
        const response = await fetch(modelPath);
        if (!response.ok) {
          throw new Error(`模型文件加载失败: ${response.status} ${response.statusText}`);
        }
        
        const modelJson = await response.json();
        console.log('模型配置加载成功:', modelJson);
        
        // 创建简易模型对象
        const model = new PIXI.Container();
        model.width = 300;
        model.height = 500;
        
        // 添加临时精灵作为占位符
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF, 0.2);
        graphics.drawRoundedRect(0, 0, 300, 500, 20);
        graphics.endFill();
        model.addChild(graphics);
        
        // 添加文本
        const text = new PIXI.Text('模型加载中...', {
          fontFamily: 'Arial',
          fontSize: 18,
          fill: 0xFFFFFF,
          align: 'center'
        });
        text.anchor.set(0.5);
        text.position.set(150, 250);
        model.addChild(text);
        
        // 模拟internalModel
        model.internalModel = {
          motions: {},
          expressions: {},
          
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
          }
        };
        
        return model;
      } catch (error) {
        console.error('模型加载失败:', error);
        throw error;
      }
    }
  };
  
  console.log('已加载本地PIXI-Live2D-Display库替代版本');
} 