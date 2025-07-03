@echo off
chcp 65001 >nul
echo ========================================
echo GPT-SoVITS 预训练模型下载工具
echo ========================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python
    pause
    exit /b 1
)

echo 正在检查必要的Python包...
python -c "import transformers" >nul 2>&1
if errorlevel 1 (
    echo 正在安装transformers...
    pip install transformers
)

python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo 正在安装requests...
    pip install requests
)

echo.
echo 请选择下载方式:
echo 1. 从HuggingFace下载 (推荐)
echo 2. 显示手动下载链接
echo 3. 检查模型安装状态
echo.

set /p choice="请输入选择 (1-3): "

if "%choice%"=="1" (
    echo.
    echo 正在从HuggingFace下载模型...
    python download_pretrained_models.py huggingface
) else if "%choice%"=="2" (
    echo.
    python download_pretrained_models.py manual
) else if "%choice%"=="3" (
    echo.
    python download_pretrained_models.py check
) else (
    echo 无效选择，使用HuggingFace下载
    python download_pretrained_models.py huggingface
)

echo.
echo 下载完成！
pause 
 
 