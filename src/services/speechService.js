/**
 * 语音合成服务
 * 用于将AI文本响应转换为语音
 */

const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

/**
 * 使用Web Speech API进行文本到语音转换
 * @param {string} text - 要转换为语音的文本
 * @param {Object} options - 语音合成选项
 * @returns {Promise} - 语音播放完成的Promise
 */
export const speakText = (text, options = {}) => {
  return new Promise((resolve, reject) => {
    // 检查浏览器是否支持语音合成
    if (!window.speechSynthesis) {
      console.error('当前浏览器不支持语音合成API');
      reject(new Error('当前浏览器不支持语音合成API'));
      return;
    }

    // 停止当前正在播放的语音
    window.speechSynthesis.cancel();

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(text);

    // 设置语音参数
    utterance.lang = options.lang || 'zh-CN';
    utterance.rate = options.rate || 1.0; // 语速，默认1.0
    utterance.pitch = options.pitch || 1.0; // 音高，默认1.0
    utterance.volume = options.volume || 1.0; // 音量，默认1.0

    // 如果指定了声音，则设置
    if (options.voice) {
      utterance.voice = options.voice;
    }

    // 设置回调
    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('语音合成错误:', event);
      reject(event);
    };

    // 开始语音合成
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * 获取可用的语音列表
 * @returns {Array} - 可用语音列表
 */
export const getAvailableVoices = () => {
  return new Promise((resolve) => {
    // 检查浏览器是否支持语音合成
    if (!window.speechSynthesis) {
      console.error('当前浏览器不支持语音合成API');
      resolve([]);
      return;
    }

    // 获取可用语音列表
    let voices = window.speechSynthesis.getVoices();

    // 如果语音列表为空，等待onvoiceschanged事件
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    } else {
      resolve(voices);
    }
  });
};

/**
 * 使用外部API进行文本到语音转换
 * @param {string} text - 要转换为语音的文本
 * @param {Object} options - 语音合成选项
 * @returns {Promise<string>} - 返回音频URL的Promise
 */
export const generateSpeechFromAPI = async (text, options = {}) => {
  try {
    // 构建请求体
    const requestBody = {
      text,
      voice: options.voice || 'female',
      language: options.language || 'zh-CN',
      speed: options.speed || 1.0,
      format: options.format || 'mp3'
    };

    // 发送请求到API
    const response = await fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`语音合成API请求失败: ${response.status}`);
    }

    // 获取音频URL
    const data = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error('语音合成失败:', error);
    throw error;
  }
};

/**
 * 播放音频URL
 * @param {string} audioUrl - 音频URL
 * @param {Object} options - 播放选项
 * @returns {Promise} - 音频播放完成的Promise
 */
export const playAudio = (audioUrl, options = {}) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    // 设置音频参数
    audio.volume = options.volume !== undefined ? options.volume : 1.0;
    
    // 设置回调
    audio.onended = () => {
      resolve();
    };
    
    audio.onerror = (event) => {
      console.error('音频播放错误:', event);
      reject(event);
    };
    
    // 开始播放
    audio.play().catch(error => {
      console.error('音频播放失败:', error);
      reject(error);
    });
    
    return audio;
  });
};

/**
 * 停止当前正在播放的音频
 * @param {HTMLAudioElement} audioElement - 音频元素
 */
export const stopAudio = (audioElement) => {
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
};

/**
 * 模拟语音合成（开发环境使用）
 * @param {string} text - 要转换为语音的文本
 * @returns {Promise} - 模拟语音播放完成的Promise
 */
export const mockSpeechSynthesis = (text) => {
  return new Promise(resolve => {
    console.log(`[模拟语音] 正在播放: "${text}"`);
    
    // 模拟语音播放时间，假设每个字符需要100毫秒
    const duration = text.length * 100;
    
    setTimeout(() => {
      console.log('[模拟语音] 播放完成');
      resolve();
    }, duration);
  });
}; 