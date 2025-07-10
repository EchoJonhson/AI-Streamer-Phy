/**
 * Hugging Face API服务
 * 用于与OpenAssistant等模型交互
 * 通过Cloudflare Worker代理调用API，确保API密钥安全
 */

// 默认模型ID
const DEFAULT_MODEL = 'OpenAssistant/oasst-sft-1-pythia-12b';

// Cloudflare Worker URL - 不再使用/api路径
const USE_MOCK_API = false;
const WORKER_URL = 'https://broad-surf-db28.3485573766.workers.dev';

/**
 * 检查是否已配置API服务
 * @returns {boolean} 是否已配置API服务
 */
export const hasApiService = () => {
  // Worker URL已配置，返回true
  return WORKER_URL !== 'https://your-worker-url.workers.dev';
};

/**
 * 发送消息到Hugging Face模型
 * @param {string} message - 用户消息
 * @param {string} username - 用户名
 * @param {Array} chatHistory - 聊天历史
 * @param {string} modelId - 模型ID（可选）
 * @returns {Promise} 返回模型响应
 */
export const sendMessageToHuggingFace = async (message, username, chatHistory = [], modelId = DEFAULT_MODEL) => {
  try {
    // 如果启用了模拟API模式，直接返回模拟响应
    if (USE_MOCK_API) {
      console.log('使用模拟API模式');
      const responses = [
        `你好，${username || '用户'}！我是虚拟AI主播，很高兴为你服务。`,
        `你的消息"${message}"已收到。作为AI虚拟主播，我可以陪你聊天、回答问题。`,
        `这是一个模拟响应。在实际部署中，你需要配置Hugging Face API密钥和Cloudflare Worker。`,
        `我正在思考你说的"${message}"。这是一个有趣的话题，我们可以继续讨论。`,
        `谢谢你的提问！关于"${message}"，我有一些想法可以分享。`
      ];
      
      // 随机选择一个响应
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return { content: randomResponse };
    }
    
    // 构建对话历史
    const pastUserInputs = [];
    const generatedResponses = [];
    
    // 处理聊天历史
    chatHistory.forEach(msg => {
      if (msg.isUser) {
        pastUserInputs.push(msg.content);
      } else {
        generatedResponses.push(msg.content);
      }
    });

    // 构建请求体
    const requestBody = {
      modelId: modelId,
      inputs: {
        past_user_inputs: pastUserInputs,
        generated_responses: generatedResponses,
        text: message,
        parameters: {
          temperature: 0.7,
          max_new_tokens: 512,
          do_sample: true
        }
      }
    };

    // 在请求前先验证Worker是否可访问
    try {
      const statusCheck = await fetch(WORKER_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!statusCheck.ok) {
        console.warn(`Worker状态检查失败: ${statusCheck.status}`);
      } else {
        const statusData = await statusCheck.json();
        console.log('Worker状态:', statusData);
      }
    } catch (statusError) {
      console.warn('Worker状态检查失败:', statusError);
    }

    try {
      // 首先尝试使用默认模式
      console.log('正在向Worker发送请求:', WORKER_URL);
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn('API响应不是有效的JSON格式:', jsonError);
        // 如果响应不是JSON，使用纯文本
        const text = await response.text();
        data = { generated_text: text || '服务器返回了非JSON响应' };
      }
      
      return { content: data.generated_text || '无响应' };
    } catch (fetchError) {
      console.warn('API请求失败，尝试兼容模式:', fetchError);
      
      // 启用模拟API模式返回响应
      console.log('由于API请求失败，使用模拟响应');
      const mockResponses = [
        `你好，${username || '用户'}！我是虚拟AI主播，很高兴为你服务。`,
        `你的消息"${message}"已收到。由于API暂时不可用，我只能提供简单回复。`,
        `API服务器暂时无法连接，请稍后再试。这是一个模拟响应。`,
        `我正在思考你说的"${message}"。目前API连接有问题，无法提供完整回答。`,
        `谢谢你的提问！但是我现在无法连接到AI服务器，只能提供预设回复。`
      ];
      
      // 随机选择一个响应
      const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      return { content: mockResponse };
    }
  } catch (error) {
    console.error('Hugging Face API调用失败:', error);
    // 返回错误消息而不是抛出异常，以防止UI崩溃
    return { 
      content: `处理请求时出错: ${error.message}. 请检查网络连接或Cloudflare Worker配置。` 
    };
  }
};

/**
 * 使用流式API获取模型响应（模拟流式响应）
 * @param {string} message - 用户消息
 * @param {string} username - 用户名
 * @param {Array} chatHistory - 聊天历史
 * @param {Function} onChunk - 处理每个响应块的回调函数
 * @param {string} modelId - 模型ID（可选）
 * @returns {Promise} 返回完整响应
 */
export const streamMessageFromHuggingFace = async (message, username, chatHistory = [], onChunk, modelId = DEFAULT_MODEL) => {
  try {
    // 获取完整响应
    const response = await sendMessageToHuggingFace(message, username, chatHistory, modelId);
    const fullText = response.content;
    
    // 模拟流式响应
    const words = fullText.split(' ');
    let currentText = '';
    
    // 每个词逐步返回
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 每100ms返回一个词
      currentText += word + ' ';
      
      if (onChunk && typeof onChunk === 'function') {
        onChunk(word + ' ', currentText);
      }
    }
    
    return { content: fullText };
  } catch (error) {
    console.error('Hugging Face 流式API调用失败:', error);
    // 返回错误消息而不是抛出异常
    const errorMessage = '由于网络问题或CORS限制，无法使用流式API。请尝试使用模拟API或检查网络连接。';
    if (onChunk && typeof onChunk === 'function') {
      onChunk(errorMessage, errorMessage);
    }
    return { content: errorMessage };
  }
};

/**
 * 获取可用模型列表
 * @returns {Promise} 返回模型列表
 */
export const getAvailableModels = async () => {
  try {
    // 返回预定义的模型列表，因为Worker不支持获取模型列表
    return [
      { id: 'OpenAssistant/oasst-sft-1-pythia-12b', name: 'OpenAssistant Pythia-12B' },
      { id: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', name: 'OpenAssistant Pythia-12B (3.5)' },
      { id: 'facebook/opt-350m', name: 'OPT-350M (更快)' }
    ];
  } catch (error) {
    console.error('获取模型列表失败:', error);
    return [
      { id: 'OpenAssistant/oasst-sft-1-pythia-12b', name: 'OpenAssistant Pythia-12B' },
      { id: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', name: 'OpenAssistant Pythia-12B (3.5)' },
      { id: 'facebook/opt-350m', name: 'OPT-350M (更快)' }
    ];
  }
}; 