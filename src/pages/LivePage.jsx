import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Live2DModelComponent from '../components/Live2DModel';
import LiveBackground from '../components/LiveBackground';
import ApiSettings from '../components/ApiSettings';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import './LivePage.css';

// 导入服务
import { 
  sendMessageToAI, 
  streamMessageFromAI, 
  mockAIResponse, 
  mockStreamResponse 
} from '../services/apiService';
import { 
  sendMessageToHuggingFace,
  streamMessageFromHuggingFace,
  hasApiService
} from '../services/huggingFaceService';
import { 
  handleAIMessageExpression, 
  startRandomBlinking,
  parseExpressionFromMessage
} from '../services/modelControlService';
import { 
  speakText, 
  mockSpeechSynthesis,
  startSpeechRecognition,
  stopSpeechRecognition,
  isSpeechRecognitionSupported,
  mockSpeechRecognition,
  destroySpeechRecognition,
  resetSpeechRecognition,
  clearMockRecognitionTimers
} from '../services/speechService';
import {
  getConfig,
  getModelConfig,
  shouldUseMockApi
} from '../services/configService';

// 初始化PIXI环境
window.PIXI = PIXI;

// 确保Live2D核心库已加载
const ensureLive2DEnvironment = () => {
  // 不再注册PIXI Ticker，避免autoUpdate相关问题
  
  // 检查Cubism核心库是否已加载
  if (!window.Live2DCubismCore) {
    console.log('Cubism 4运行时状态: 未加载');
    
    // 尝试手动加载核心库
    const script = document.createElement('script');
    script.src = '/live2d/core/live2dcubismcore.min.js';
    document.head.appendChild(script);
  } else {
    console.log('Cubism 4运行时状态: 已加载');
  }
  
  // 检查Live2D库是否已加载
  if (!window.Live2D) {
    console.log('Cubism 2运行时状态: 未加载');
  } else {
    console.log('Cubism 2运行时状态: 已加载');
  }
};

const LivePage = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [modelPath, setModelPath] = useState('');
  const [modelLoading, setModelLoading] = useState(false);
  const [backgroundType, setBackgroundType] = useState('image'); // 'video' or 'image'
  const [backgroundSrc, setBackgroundSrc] = useState('./backgrounds/custom-bg.png');
  const [debugMode, setDebugMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // 是否正在处理消息
  const [streamingMessage, setStreamingMessage] = useState(''); // 流式接收的消息
  const [showSettings, setShowSettings] = useState(false); // 是否显示设置
  const [apiProvider, setApiProvider] = useState(localStorage.getItem('api_provider') || 'mock'); // API提供者：mock, huggingface
  
  // 语音识别相关状态
  const [isListening, setIsListening] = useState(false); // 是否正在语音识别
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false); // 是否支持语音识别
  const [speechText, setSpeechText] = useState(''); // 语音识别的文本
  const [recognitionError, setRecognitionError] = useState(''); // 识别错误信息
  
  const navigate = useNavigate();
  const modelRef = useRef(null); // 存储Live2D模型引用
  const blinkTimerRef = useRef(null); // 存储眨眼定时器引用
  const messagesEndRef = useRef(null); // 用于自动滚动到最新消息
  const speechRecognitionRef = useRef(null); // 存储语音识别实例引用

  // 初始化Live2D环境
  useEffect(() => {
    ensureLive2DEnvironment();
    
    // 检查是否存在PIXI库
    if (!window.PIXI) {
      console.warn('PIXI.js未加载。Live2D模型可能无法正常显示。');
    }
  }, []);

  // 初始化配置
  useEffect(() => {
    const config = getConfig();
    const modelConfig = getModelConfig();
    
    // 设置模型路径
    setModelPath(modelConfig.path);
    
    // 检查语音识别支持
    setSpeechRecognitionSupported(isSpeechRecognitionSupported());
    
    console.log('语音识别支持状态:', isSpeechRecognitionSupported());
    
    // 设置UI配置
    setBackgroundType(config.ui.backgroundType);
    setBackgroundSrc(config.ui.backgroundSrc);
    setDebugMode(config.ui.showDebugInfo);
    
    // 检查是否有Hugging Face API密钥
    if (hasApiService()) {
      setApiProvider('huggingface');
      localStorage.setItem('api_provider', 'huggingface');
    }
    
    // 如果没有API密钥，显示设置界面
    if (!hasApiService() && apiProvider === 'huggingface') {
      setShowSettings(true);
    }
  }, [apiProvider]);

  // 组件卸载时清理资源
  useEffect(() => {
    // 页面卸载时清理资源
    const handleBeforeUnload = () => {
      console.log('页面即将卸载，清理语音识别资源...');
      clearMockRecognitionTimers();
      destroySpeechRecognition();
    };
    
    // 注册页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      console.log('LivePage组件卸载，清理语音识别资源...');
      
      // 移除页面卸载事件监听器
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // 停止当前的语音识别
      if (isListening) {
        stopSpeechRecognition();
      }
      
      // 清理模拟语音识别的定时器
      clearMockRecognitionTimers();
      
      // 销毁语音识别实例
      destroySpeechRecognition();
      
      // 清理眨眼定时器
      if (blinkTimerRef.current) {
        clearInterval(blinkTimerRef.current);
        blinkTimerRef.current = null;
      }
      
      console.log('语音识别资源清理完成');
    };
  }, [isListening]); // 依赖isListening确保在语音识别状态改变时正确清理

  // 检查用户是否已登录
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      // 如果没有用户名，设置一个默认值而不是跳转
      const defaultName = '游客' + Math.floor(Math.random() * 1000);
      localStorage.setItem('username', defaultName);
      setUsername(defaultName);
      
      // 添加欢迎消息
      setMessages([
        {
          id: Date.now(),
          sender: 'AI主播',
          content: `欢迎 ${defaultName} 来到直播间！我是你的虚拟主播，很高兴见到你~`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      setUsername(storedUsername);
      // 添加欢迎消息
      setMessages([
        {
          id: Date.now(),
          sender: 'AI主播',
          content: `欢迎 ${storedUsername} 来到直播间！我是你的虚拟主播，很高兴见到你~`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [navigate]);

  // 检查模型文件是否存在
  useEffect(() => {
    if (!modelPath) return;
    
    const checkModelExists = async () => {
      try {
        setModelLoading(true);
        console.log(`尝试检查模型: ${modelPath}`);
        
        const response = await fetch(modelPath);
        if (response.ok) {
          console.log(`模型文件存在: ${modelPath}`);
          const jsonData = await response.json();
          console.log('模型配置:', jsonData);
          
          // 检查模型文件引用是否完整
          if (jsonData.FileReferences) {
            const { Moc, Textures, Physics } = jsonData.FileReferences;
            
            // 检查核心模型文件
            if (Moc) {
              const mocPath = modelPath.substring(0, modelPath.lastIndexOf('/') + 1) + Moc;
              try {
                const mocResponse = await fetch(mocPath);
                if (!mocResponse.ok) {
                  console.error(`模型核心文件不可访问: ${mocPath}`);
                }
              } catch (error) {
                console.error(`检查模型核心文件失败: ${error.message}`);
              }
            }
            
            // 检查纹理文件
            if (Textures && Textures.length > 0) {
              for (const texture of Textures) {
                const texturePath = modelPath.substring(0, modelPath.lastIndexOf('/') + 1) + texture;
                try {
                  const textureResponse = await fetch(texturePath);
                  if (!textureResponse.ok) {
                    console.error(`纹理文件不可访问: ${texturePath}`);
                  }
                } catch (error) {
                  console.error(`检查纹理文件失败: ${error.message}`);
                }
              }
            }
          }
        } else {
          console.error(`模型文件不存在: ${modelPath}, 状态: ${response.status}`);
        }
      } catch (error) {
        console.error(`检查模型文件失败: ${error.message}`);
      } finally {
        setModelLoading(false);
      }
    };
    
    checkModelExists();
  }, [modelPath]);

  // 设置模型引用
  const handleModelLoaded = (model) => {
    console.log('模型加载完成，接收到模型对象:', model);
    
    // 保存模型引用
    modelRef.current = model;
    
    // 添加调试信息，检查模型结构
    if (debugMode) {
      console.log('模型结构检查:');
      console.log('- model.expression 方法存在:', typeof model.expression === 'function');
      console.log('- model.motion 方法存在:', typeof model.motion === 'function');
      console.log('- model.internalModel 存在:', !!model.internalModel);
      
      if (model.internalModel) {
        console.log('- model.internalModel.settings 存在:', !!model.internalModel.settings);
        console.log('- model.internalModel.expressions 存在:', !!model.internalModel.expressions);
      }
    }
    
    // 启动随机眨眼
    const config = getModelConfig();
    if (config.enableBlinking && model && typeof model.expression === 'function') {
      console.log('启动随机眨眼');
      blinkTimerRef.current = startRandomBlinking(model, config.blinkInterval);
    } else {
      console.log('未启动随机眨眼，模型不支持或配置禁用');
    }
  };

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (blinkTimerRef.current) {
        clearInterval(blinkTimerRef.current);
      }
    };
  }, []);

  // 处理流式响应的回调函数
  const handleStreamChunk = (chunk, fullResponse) => {
    setStreamingMessage(fullResponse);
  };

  // 处理API设置保存
  const handleApiSettingsSave = (settings) => {
    if (settings.apiKey) {
      setApiProvider('huggingface');
      localStorage.setItem('api_provider', 'huggingface');
    }
  };

  // 切换API提供者
  const toggleApiProvider = () => {
    const newProvider = apiProvider === 'mock' ? 'huggingface' : 'mock';
    setApiProvider(newProvider);
    localStorage.setItem('api_provider', newProvider);
    
    // 如果切换到Hugging Face但没有API密钥，显示设置界面
    if (newProvider === 'huggingface' && !hasApiService()) {
      setShowSettings(true);
    }
  };

  // 处理消息发送
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: username,
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      isUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessage('');

    try {
      // 创建临时AI消息占位
      const tempAiMessageId = Date.now() + 1;
      const tempAiMessage = {
        id: tempAiMessageId,
        sender: 'AI主播',
        content: '...',
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true
      };
      
      setMessages(prevMessages => [...prevMessages, tempAiMessage]);
      
      // 获取聊天历史记录
      const chatHistory = messages.slice(-10);
      
      // 根据配置决定是否使用模拟API
      const config = getConfig();
      
      let aiResponse;
      
      // 根据API提供者选择不同的API调用方式
      if (apiProvider === 'huggingface') {
        // 使用Hugging Face API
        const selectedModel = localStorage.getItem('hf_model') || 'OpenAssistant/oasst-sft-1-pythia-12b';
        
        if (config.api.useStream) {
          // 使用流式API（模拟）
          setStreamingMessage('');
          aiResponse = await streamMessageFromHuggingFace(
            message, 
            username, 
            chatHistory, 
            handleStreamChunk,
            selectedModel
          );
        } else {
          // 使用普通API
          aiResponse = await sendMessageToHuggingFace(
            message, 
            username, 
            chatHistory,
            selectedModel
          );
        }
      } else {
        // 使用模拟API或默认API
        const useMock = shouldUseMockApi();
        
        if (config.api.useStream) {
          // 使用流式API
          setStreamingMessage('');
          
          if (useMock) {
            aiResponse = await mockStreamResponse(message, username, chatHistory, handleStreamChunk);
          } else {
            aiResponse = await streamMessageFromAI(message, username, chatHistory, handleStreamChunk);
          }
        } else {
          // 使用普通API
          if (useMock) {
            aiResponse = await mockAIResponse(message, username);
          } else {
            aiResponse = await sendMessageToAI(message, username, chatHistory);
          }
        }
      }
      
      // 更新消息内容
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempAiMessageId 
            ? { ...msg, content: aiResponse.content, isStreaming: false } 
            : msg
        )
      );
      
      // 处理语音合成
      const speechConfig = config.speech;
      if (speechConfig.enabled) {
        if (apiProvider === 'mock' && shouldUseMockApi()) {
          await mockSpeechSynthesis(aiResponse.content);
        } else {
          await speakText(aiResponse.content, speechConfig);
        }
      }
      
      // 处理模型表情和动作
      if (modelRef.current && config.model.enableExpression) {
        try {
          console.log('尝试应用表情和动作:', modelRef.current);
          
          // 解析表情和动作
          const { expression, motions } = parseExpressionFromMessage(aiResponse.content);
          
          // 检查模型类型并应用适当的方法
          if (typeof modelRef.current.expression === 'function') {
            // 直接使用模型方法
            if (expression) {
              console.log('应用表情:', expression);
              modelRef.current.expression(expression);
            }
            
            if (motions && motions.length > 0) {
              console.log('应用动作:', motions[0]);
              modelRef.current.motion(motions[0], 0);
            }
          } else if (modelRef.current.internalModel) {
            // 使用modelControlService
            const result = handleAIMessageExpression(modelRef.current, aiResponse.content);
            console.log('应用表情和动作结果:', result);
          } else {
            console.warn('模型不支持表情和动作功能');
          }
        } catch (expressionError) {
          console.error('应用表情和动作时出错:', expressionError);
        }
      }
    } catch (error) {
      console.error('处理AI响应失败:', error);
      
      // 添加错误消息
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now() + 2,
          sender: '系统',
          content: `处理消息时出错: ${error.message}`,
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        }
      ]);
    } finally {
      setIsProcessing(false);
      setStreamingMessage('');
    }
  };

  // 切换调试模式
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  // 开始语音识别
  const startSpeechRecognitionHandler = async () => {
    if (isListening) {
      console.warn('语音识别已经在进行中');
      return;
    }

    setIsListening(true);
    setRecognitionError('');
    setSpeechText('');

    try {
      if (apiProvider === 'mock' && shouldUseMockApi()) {
        // 使用模拟语音识别
        const result = await mockSpeechRecognition((data) => {
          console.log('模拟语音识别结果:', data);
          
          if (data.isFinal) {
            setSpeechText(data.finalTranscript);
            setMessage(data.finalTranscript);
            setIsListening(false);
          } else {
            setSpeechText(data.interimTranscript);
          }
        });
        
        console.log('模拟语音识别完成:', result);
      } else {
        // 使用真实语音识别
        speechRecognitionRef.current = await startSpeechRecognition(
          { 
            lang: 'zh-CN', 
            continuous: false, 
            interimResults: true 
          },
          (result) => {
            console.log('语音识别结果:', result);
            
            if (result.isFinal) {
              // 最终结果
              setSpeechText(result.finalTranscript);
              setMessage(result.finalTranscript);
              setIsListening(false);
            } else {
              // 中间结果
              setSpeechText(result.interimTranscript);
            }
          },
          (errorInfo) => {
            console.error('语音识别错误:', errorInfo);
            
            // 根据错误类型设置不同的错误信息
            if (typeof errorInfo === 'object' && errorInfo.message) {
              setRecognitionError(errorInfo.message);
              
              // 如果是可重试的错误，提供重试提示
              if (errorInfo.isRetryable) {
                setRecognitionError(`${errorInfo.message} (可点击重试)`);
              }
              
              // 如果是权限问题，提供帮助信息
              if (errorInfo.isPermissionIssue) {
                setRecognitionError(`${errorInfo.message}\n\n解决方法：\n1. 点击地址栏左侧的锁形图标\n2. 将麦克风权限设置为"允许"\n3. 刷新页面后重试`);
              }
            } else {
              // 兼容旧版本的错误处理
              setRecognitionError(`识别错误: ${errorInfo}`);
            }
            
            setIsListening(false);
            
            // 错误时重置语音识别实例，防止状态异常
            const errorCode = errorInfo.code || errorInfo;
            if (errorCode === 'network' || errorCode === 'aborted' || errorCode === 'service-not-available') {
              console.log('检测到网络或服务错误，重置语音识别实例');
              resetSpeechRecognition();
            }
          }
        );
      }
    } catch (error) {
      console.error('启动语音识别失败:', error);
      setRecognitionError(`启动失败: ${error.message}`);
      setIsListening(false);
    }
  };

  // 停止语音识别
  const stopSpeechRecognitionHandler = () => {
    if (!isListening) {
      console.warn('语音识别没有在进行中');
      return;
    }

    console.log('手动停止语音识别');
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    } else {
      stopSpeechRecognition();
    }
    
    setIsListening(false);
  };

  // 清理语音识别错误
  const clearRecognitionError = () => {
    setRecognitionError('');
  };

  return (
    <div className="live-page">
      <div className="live-container">
        <div className="model-container">
          {/* 添加背景 */}
          <LiveBackground type={backgroundType} src={backgroundSrc} />
          
          {/* 集成Live2D模型组件 */}
          {modelPath && (
            <Live2DModelComponent 
              modelPath={modelPath}
              width={window.innerWidth * 0.6}
              height={window.innerHeight - 150}
              onModelLoaded={handleModelLoaded}
            />
          )}
          
          {/* 调试信息 */}
          {debugMode && (
            <div className="debug-info">
              <p>当前模型路径: {modelPath}</p>
              <p>模型状态: {modelLoading ? '检查中...' : '已检查'}</p>
              <p>背景类型: {backgroundType}</p>
              <p>API模式: {apiProvider === 'mock' ? '模拟' : 'Hugging Face'}</p>
              <p>消息处理: {isProcessing ? '处理中...' : '空闲'}</p>
              <button onClick={toggleDebugMode}>隐藏调试信息</button>
            </div>
          )}
          
          {!debugMode && (
            <button className="debug-toggle" onClick={toggleDebugMode}>
              显示调试信息
            </button>
          )}
          
          {/* 设置按钮 */}
          <button className="settings-button" onClick={() => setShowSettings(true)}>
            API设置
          </button>
          
          {/* API切换按钮 */}
          <button 
            className="api-toggle-button" 
            onClick={toggleApiProvider}
            title={`当前API: ${apiProvider === 'mock' ? '模拟' : 'Hugging Face'}`}
          >
            {apiProvider === 'mock' ? '切换到Hugging Face' : '切换到模拟API'}
          </button>
        </div>
        
        <div className="chat-container">
          <div className="chat-header">
            <h2>直播间聊天</h2>
            <div className="online-status">
              <span className="status-dot"></span>
              在线
            </div>
          </div>
          
          <div className="messages-container">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.isUser ? 'user-message' : msg.isError ? 'error-message' : 'ai-message'}`}
              >
                <div className="message-header">
                  <span className="sender">{msg.sender}</span>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
                <div className="message-content">
                  {msg.isStreaming && streamingMessage ? streamingMessage : msg.content}
                </div>
              </div>
            ))}
            {/* 用于自动滚动到最新消息 */}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="message-form" onSubmit={handleSendMessage}>
            <div className="input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="发送消息给AI主播..."
                className="message-input"
                disabled={isProcessing}
              />
              
              {/* 语音输入按钮 */}
              {speechRecognitionSupported && (
                <button 
                  type="button"
                  className={`voice-input-button ${isListening ? 'listening' : ''}`}
                  onClick={isListening ? stopSpeechRecognitionHandler : startSpeechRecognitionHandler}
                  disabled={isProcessing}
                  title={isListening ? '点击停止语音识别' : '点击开始语音识别'}
                >
                  {isListening ? '🎙️' : '🎤'}
                </button>
              )}
              
              {/* 发送按钮 */}
              <button 
                type="submit" 
                className="send-button"
                disabled={isProcessing}
              >
                {isProcessing ? '处理中...' : '发送'}
              </button>
            </div>
            
            {/* 语音识别状态和错误显示 */}
            {isListening && (
              <div className="speech-status">
                <span className="listening-indicator">🎙️ 正在听取语音...</span>
                {speechText && <span className="speech-text">识别中: {speechText}</span>}
              </div>
            )}
            
            {recognitionError && (
              <div className="speech-error">
                <span className="error-text">⚠️ {recognitionError}</span>
                <button 
                  type="button" 
                  className="clear-error-button"
                  onClick={clearRecognitionError}
                >
                  清除
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* API设置组件 */}
      <ApiSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onSave={handleApiSettingsSave}
      />
    </div>
  );
};

export default LivePage; 
