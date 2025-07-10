// API服务配置
const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

/**
 * 发送消息到AI API并获取响应
 * @param {string} message - 用户发送的消息
 * @param {string} username - 用户名
 * @param {Array} chatHistory - 聊天历史记录，用于提供上下文
 * @returns {Promise} - 返回AI响应的Promise
 */
export const sendMessageToAI = async (message, username, chatHistory = []) => {
  try {
    // 构建请求体
    const requestBody = {
      message,
      username,
      chatHistory: chatHistory.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }))
    };

    // 发送请求到API
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('发送消息到AI失败:', error);
    throw error;
  }
};

/**
 * 使用流式API获取AI响应
 * @param {string} message - 用户发送的消息
 * @param {string} username - 用户名
 * @param {Array} chatHistory - 聊天历史记录
 * @param {Function} onChunk - 处理每个响应块的回调函数
 * @returns {Promise} - 返回完整响应的Promise
 */
export const streamMessageFromAI = async (message, username, chatHistory = [], onChunk) => {
  try {
    // 构建请求体
    const requestBody = {
      message,
      username,
      chatHistory: chatHistory.slice(-10).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      stream: true
    };

    // 发送请求到流式API
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    // 处理流式响应
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      fullResponse += chunk;
      
      // 调用回调函数处理每个响应块
      if (onChunk && typeof onChunk === 'function') {
        onChunk(chunk, fullResponse);
      }
    }

    return { content: fullResponse };
  } catch (error) {
    console.error('流式获取AI响应失败:', error);
    throw error;
  }
};

/**
 * 获取模型表情和动作控制信息
 * @param {string} message - AI响应的消息
 * @returns {Promise} - 返回表情和动作控制信息的Promise
 */
export const getExpressionControl = async (message) => {
  try {
    const response = await fetch(`${API_URL}/expression`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`表情API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取表情控制失败:', error);
    return { expression: 'neutral', motions: [] }; // 返回默认表情
  }
};

/**
 * 模拟API响应（开发环境使用）
 * @param {string} message - 用户发送的消息
 * @param {string} username - 用户名
 * @returns {Promise} - 返回模拟AI响应的Promise
 */
export const mockAIResponse = async (message, username) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 根据用户消息生成简单的模拟响应
  let response = `你好，${username}！我收到了你的消息："${message}"。`;
  
  // 添加一些随机回复变化
  const responses = [
    `这是一个有趣的问题！让我思考一下...`,
    `谢谢你的消息！作为虚拟主播，我很高兴能和你聊天。`,
    `我理解你的意思了。作为AI，我会尽力提供帮助。`,
    `这是个好问题！我需要更多信息才能给你完整的回答。`,
    `我很喜欢和你聊天！有什么其他话题你想讨论吗？`
  ];
  
  response += ' ' + responses[Math.floor(Math.random() * responses.length)];
  
  return { content: response };
};

/**
 * 模拟流式API响应（开发环境使用）
 * @param {string} message - 用户发送的消息
 * @param {string} username - 用户名
 * @param {Array} chatHistory - 聊天历史记录
 * @param {Function} onChunk - 处理每个响应块的回调函数
 * @returns {Promise} - 返回完整响应的Promise
 */
export const mockStreamResponse = async (message, username, chatHistory = [], onChunk) => {
  // 生成模拟响应
  let response = `你好，${username}！我收到了你的消息："${message}"。`;
  
  // 添加一些随机回复变化
  const responses = [
    `这是一个有趣的问题！让我思考一下...`,
    `谢谢你的消息！作为虚拟主播，我很高兴能和你聊天。`,
    `我理解你的意思了。作为AI，我会尽力提供帮助。`,
    `这是个好问题！我需要更多信息才能给你完整的回答。`,
    `我很喜欢和你聊天！有什么其他话题你想讨论吗？`
  ];
  
  response += ' ' + responses[Math.floor(Math.random() * responses.length)];
  
  // 将响应拆分成多个块，模拟流式传输
  const chunks = [];
  let currentChunk = '';
  const words = response.split(' ');
  
  for (const word of words) {
    currentChunk += word + ' ';
    if (currentChunk.length > 10 || word === words[words.length - 1]) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }
  
  // 模拟流式传输
  let fullResponse = '';
  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(resolve, 200)); // 每200毫秒发送一个块
    fullResponse += chunk;
    
    if (onChunk && typeof onChunk === 'function') {
      onChunk(chunk, fullResponse);
    }
  }
  
  return { content: fullResponse };
}; 