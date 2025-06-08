/**
 * Live2D模型控制服务
 * 用于处理模型的表情和动作控制
 */

// 表情映射表
const EXPRESSION_MAP = {
  happy: 'happy', // 开心
  sad: 'sad',     // 悲伤
  angry: 'angry', // 生气
  surprised: 'surprised', // 惊讶
  neutral: 'neutral',    // 中性
  embarrassed: 'embarrassed', // 害羞
  wink: 'wink',   // 眨眼
  // 可以根据模型支持的表情添加更多
};

// 动作映射表
const MOTION_MAP = {
  wave: 'wave',   // 挥手
  nod: 'nod',     // 点头
  shake: 'shake', // 摇头
  jump: 'jump',   // 跳跃
  bow: 'bow',     // 鞠躬
  // 可以根据模型支持的动作添加更多
};

/**
 * 解析AI响应中的表情指令
 * @param {string} message - AI响应消息
 * @returns {Object} - 包含表情和动作的对象
 */
export const parseExpressionFromMessage = (message) => {
  // 默认表情和动作
  const result = {
    expression: 'neutral',
    motions: []
  };
  
  // 简单的规则匹配，实际项目中可能需要更复杂的NLP或特定格式
  if (!message) return result;
  
  // 检查表情关键词
  Object.keys(EXPRESSION_MAP).forEach(key => {
    if (message.toLowerCase().includes(key)) {
      result.expression = EXPRESSION_MAP[key];
    }
  });
  
  // 检查动作关键词
  Object.keys(MOTION_MAP).forEach(key => {
    if (message.toLowerCase().includes(key)) {
      result.motions.push(MOTION_MAP[key]);
    }
  });
  
  return result;
};

/**
 * 应用表情到Live2D模型
 * @param {Object} model - Live2D模型实例
 * @param {string} expression - 表情名称
 * @returns {boolean} - 是否成功应用表情
 */
export const applyExpression = (model, expression) => {
  if (!model || !expression) return false;
  
  try {
    // 增加更多安全检查
    if (!model.internalModel) {
      console.warn('模型的internalModel不存在');
      return false;
    }
    
    // 检查模型是否支持该表情
    // 增加安全检查，确保settings和expressions存在
    const settings = model.internalModel.settings || {};
    const expressions = settings.expressions || [];
    
    // 如果expressions不存在，尝试从其他可能的位置获取
    let expressionExists = false;
    
    if (expressions.length > 0) {
      expressionExists = expressions.some(exp => exp.name === expression);
    } else if (model.internalModel.expressions) {
      // 有些模型可能直接在internalModel下有expressions
      expressionExists = model.internalModel.expressions.some(exp => exp.name === expression);
    }
    
    if (expressionExists) {
      // 应用表情
      if (typeof model.expression === 'function') {
        model.expression(expression);
        return true;
      } else {
        console.warn('模型没有expression方法');
        return false;
      }
    } else {
      console.warn(`表情 "${expression}" 在模型中不存在`);
      return false;
    }
  } catch (error) {
    console.error('应用表情失败:', error);
    return false;
  }
};

/**
 * 应用动作到Live2D模型
 * @param {Object} model - Live2D模型实例
 * @param {string} motion - 动作名称
 * @param {number} priority - 动作优先级
 * @returns {boolean} - 是否成功应用动作
 */
export const applyMotion = (model, motion, priority = 3) => {
  if (!model || !motion) return false;
  
  try {
    // 增加安全检查
    if (!model.internalModel) {
      console.warn('模型的internalModel不存在');
      return false;
    }
    
    // 检查模型是否支持该动作
    const settings = model.internalModel.settings || {};
    const motionGroups = settings.motions || {};
    
    // 尝试在不同的动作组中查找
    for (const group in motionGroups) {
      if (motionGroups[group].some(m => m.file.includes(motion))) {
        // 应用动作
        if (typeof model.motion === 'function') {
          model.motion(group, 0, priority);
          return true;
        } else {
          console.warn('模型没有motion方法');
          return false;
        }
      }
    }
    
    console.warn(`动作 "${motion}" 在模型中不存在`);
    return false;
  } catch (error) {
    console.error('应用动作失败:', error);
    return false;
  }
};

/**
 * 随机触发眨眼动作
 * @param {Object} model - Live2D模型实例
 * @param {number} interval - 眨眼间隔（毫秒）
 * @returns {number} - 定时器ID
 */
export const startRandomBlinking = (model, interval = 5000) => {
  if (!model) return null;
  
  const timerId = setInterval(() => {
    try {
      // 随机决定是否眨眼
      if (Math.random() > 0.3) {
        applyExpression(model, 'blink');
        
        // 短暂延迟后恢复
        setTimeout(() => {
          applyExpression(model, 'neutral');
        }, 300);
      }
    } catch (error) {
      console.error('眨眼动作失败:', error);
    }
  }, interval);
  
  return timerId;
};

/**
 * 停止随机眨眼
 * @param {number} timerId - 定时器ID
 */
export const stopRandomBlinking = (timerId) => {
  if (timerId) {
    clearInterval(timerId);
  }
};

/**
 * 处理AI消息并应用相应的表情和动作
 * @param {Object} model - Live2D模型实例
 * @param {string} message - AI消息
 * @returns {Object} - 应用的表情和动作
 */
export const handleAIMessageExpression = (model, message) => {
  if (!model || !message) return null;
  
  // 解析消息中的表情指令
  const { expression, motions } = parseExpressionFromMessage(message);
  
  // 应用表情
  if (expression) {
    applyExpression(model, expression);
  }
  
  // 应用动作
  if (motions && motions.length > 0) {
    motions.forEach(motion => {
      applyMotion(model, motion);
    });
  }
  
  return { expression, motions };
}; 