/**
 * Live2D模型预加载脚本
 * 用于预先加载Live2D模型资源，避免在显示模型时出现延迟
 */

// 模型配置
const MODEL_CONFIG = {
    // 模型路径
    MODEL_PATH: '/live2d/models/wuwuwu/wuwuwu.model3.json',
    // 模型名称
    MODEL_NAME: 'wuwuwu',
    // 表情列表
    EXPRESSIONS: ['neutral', 'happy', 'sad', 'angry', 'surprised'],
    // 背景图片
    BACKGROUND: '/backgrounds/default.jpg'
};

// 预加载资源列表
const PRELOAD_RESOURCES = [
    // Live2D核心库
    '/libs/live2d.min.js',
    '/libs/cubism4/live2dcubismcore.min.js',
    '/libs/pixi.min.js',
    '/libs/pixi-live2d-display.min.js',

    // 模型JSON
    MODEL_CONFIG.MODEL_PATH,

    // 其他资源可以在这里添加
];

// 已加载资源计数
let loadedResources = 0;

/**
 * 预加载单个资源
 * @param {string} url - 资源URL
 * @param {Function} callback - 加载完成回调
 */
function preloadResource(url, callback) {
    console.log(`预加载资源: ${url}`);

    // 根据资源类型选择不同的加载方式
    if (url.endsWith('.js')) {
        // 加载JavaScript
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            console.log(`JavaScript已加载: ${url}`);
            callback();
        };
        script.onerror = (error) => {
            console.error(`加载JavaScript失败: ${url}`, error);
            callback();
        };
        document.head.appendChild(script);
    } else if (url.endsWith('.json')) {
        // 加载JSON
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP错误, 状态: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`JSON已加载: ${url}`);
                // 预加载JSON中引用的资源
                preloadJsonReferences(url, data);
                callback();
            })
            .catch(error => {
                console.error(`加载JSON失败: ${url}`, error);
                callback();
            });
    } else if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.webp')) {
        // 加载图片
        const img = new Image();
        img.src = url;
        img.onload = () => {
            console.log(`图片已加载: ${url}`);
            callback();
        };
        img.onerror = (error) => {
            console.error(`加载图片失败: ${url}`, error);
            callback();
        };
    } else {
        // 其他资源类型，使用fetch加载
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP错误, 状态: ${response.status}`);
                }
                console.log(`资源已加载: ${url}`);
                callback();
            })
            .catch(error => {
                console.error(`加载资源失败: ${url}`, error);
                callback();
            });
    }
}

/**
 * 预加载JSON中引用的资源
 * @param {string} baseUrl - 基础URL
 * @param {Object} jsonData - JSON数据
 */
function preloadJsonReferences(baseUrl, jsonData) {
    // 对于Live2D模型JSON，预加载其引用的资源
    if (jsonData.FileReferences) {
        const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);

        // 预加载模型文件
        if (jsonData.FileReferences.Moc) {
            const mocUrl = basePath + jsonData.FileReferences.Moc;
            PRELOAD_RESOURCES.push(mocUrl);
        }

        // 预加载纹理
        if (jsonData.FileReferences.Textures && Array.isArray(jsonData.FileReferences.Textures)) {
            jsonData.FileReferences.Textures.forEach(texture => {
                const textureUrl = basePath + texture;
                PRELOAD_RESOURCES.push(textureUrl);
            });
        }

        // 预加载物理文件
        if (jsonData.FileReferences.Physics) {
            const physicsUrl = basePath + jsonData.FileReferences.Physics;
            PRELOAD_RESOURCES.push(physicsUrl);
        }

        // 预加载表情文件
        if (jsonData.FileReferences.Expressions && Array.isArray(jsonData.FileReferences.Expressions)) {
            jsonData.FileReferences.Expressions.forEach(expression => {
                const expressionUrl = basePath + expression.File;
                PRELOAD_RESOURCES.push(expressionUrl);
            });
        }
    }
}

/**
 * 开始预加载所有资源
 */
function startPreload() {
    console.log('开始预加载资源...');

    // 移除重复的资源
    const uniqueResources = [...new Set(PRELOAD_RESOURCES)];
    const totalResources = uniqueResources.length;

    console.log(`需要加载 ${totalResources} 个资源`);

    // 更新加载进度回调
    const updateProgress = () => {
        loadedResources++;

        // 计算加载进度
        const progress = Math.floor((loadedResources / totalResources) * 100);
        console.log(`加载进度: ${progress}%`);

        // 如果存在进度元素，更新它
        const progressElement = document.getElementById('loading-progress');
        if (progressElement) {
            progressElement.textContent = `${progress}%`;
        }

        // 检查是否所有资源都已加载
        if (loadedResources >= totalResources) {
            console.log('所有资源加载完成!');
            // 触发加载完成事件
            document.dispatchEvent(new Event('live2d-preload-complete'));
        }
    };

    // 依次预加载每个资源
    uniqueResources.forEach(url => {
        preloadResource(url, updateProgress);
    });
}

// 当DOM内容加载完成后开始预加载
document.addEventListener('DOMContentLoaded', startPreload);

// 导出配置和函数以供其他脚本使用
window.LIVE2D_CONFIG = MODEL_CONFIG;
window.LIVE2D_PRELOAD = {
    startPreload,
    preloadResource,
    isComplete: () => loadedResources >= PRELOAD_RESOURCES.length
};