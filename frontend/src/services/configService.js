/**
 * 配置服务
 * 用于管理应用的各种配置项
 */

// 默认配置
const DEFAULT_CONFIG = {
  // API相关配置
  api: {
    url: process.env.REACT_APP_API_URL || 'https://api.example.com',
    useStream: true,
    useMockInDev: true, // 在开发环境中使用模拟API
  },
  
  // 语音相关配置
  speech: {
    enabled: true,
    useWebSpeech: true, // 使用浏览器内置的Web Speech API
    language: 'zh-CN',
    voice: 'female',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
  
  // 模型相关配置
  model: {
    path: '/home/gpr/AI-Streamer-Phy/public/live2d/models/wuwuwu/wuwuwu.model3.json',
    width: 800,
    height: 800,
    enableExpression: true,
    enableRandomMotion: true,
    enableBlinking: true,
    blinkInterval: 5000, // 眨眼间隔，毫秒
  },
  
  // 界面相关配置
  ui: {
    showDebugInfo: false,
    backgroundType: 'image', // 'image' 或 'video'
    backgroundSrc: '/home/gpr/AI-Streamer-Phy/public/backgrounds/custom-bg.png',
    chatHistoryLimit: 50, // 聊天历史记录限制
    theme: 'dark', // 'dark' 或 'light'
  }
};

// 本地存储键名
const CONFIG_STORAGE_KEY = 'virtual_ai_streamer_config';

/**
 * 获取完整配置
 * @returns {Object} 完整配置对象
 */
export const getConfig = () => {
  try {
    // 尝试从本地存储获取配置
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    
    if (storedConfig) {
      // 合并存储的配置和默认配置，确保所有必要的字段都存在
      return { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
    }
  } catch (error) {
    console.error('读取配置失败:', error);
  }
  
  // 如果没有存储的配置或读取失败，返回默认配置
  return { ...DEFAULT_CONFIG };
};

/**
 * 保存配置到本地存储
 * @param {Object} config - 要保存的配置对象
 * @returns {boolean} - 是否保存成功
 */
export const saveConfig = (config) => {
  try {
    // 合并现有配置和新配置
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // 保存到本地存储
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    return true;
  } catch (error) {
    console.error('保存配置失败:', error);
    return false;
  }
};

/**
 * 更新部分配置
 * @param {string} section - 配置部分（如 'api', 'speech', 'model', 'ui'）
 * @param {Object} updates - 要更新的配置项
 * @returns {boolean} - 是否更新成功
 */
export const updateConfig = (section, updates) => {
  try {
    const currentConfig = getConfig();
    
    // 确保该部分配置存在
    if (!currentConfig[section]) {
      currentConfig[section] = {};
    }
    
    // 更新配置
    currentConfig[section] = { ...currentConfig[section], ...updates };
    
    // 保存更新后的配置
    return saveConfig(currentConfig);
  } catch (error) {
    console.error(`更新${section}配置失败:`, error);
    return false;
  }
};

/**
 * 重置配置到默认值
 * @param {string} section - 可选，指定要重置的配置部分
 * @returns {boolean} - 是否重置成功
 */
export const resetConfig = (section = null) => {
  try {
    if (section) {
      // 仅重置指定部分
      const currentConfig = getConfig();
      currentConfig[section] = { ...DEFAULT_CONFIG[section] };
      return saveConfig(currentConfig);
    } else {
      // 重置全部配置
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      return true;
    }
  } catch (error) {
    console.error('重置配置失败:', error);
    return false;
  }
};

/**
 * 检查是否为开发环境
 * @returns {boolean} - 是否为开发环境
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * 获取API URL
 * @returns {string} - API URL
 */
export const getApiUrl = () => {
  const config = getConfig();
  return config.api.url;
};

/**
 * 检查是否应该使用模拟API
 * @returns {boolean} - 是否应该使用模拟API
 */
export const shouldUseMockApi = () => {
  const config = getConfig();
  return isDevelopment() && config.api.useMockInDev;
};

/**
 * 获取语音配置
 * @returns {Object} - 语音配置
 */
export const getSpeechConfig = () => {
  const config = getConfig();
  return config.speech;
};

/**
 * 获取模型配置
 * @returns {Object} - 模型配置
 */
export const getModelConfig = () => {
  const config = getConfig();
  return config.model;
}; 