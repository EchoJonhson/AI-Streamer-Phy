# GPT-SoVITS 预训练模型下载工具 (PowerShell版本)
Write-Host "========================================" -ForegroundColor Green
Write-Host "GPT-SoVITS 预训练模型下载工具" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查Python环境
Write-Host "正在检查Python环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python版本: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 错误: 未找到Python，请先安装Python" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

# 检查并安装必要的包
Write-Host "正在检查必要的Python包..." -ForegroundColor Yellow

try {
    python -c "import transformers" 2>$null
    Write-Host "✓ transformers已安装" -ForegroundColor Green
} catch {
    Write-Host "正在安装transformers..." -ForegroundColor Yellow
    pip install transformers
}

try {
    python -c "import requests" 2>$null
    Write-Host "✓ requests已安装" -ForegroundColor Green
} catch {
    Write-Host "正在安装requests..." -ForegroundColor Yellow
    pip install requests
}

Write-Host ""
Write-Host "请选择下载方式:" -ForegroundColor Cyan
Write-Host "1. 从HuggingFace下载 (推荐)" -ForegroundColor White
Write-Host "2. 显示手动下载链接" -ForegroundColor White
Write-Host "3. 检查模型安装状态" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选择 (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "正在从HuggingFace下载模型..." -ForegroundColor Yellow
        python download_pretrained_models.py huggingface
    }
    "2" {
        Write-Host ""
        python download_pretrained_models.py manual
    }
    "3" {
        Write-Host ""
        python download_pretrained_models.py check
    }
    default {
        Write-Host "无效选择，使用HuggingFace下载" -ForegroundColor Yellow
        python download_pretrained_models.py huggingface
    }
}

Write-Host ""
Write-Host "下载完成！" -ForegroundColor Green
Read-Host "按任意键退出" 
 
 