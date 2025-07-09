"""
向后兼容性模块 - 核心服务模块导入别名

这个文件提供了向后兼容的导入别名，让旧的导入路径仍然可以工作。
在重构完成后，建议更新所有导入路径到新的结构。
"""

# 警告：这些导入是为了向后兼容性，建议使用新的导入路径
import warnings

# 核心服务模块的新导入路径
from backend.core.server import *
from backend.core.config import *
from backend.core.routes import *
from backend.core.websocket_handler import *

# 发出向后兼容性警告
warnings.warn(
    "使用了向后兼容的导入路径。建议更新为新的导入路径:\n"
    "- backend.core.server\n"
    "- backend.core.config\n"
    "- backend.core.routes\n"
    "- backend.core.websocket_handler",
    DeprecationWarning,
    stacklevel=2
)