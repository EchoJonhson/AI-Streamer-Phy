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
      try {
        // 检查是否是有效的SpeechSynthesisVoice对象
        if (options.voice instanceof SpeechSynthesisVoice) {
          utterance.voice = options.voice;
        } else if (typeof options.voice === 'string') {
          // 如果是字符串，尝试通过名称查找声音
          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find(v => 
            v.name === options.voice || 
            v.voiceURI === options.voice ||
            v.lang === options.voice
          );
          
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          } else {
            console.warn(`未找到名为"${options.voice}"的声音，使用默认声音`);
          }
        } else {
          console.warn('指定的声音不是有效的SpeechSynthesisVoice对象，使用默认声音');
        }
      } catch (voiceError) {
        console.error('设置声音时出错:', voiceError);
        // 继续使用默认声音
      }
    } else {
      // 尝试找到匹配当前语言的声音
      try {
        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));
        
        if (langVoices.length > 0) {
          // 优先使用女声（通常名称中包含female或F）
          const femaleVoice = langVoices.find(voice => 
            voice.name.includes('female') || 
            voice.name.includes('Female') || 
            voice.name.includes('F') ||
            voice.name.includes('女')
          );
          
          utterance.voice = femaleVoice || langVoices[0];
        }
      } catch (error) {
        console.warn('自动选择声音失败:', error);
        // 继续使用默认声音
      }
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

// =================== 语音识别功能 ===================

/**
 * 语音识别类，封装Web Speech API的语音识别功能
 */
class SpeechRecognition {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.finalTranscript = '';
    this.interimTranscript = '';
    
    this.initializeRecognition();
  }

  /**
   * 初始化语音识别
   */
  initializeRecognition() {
    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('当前浏览器不支持语音识别API');
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // 配置识别参数
    this.recognition.continuous = true; // 连续识别
    this.recognition.interimResults = true; // 返回中间结果
    this.recognition.lang = 'zh-CN'; // 语言设置
    this.recognition.maxAlternatives = 1; // 最多返回1个候选结果

    // 设置事件监听器
    this.recognition.onstart = () => {
      console.log('语音识别开始');
      this.isListening = true;
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.finalTranscript = finalTranscript;
      this.interimTranscript = interimTranscript;

      if (this.onResultCallback) {
        this.onResultCallback({
          finalTranscript,
          interimTranscript,
          isFinal: finalTranscript.length > 0
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      this.isListening = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      console.log('语音识别结束');
      this.isListening = false;
      
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * 开始语音识别
   * @param {Object} options - 识别选项
   */
  start(options = {}) {
    if (!this.recognition) {
      throw new Error('语音识别不可用');
    }

    if (this.isListening) {
      console.warn('语音识别已经在进行中');
      return;
    }

    // 应用选项
    if (options.lang) {
      this.recognition.lang = options.lang;
    }
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }

    // 重置转录结果
    this.finalTranscript = '';
    this.interimTranscript = '';

    try {
      this.recognition.start();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      throw error;
    }
  }

  /**
   * 停止语音识别
   */
  stop() {
    if (!this.recognition) {
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * 中止语音识别
   */
  abort() {
    if (!this.recognition) {
      return;
    }

    if (this.isListening) {
      this.recognition.abort();
    }
  }

  /**
   * 销毁语音识别实例并清理资源
   */
  destroy() {
    console.log('销毁语音识别实例...');
    
    // 停止当前识别
    if (this.isListening) {
      this.abort();
    }
    
    // 清理事件监听器
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
    }
    
    // 清理回调函数
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    
    // 清理转录结果
    this.finalTranscript = '';
    this.interimTranscript = '';
    
    // 清理识别实例
    this.recognition = null;
    this.isListening = false;
    
    console.log('语音识别实例已销毁');
  }

  /**
   * 获取最终转录结果
   */
  getFinalTranscript() {
    return this.finalTranscript;
  }

  /**
   * 获取中间转录结果
   */
  getInterimTranscript() {
    return this.interimTranscript;
  }

  /**
   * 设置结果回调
   */
  setOnResult(callback) {
    this.onResultCallback = callback;
  }

  /**
   * 设置错误回调
   */
  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * 设置开始回调
   */
  setOnStart(callback) {
    this.onStartCallback = callback;
  }

  /**
   * 设置结束回调
   */
  setOnEnd(callback) {
    this.onEndCallback = callback;
  }

  /**
   * 检查是否正在监听
   */
  isRecognizing() {
    return this.isListening;
  }
}

// 全局语音识别实例
let globalSpeechRecognition = null;

/**
 * 获取语音识别实例（单例模式）
 * @returns {SpeechRecognition} 语音识别实例
 */
export const getSpeechRecognition = () => {
  if (!globalSpeechRecognition) {
    globalSpeechRecognition = new SpeechRecognition();
  }
  return globalSpeechRecognition;
};

/**
 * 检查浏览器是否支持语音识别
 * @returns {boolean} 是否支持
 */
export const isSpeechRecognitionSupported = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * 请求麦克风权限
 * @returns {Promise<boolean>} 是否获得权限
 */
export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 立即停止流，只是为了检查权限
    stream.getTracks().forEach(track => track.stop());
    
    console.log('麦克风权限已授予');
    return true;
  } catch (error) {
    console.error('麦克风权限被拒绝:', error);
    return false;
  }
};

/**
 * 简化的语音识别函数
 * @param {Object} options - 识别选项
 * @param {Function} onResult - 结果回调
 * @param {Function} onError - 错误回调
 * @returns {Promise<SpeechRecognition>} 语音识别实例
 */
export const startSpeechRecognition = async (options = {}, onResult, onError) => {
  // 检查浏览器支持
  if (!isSpeechRecognitionSupported()) {
    const error = new Error('当前浏览器不支持语音识别');
    if (onError) onError(error);
    throw error;
  }

  // 请求麦克风权限
  const hasPermission = await requestMicrophonePermission();
  if (!hasPermission) {
    const error = new Error('麦克风权限被拒绝');
    if (onError) onError(error);
    throw error;
  }

  // 获取语音识别实例
  const recognition = getSpeechRecognition();
  
  // 设置回调
  if (onResult) {
    recognition.setOnResult(onResult);
  }
  if (onError) {
    recognition.setOnError(onError);
  }

  // 开始识别
  try {
    recognition.start(options);
    return recognition;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
};

/**
 * 停止语音识别
 */
export const stopSpeechRecognition = () => {
  if (globalSpeechRecognition) {
    globalSpeechRecognition.stop();
  }
};

/**
 * 销毁全局语音识别实例并清理资源
 * 该函数应该在组件卸载或页面关闭时调用
 */
export const destroySpeechRecognition = () => {
  if (globalSpeechRecognition) {
    globalSpeechRecognition.destroy();
    globalSpeechRecognition = null;
    console.log('全局语音识别实例已销毁');
  }
};

/**
 * 重置语音识别实例
 * 在发生错误或需要重新初始化时使用
 */
export const resetSpeechRecognition = () => {
  console.log('重置语音识别实例...');
  destroySpeechRecognition();
  // 下次调用getSpeechRecognition()时会重新创建实例
};

// 存储模拟语音识别的定时器，用于清理
let mockRecognitionTimers = new Set();

/**
 * 模拟语音识别（开发环境使用）
 * @param {Function} onResult - 结果回调
 * @param {number} duration - 模拟时长（毫秒）
 * @returns {Promise} - 模拟识别完成的Promise
 */
export const mockSpeechRecognition = (onResult, duration = 3000) => {
  return new Promise((resolve) => {
    console.log('[模拟语音识别] 开始录音...');
    
    // 模拟中间结果
    const mockPhrases = ['你好', '你好，我', '你好，我想', '你好，我想问'];
    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      if (currentIndex < mockPhrases.length) {
        if (onResult) {
          onResult({
            finalTranscript: '',
            interimTranscript: mockPhrases[currentIndex],
            isFinal: false
          });
        }
        currentIndex++;
      }
    }, duration / mockPhrases.length);
    
    // 将定时器添加到集合中用于清理
    mockRecognitionTimers.add(intervalId);
    
    // 模拟最终结果
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      mockRecognitionTimers.delete(intervalId);
      
      const finalResult = '你好，我想问一个问题';
      if (onResult) {
        onResult({
          finalTranscript: finalResult,
          interimTranscript: '',
          isFinal: true
        });
      }
      
      console.log(`[模拟语音识别] 识别完成: "${finalResult}"`);
      mockRecognitionTimers.delete(timeoutId);
      resolve(finalResult);
    }, duration);
    
    // 将超时定时器也添加到集合中用于清理
    mockRecognitionTimers.add(timeoutId);
  });
};

/**
 * 清理所有模拟语音识别的定时器
 * 防止内存泄漏
 */
export const clearMockRecognitionTimers = () => {
  console.log('清理模拟语音识别定时器...');
  
  mockRecognitionTimers.forEach(timer => {
    clearInterval(timer);
    clearTimeout(timer);
  });
  
  mockRecognitionTimers.clear();
  console.log('模拟语音识别定时器已清理');
}; 