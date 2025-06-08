/**
 * Hugging Face API代理Worker
 * 用于解决CORS问题并保护API密钥
 */

// 定义CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// 从环境变量获取API密钥，如果不存在则使用默认值（仅用于测试）
const API_KEY = HUGGINGFACE_API_KEY || "YOUR_HUGGING_FACE_API_KEY";

// 允许的域名列表（为了安全，限制只有特定域名可以使用此Worker）
const ALLOWED_ORIGINS = [
  "https://virtual-ai-streamer-git-main-tsurumiyakawas-projects.vercel.app",
  "https://broad-surf-db28.3485573766.workers.dev",
  "https://virtual-ai-streamer.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

// 处理CORS预检请求
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// 添加CORS头到响应
function addCorsHeaders(response) {
  const newHeaders = new Headers(response.headers);
  Object.keys(corsHeaders).forEach(key => {
    newHeaders.set(key, corsHeaders[key]);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// 主事件监听器
addEventListener('fetch', event => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleCORS());
    return;
  }
  
  event.respondWith(handleRequest(event.request));
});

// 主请求处理函数
async function handleRequest(request) {
  try {
    // 获取请求源
    const origin = request.headers.get("Origin") || "*";
    
    // 验证源是否允许访问
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || 
                           origin === "*" || 
                           origin.includes("localhost") ||
                           origin.includes("3485573766.workers.dev") ||
                           origin.includes("virtual-ai-streamer");
                           
    if (!isAllowedOrigin) {
      return addCorsHeaders(new Response(JSON.stringify({ 
        error: "未授权的域名", 
        origin: origin 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    // 允许GET和POST请求
    if (request.method !== 'GET' && request.method !== 'POST') {
      return addCorsHeaders(new Response(JSON.stringify({ 
        error: 'Method Not Allowed',
        message: '仅支持GET和POST请求'
      }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    if (request.method === 'GET') {
      // GET请求返回状态信息
      return addCorsHeaders(new Response(JSON.stringify({ 
        status: 'ok',
        message: 'Hugging Face API代理正常运行中',
        apiKeyConfigured: API_KEY !== "YOUR_HUGGING_FACE_API_KEY",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // 处理POST请求
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return addCorsHeaders(new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        message: '请求体必须是有效的JSON格式'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    const { modelId, inputs } = requestData;
    
    if (!modelId || !inputs) {
      return addCorsHeaders(new Response(JSON.stringify({ 
        error: 'Missing required fields',
        message: '请求必须包含modelId和inputs字段'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // 调用Hugging Face API
    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(inputs)
      }
    );

    // 处理响应
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return addCorsHeaders(new Response(JSON.stringify({ 
        error: `Hugging Face API error: ${hfResponse.status}`,
        details: errorText
      }), {
        status: hfResponse.status,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // 获取并处理响应
    const responseText = await hfResponse.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      data = { generated_text: responseText };
    }

    return addCorsHeaders(new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch (error) {
    return addCorsHeaders(new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || '处理请求时发生内部错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
} 