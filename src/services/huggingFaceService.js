/**
 * Hugging Face API服务
 * 用于与OpenAssistant等模型交互
 */

// 默认模型ID
const DEFAULT_MODEL = 'OpenAssistant/oasst-sft-1-pythia-12b';

// Cloudflare Worker URL - 替换为您的Worker URL
const WORKER_URL = 'https://broad-surf-db28.3485573766.workers.dev';

/**
 * 从本地存储获取API密钥
 * @returns {string} API密钥
 */
const getApiKey = () => {
  return localStorage.getItem('hf_api_key') || '';
};

/**
 * 设置API密钥到本地存储
 * @param {string} key - API密钥
 */
export const setApiKey = (key) => {
  localStorage.setItem('hf_api_key', key);
};

/**
 * 检查是否已设置API密钥
 * @returns {boolean} 是否已设置API密钥
 */
export const hasApiKey = () => {
  // 由于我们现在使用Worker，不再需要前端存储API密钥
  // 但保留此函数以保持兼容性，返回true表示"已配置"
  return true;
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

    try {
      // 首先尝试使用默认模式
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
      
      // 尝试备用模式: 使用no-cors模式
      try {
        console.log('尝试使用no-cors模式请求API');
        // 注意: no-cors模式只能用于简单请求，且无法读取响应内容
        await fetch(WORKER_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        return { 
          content: '请求已发送，但由于CORS限制，无法读取响应。这是一个模拟响应: "我是一个AI助手，很高兴为您服务。您可以问我任何问题，我会尽力回答。"' 
        };
      } catch (noCorsError) {
        console.warn('无法连接到API服务器:', noCorsError);
        // 使用模拟数据
        return { 
          content: '无法连接到API服务器。这是一个模拟响应: "我是一个AI助手，很高兴为您服务。您可以问我任何问题，我会尽力回答。"' 
        };
      }
    }
  } catch (error) {
    console.error('Hugging Face API调用失败:', error);
    // 返回错误消息而不是抛出异常，以防止UI崩溃
    return { 
      content: `处理请求时出错: ${error.message}. 请尝试使用模拟API模式或检查网络连接。` 
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