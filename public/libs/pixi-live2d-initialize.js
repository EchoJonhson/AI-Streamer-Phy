/**
 * PIXI与Live2D的集成初始化脚本
 * 用于正确配置和启动PIXI与Live2D框架
 */

// 检查必要的依赖库是否已加载
function checkDependencies() {
    if (!window.PIXI) {
        console.error('PIXI.js未加载，无法初始化Live2D');
        return false;
    }

    if (!window.PIXI.live2d) {
        console.error('PIXI Live2D插件未加载，无法初始化Live2D');
        return false;
    }

    if (!window.Live2DCubismCore) {
        console.error('Live2D Cubism Core未加载，无法初始化Live2D');
        return false;
    }

    return true;
}

// 修复常见的浏览器兼容性问题
function fixCompatibilityIssues() {
    // 修复PIXI.js中的一些兼容性问题
    if (window.PIXI && window.PIXI.utils) {
        // 确保skipHello方法存在
        if (!window.PIXI.utils.skipHello) {
            window.PIXI.utils.skipHello = function() {};
        }

        // 调用skipHello，禁用PIXI的问候消息
        window.PIXI.utils.skipHello();
    }

    // 修复PIXI WebGL着色器检查问题
    if (window.PIXI && window.PIXI.glCore && window.PIXI.glCore.shader) {
        const originalCheckMaxIfStatementsInShader = window.PIXI.glCore.shader.checkMaxIfStatementsInShader;
        window.PIXI.glCore.shader.checkMaxIfStatementsInShader = function(shader) {
            try {
                return originalCheckMaxIfStatementsInShader.call(this, shader);
            } catch (e) {
                console.warn('WebGL着色器检查失败，使用默认值:', e);
                return 0;
            }
        };
    }
}

// 初始化PIXI Live2D框架
function initializePIXILive2D() {
    if (!checkDependencies()) {
        return;
    }

    // 修复兼容性问题
    fixCompatibilityIssues();

    // 配置PIXI应用
    const options = {
        autoStart: true,
        width: window.innerWidth,
        height: window.innerHeight,
        view: document.getElementById('live2d-canvas'),
        transparent: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance'
    };

    // 配置PIXI Live2D插件
    try {
        // 设置Cubism框架
        PIXI.live2d.config.cubism4.setWasmUrl('/libs/cubism4/live2dcubismcore.wasm');
        PIXI.live2d.config.cubism4.setLoggingFunction(log => console.log(log));
        PIXI.live2d.config.cubism4.setErrorHandler(error => console.error(error));

        // 设置Live2D框架
        PIXI.live2d.config.setLogFunction(log => console.log(log));
        PIXI.live2d.config.setErrorHandler(error => console.error(error));
        PIXI.live2d.config.setMocPath('/live2d/models/');

        // 设置资源缓存
        PIXI.live2d.config.setResourcesPath('/live2d/resources/');
        PIXI.live2d.config.setMaskCacheEnabled(true);

        console.log('PIXI Live2D框架配置完成');
    } catch (error) {
        console.error('配置PIXI Live2D框架时出错:', error);
    }

    // 创建全局PIXI应用实例
    try {
        window.live2dApp = new PIXI.Application(options);
        console.log('PIXI应用创建成功');

        // 通知应用PIXI已准备就绪
        window.dispatchEvent(new CustomEvent('pixi-live2d-ready', {
            detail: {
                app: window.live2dApp
            }
        }));
    } catch (error) {
        console.error('创建PIXI应用时出错:', error);
    }
}

// 在window对象上暴露公共方法
window.PIXILive2D = {
    initialize: initializePIXILive2D,
    checkDependencies: checkDependencies,
    fixCompatibilityIssues: fixCompatibilityIssues
};

// 如果所有必要的脚本都已加载，则自动初始化
document.addEventListener('live2d-preload-complete', () => {
    console.log('所有Live2D依赖加载完成，开始初始化PIXI Live2D框架');
    initializePIXILive2D();
});

// 如果未配置预加载，则在页面加载完成后检查是否可以初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已经通过预加载完成初始化
    if (!window.LIVE2D_PRELOAD && checkDependencies()) {
        console.log('未使用预加载，直接初始化PIXI Live2D框架');
        initializePIXILive2D();
    }
});

// 处理窗口大小调整
window.addEventListener('resize', () => {
    if (window.live2dApp) {
        window.live2dApp.renderer.resize(window.innerWidth, window.innerHeight);

        // 通知应用窗口大小已调整
        window.dispatchEvent(new CustomEvent('pixi-live2d-resize', {
            detail: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }));
    }
});