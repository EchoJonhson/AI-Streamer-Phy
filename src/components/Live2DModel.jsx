import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

window.PIXI = PIXI; // 必须暴露给 window

const MODEL_PATH = '/assets/models/wuwuwu.model3.json'; // 你的模型路径

export default function Live2DModelComponent() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    // 创建 PIXI 应用
    const app = new PIXI.Application({
      view: canvasRef.current,
      autoStart: true,
      backgroundAlpha: 0,
      resizeTo: canvasRef.current.parentNode,
    });
    appRef.current = app;

    // 加载 Live2D 模型
    Live2DModel.from(MODEL_PATH).then(model => {
      // 设置模型属性
      model.x = app.screen.width / 2;
      model.y = app.screen.height / 2;
      model.anchor.set(0.5, 0.5);
      model.scale.set(0.3, 0.3); // 根据需要调整缩放

      // 添加到舞台
      app.stage.addChild(model);

      // 可选：添加交互
      model.on('hit', (hitAreas) => {
        if (hitAreas.includes('body')) {
          model.motion('tap_body');
        }
      });
    });

    // 清理
    return () => {
      app.destroy(true, true);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
} 