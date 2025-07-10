⏺ Update Todos
  ⎿  ☐ 阶段1: 创建新的目录结构框架                 
     ☐ 阶段2: 重构后端核心模块 (backend/core/)
     ☐ 阶段3: 重构后端AI模块 (backend/ai/)
     ☐ 阶段4: 重构后端语音模块 (backend/voice/)
     ☐ 阶段10: 验证重构完整性和功能测试
     ☐ 阶段5: 重构后端Live2D模块 (backend/live2d/)
     ☐ 阶段6: 重构前端结构 (frontend/)
     ☐ 阶段7: 整理开发工具和测试 (scripts/, tests/)
     ☐ 阶段9: 更新配置和启动脚本
     ☐ 阶段8: 整理文档和数据结构 (docs/, data/)

⏺ 🚀 AI心理医生项目 - 渐进式重构任务计划

  基于Program.md中的新项目结构设计，我为你制定了一个10个阶段的重构
  计划，每个阶段都是独立可执行的，可以保证项目在重构过程中始终保持
  可运行状态。

  📋 重构任务概览

  🎯 目标: 将当前项目重构为更加模块化、逻辑清晰的新结构
  ⚡ 策略: 渐进式重构，每个阶段独立完成，保证项目可用性
  📁 新结构: 按功能模块分层，前后端分离，开发友好

  🔄 具体重构阶段

  阶段1: 创建新的目录结构框架 🏗️

  - 创建backend/, frontend/, scripts/, tests/, docs/,
  data/等核心目录
  - 建立新的目录树骨架，为后续迁移做准备
  - 风险: 低，只是创建目录结构

  阶段2: 重构后端核心模块 (backend/core/) ⚙️

  - 迁移server.py → backend/core/server.py
  - 迁移config.py → backend/core/config.py
  - 迁移routes.py → backend/core/routes.py
  - 重点: 保持导入路径兼容性

  阶段3: 重构后端AI模块 (backend/ai/) 🤖

  - 迁移llm_manager.py → backend/ai/llm_manager.py
  - 迁移qwen_client.py → backend/ai/qwen_client.py
  - 迁移chat_history.py → backend/ai/chat_history.py
  - 重点: AI对话逻辑集中管理

  阶段4: 重构后端语音模块 (backend/voice/) 🔊

  - 迁移tts_manager.py → backend/voice/tts_manager.py
  - 迁移asr_manager.py → backend/voice/asr_manager.py
  - 迁移sovits_inference_engine.py →
  backend/voice/sovits_inference_engine.py
  - 迁移voice_api.py → backend/voice/voice_api.py
  - 重点: 语音相关功能统一管理

  阶段5: 重构后端Live2D模块 (backend/live2d/) 🎭

  - 迁移live2d_model.py → backend/live2d/live2d_model.py
  - 创建model_controller.py用于模型控制逻辑
  - 重点: Live2D相关功能模块化

  阶段6: 重构前端结构 (frontend/) 🎨

  - 迁移src/ → frontend/src/
  - 迁移public/ → frontend/public/
  - 更新前端构建配置和导入路径
  - 重点: 前端独立化，便于开发

  阶段7: 整理开发工具和测试 (scripts/, tests/) 🔧

  - 迁移所有脚本文件到scripts/目录
  - 重组测试文件到tests/目录，按功能模块分类
  - 重点: 开发工具统一管理

  阶段8: 整理文档和数据结构 (docs/, data/) 📚

  - 重组文档文件到docs/目录
  - 创建data/目录管理数据文件
  - 创建临时文件管理机制
  - 重点: 文档系统化，数据管理规范化

  阶段9: 更新配置和启动脚本 ⚙️

  - 更新所有导入路径
  - 修改启动脚本适配新结构
  - 更新配置文件路径引用
  - 重点: 确保项目正常启动

  阶段10: 验证重构完整性和功能测试 ✅

  - 全面测试所有功能模块
  - 修复重构过程中的问题
  - 验证性能和稳定性
  - 重点: 确保重构后功能完整

  🎛️ 使用方式

  你可以通过以下方式指导我完成重构:

  1. 逐阶段执行: "开始阶段1" - 我会执行对应阶段的重构
  2. 查看进度: "查看重构进度" - 我会显示当前完成情况
  3. 跳过阶段: "跳过阶段X，开始阶段Y" - 可以灵活调整执行顺序
  4. 详细执行: "详细执行阶段X" - 我会展示该阶段的详细步骤

  🔒 安全保障

  - 备份机制: 重构前会保留原文件备份
  - 渐进式: 每阶段独立，可随时停止和恢复
  - 向后兼容: 保持旧的导入路径在过渡期可用
  - 测试验证: 每个阶段完成后进行功能验证

  💡 优势特点

  ✅ 模块化: 按功能清晰分组，便于开发和维护✅ 可扩展:
  新结构更易于添加新功能✅ 团队协作: 前后端分离，便于多人开发✅
  标准化: 遵循软件工程最佳实践

  请告诉我你想从哪个阶段开始重构！ 🚀