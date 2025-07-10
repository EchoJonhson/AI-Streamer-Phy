# 项目测试目录

这个目录包含了AI-Streamer-Phy项目的所有测试文件，按功能模块分类管理。

## 测试目录结构

```
tests/
├── ai/                    # AI模块测试
│   └── test_qwen_integration.py
├── voice/                 # 语音模块测试
│   ├── test_pretrained_sovits.py
│   ├── test_sovits_inference.py
│   ├── test_sovits_only.py
│   ├── test_sovits_system.py
│   ├── test_training_workflow.py
│   └── test_user_models.py
├── frontend/              # 前端模块测试
│   └── test_frontend_backend.py
├── config/                # 配置模块测试
│   ├── test_arona_config.py
│   └── test_arona_fixed.py
└── integration/           # 集成测试
    └── (预留)
```

## 测试模块说明

### AI模块测试 (tests/ai/)
- `test_qwen_integration.py` - 测试Qwen AI模型集成功能

### 语音模块测试 (tests/voice/)
- `test_pretrained_sovits.py` - 测试预训练SoVITS模型
- `test_sovits_inference.py` - 测试SoVITS推理引擎
- `test_sovits_only.py` - 测试纯SoVITS功能
- `test_sovits_system.py` - 测试SoVITS系统集成
- `test_training_workflow.py` - 测试训练工作流
- `test_user_models.py` - 测试用户自定义模型

### 前端模块测试 (tests/frontend/)
- `test_frontend_backend.py` - 测试前后端交互功能

### 配置模块测试 (tests/config/)
- `test_arona_config.py` - 测试Arona配置功能
- `test_arona_fixed.py` - 测试Arona修复版配置

### 集成测试 (tests/integration/)
- 预留给跨模块的集成测试

## 运行测试

### 运行所有测试
```bash
python -m pytest tests/ -v
```

### 运行特定模块测试
```bash
python -m pytest tests/ai/ -v        # AI模块测试
python -m pytest tests/voice/ -v     # 语音模块测试
python -m pytest tests/frontend/ -v  # 前端模块测试
python -m pytest tests/config/ -v    # 配置模块测试
```

### 运行单个测试文件
```bash
python -m pytest tests/ai/test_qwen_integration.py -v
```

## 注意事项

- 所有测试文件都已按功能模块分类
- 测试文件的导入路径已更新为新的模块结构
- 运行测试前请确保项目依赖已正确安装