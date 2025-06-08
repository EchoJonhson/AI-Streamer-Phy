/**
 * Hugging Face API代理Worker
 * 用于解决CORS问题并保护API密钥
 */

// 设置您的Hugging Face API密钥（请在实际部署前替换）
const HF_API_KEY = "YOUR_HUGGING_FACE_API_KEY"; // 上线前替换为真实密钥

// 允许的域名列表（为了安全，限制只有特定域名可以使用此Worker）
const ALLOWED_ORIGINS = [
  "https://virtual-ai-streamer-git-main-tsurumiyakawas-projects.vercel.app",
  "https://broad-surf-db28.3485573766.workers.dev",
  "http://localhost:3000",
  "http://localhost:5173"
];

/**
 * 处理请求的主函数
 * @param {Request} request - 客户端请求
 */
async function handleRequest(request) {
  // 获取请求源
  const origin = request.headers.get("Origin") || "*";
  
  // 处理预检请求
  if (request.method === "OPTIONS") {
    return handleCORS(request);
  }
  
  // 验证源是否允许访问
  if (!ALLOWED_ORIGINS.includes(origin) && origin !== "*" && !origin.includes("localhost")) {
    return new Response(JSON.stringify({ error: "未授权的域名" }), {
      status: 403,
      headers: getCORSHeaders(origin)
    });
  }
  
  try {
    // 确保是POST请求
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "仅支持POST请求" }), {
        status: 405,
        headers: getCORSHeaders(origin)
      });
    }
    
    // 解析请求数据
    let requestData;
    try {
      requestData = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "无效的JSON数据" }), {
        status: 400,
        headers: getCORSHeaders(origin)
      });
    }
    
    // 从请求中获取模型ID
    const modelId = requestData.modelId || "OpenAssistant/oasst-sft-1-pythia-12b";
    
    // 构建Hugging Face API请求
    const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_API_KEY}`
      },
      body: JSON.stringify(requestData.inputs)
    });
    
    // 处理Hugging Face API响应
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return new Response(JSON.stringify({ 
        error: "Hugging Face API error: " + hfResponse.status,
        details: errorText
      }), {
        status: hfResponse.status,
        headers: getCORSHeaders(origin)
      });
    }
    
    // 获取API响应数据
    const data = await hfResponse.json();
    
    // 返回结果
    return new Response(JSON.stringify(data), {
      headers: getCORSHeaders(origin)
    });
    
  } catch (error) {
    // 处理错误
    return new Response(JSON.stringify({ 
      error: "Worker处理请求时出错", 
      message: error.message 
    }), {
      status: 500,
      headers: getCORSHeaders(origin)
    });
  }
}

/**
 * 处理CORS预检请求
 */
function handleCORS(request) {
  const origin = request.headers.get("Origin") || "*";
  
  // 返回CORS预检响应
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    }
  });
}

/**
 * 获取CORS响应头
 */
function getCORSHeaders(origin) {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

// 注册fetch事件处理程序
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
}); 