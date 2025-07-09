"""
后端核心服务模块

包含：
- server: 主服务器和WebSocket处理
- config: 配置管理
- routes: 路由系统
- websocket_handler: WebSocket处理器
"""

# 导出主要类和函数，便于外部使用
# 暂时注释掉依赖其他模块的导入，等待后续重构阶段完成
# from .server import AIVTuberServer, create_app
from .config import ConfigManager
# from .routes import init_client_ws_route, init_webtool_routes
# from .websocket_handler import WebSocketHandler, MessageType

__all__ = [
    # 暂时只导出已迁移且可用的模块
    'ConfigManager',
    # 'AIVTuberServer',
    # 'create_app', 
    # 'init_client_ws_route',
    # 'init_webtool_routes',
    # 'WebSocketHandler',
    # 'MessageType'
]