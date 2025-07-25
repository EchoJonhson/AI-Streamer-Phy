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
      
      // 处理具体错误类型
      const errorInfo = this.handleSpeechRecognitionError(event.error);
      
      if (this.onErrorCallback) {
        this.onErrorCallback(errorInfo);
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

  /**
   * 处理语音识别错误
   * @param {string} error - 错误代码
   * @returns {Object} 错误信息对象
   */
  handleSpeechRecognitionError(error) {
    const errorMessages = {
      'no-speech': '没有检测到语音输入，请检查麦克风或重试',
      'audio-capture': '无法捕获音频，请检查麦克风设备',
      'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问',
      'network': '网络连接问题，请检查网络连接后重试',
      'service-not-available': '语音识别服务不可用，请稍后重试',
      'bad-grammar': '语法错误，请重新尝试',
      'language-not-supported': '不支持的语言设置',
      'aborted': '语音识别被中断'
    };

    const message = errorMessages[error] || `未知错误: ${error}`;
    console.error('语音识别错误详情:', message);
    
    return {
      code: error,
      message,
      isRetryable: ['network', 'service-not-available', 'no-speech'].includes(error),
      isPermissionIssue: ['not-allowed', 'audio-capture'].includes(error)
    };
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
  const supportInfo = checkSpeechRecognitionSupport();
  
  // 如果有问题，输出详细信息
  if (!supportInfo.isSupported) {
    console.warn('语音识别不可用:', supportInfo.issues.join(', '));
    console.log('浏览器信息:', supportInfo.browserInfo);
  }
  
  return supportInfo.isSupported;
};

/**
 * 检查麦克风权限状态
 * @returns {Promise<string>} 权限状态: 'granted', 'denied', 'prompt', 'unknown'
 */
export const checkMicrophonePermission = async () => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state;
  } catch (error) {
    console.warn('无法查询麦克风权限状态:', error);
    return 'unknown';
  }
};

/**
 * 检查浏览器支持情况
 * @returns {Object} 支持信息
 */
export const getBrowserSupportInfo = () => {
  const info = {
    speechRecognition: false,
    mediaDevices: false,
    isSecureContext: false,
    browser: 'unknown'
  };

  // 检查语音识别支持
  info.speechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  
  // 检查媒体设备支持
  info.mediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // 检查安全上下文
  info.isSecureContext = window.isSecureContext;
  
  // 检测浏览器类型
  if (window.chrome) {
    info.browser = 'chrome';
  } else if (window.safari) {
    info.browser = 'safari';
  } else if (navigator.userAgent.includes('Firefox')) {
    info.browser = 'firefox';
  } else if (navigator.userAgent.includes('Edge')) {
    info.browser = 'edge';
  }

  return info;
};

/**
 * 增强的语音识别支持检查
 * @returns {Object} 支持检查结果
 */
export const checkSpeechRecognitionSupport = () => {
  const support = getBrowserSupportInfo();
  const issues = [];
  
  if (!support.speechRecognition) {
    issues.push('浏览器不支持语音识别API');
  }
  
  if (!support.mediaDevices) {
    issues.push('浏览器不支持媒体设备API');
  }
  
  if (!support.isSecureContext) {
    issues.push('语音识别需要HTTPS安全上下文');
  }
  
  return {
    isSupported: issues.length === 0,
    issues,
    browserInfo: support
  };
};

/**
 * 增强的麦克风权限请求
 * @returns {Promise<boolean>} 是否获得权限
 */
export const requestMicrophonePermission = async () => {
  // 检查API支持
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('当前浏览器不支持媒体设备访问');
  }

  // 检查HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    throw new Error('语音识别需要HTTPS安全连接');
  }

  // 先检查权限状态
  const permissionState = await checkMicrophonePermission();
  if (permissionState === 'denied') {
    throw new Error('麦克风权限已被拒绝，请在浏览器设置中手动允许');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    // 立即停止流，只是为了检查权限
    stream.getTracks().forEach(track => track.stop());
    
    console.log('麦克风权限已授予');
    return true;
  } catch (error) {
    console.error('麦克风权限被拒绝:', error);
    
    // 处理不同类型的错误
    switch (error.name) {
      case 'NotAllowedError':
        throw new Error('用户拒绝了麦克风权限');
      case 'NotFoundError':
        throw new Error('未找到麦克风设备');
      case 'NotReadableError':
        throw new Error('麦克风设备被其他应用占用');
      case 'SecurityError':
        throw new Error('安全错误：请确保使用HTTPS访问');
      default:
        throw new Error(`麦克风访问失败: ${error.message}`);
    }
  }
};

/**
 * 增强的语音识别函数
 * @param {Object} options - 识别选项
 * @param {Function} onResult - 结果回调
 * @param {Function} onError - 错误回调
 * @returns {Promise<SpeechRecognition>} 语音识别实例
 */
export const startSpeechRecognition = async (options = {}, onResult, onError) => {
  // 全面检查浏览器支持
  const supportCheck = checkSpeechRecognitionSupport();
  if (!supportCheck.isSupported) {
    const errorMessage = `语音识别不可用: ${supportCheck.issues.join(', ')}`;
    const error = new Error(errorMessage);
    if (onError) onError({ code: 'not-supported', message: errorMessage, isRetryable: false });
    throw error;
  }

  // 请求麦克风权限
  try {
    await requestMicrophonePermission();
  } catch (permissionError) {
    const errorInfo = {
      code: 'permission-denied',
      message: permissionError.message,
      isRetryable: false,
      isPermissionIssue: true
    };
    if (onError) onError(errorInfo);
    throw permissionError;
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
  } catch (startError) {
    const errorInfo = {
      code: 'start-failed',
      message: `启动语音识别失败: ${startError.message}`,
      isRetryable: true
    };
    if (onError) onError(errorInfo);
    throw startError;
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