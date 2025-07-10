#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载GPT-SoVITS所需的预训练模型
Download pretrained models for GPT-SoVITS
"""

import os
import sys
import requests
import zipfile
import shutil
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForMaskedLM, HubertModel, Wav2Vec2FeatureExtractor

def download_file(url, filename, chunk_size=8192):
    """下载文件"""
    print(f"正在下载 {filename}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    downloaded = 0
    
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r下载进度: {percent:.1f}%", end='', flush=True)
    print(f"\n{filename} 下载完成!")

def download_from_huggingface():
    """从HuggingFace下载模型"""
    print("=== 从HuggingFace下载预训练模型 ===")
    
    # 获取项目根目录
    base_dir = Path(__file__).parent.parent
    
    # 创建目录
    pretrained_dir = base_dir / "GPT_SoVITS/pretrained_models"
    pretrained_dir.mkdir(parents=True, exist_ok=True)
    
    # 下载BERT模型
    bert_dir = pretrained_dir / "chinese-roberta-wwm-ext-large"
    if not bert_dir.exists():
        print("\n1. 下载BERT模型 (chinese-roberta-wwm-ext-large)...")
        try:
            tokenizer = AutoTokenizer.from_pretrained("hfl/chinese-roberta-wwm-ext-large")
            model = AutoModelForMaskedLM.from_pretrained("hfl/chinese-roberta-wwm-ext-large")
            
            # 保存到本地
            tokenizer.save_pretrained(bert_dir)
            model.save_pretrained(bert_dir)
            print("✓ BERT模型下载完成")
        except Exception as e:
            print(f"✗ BERT模型下载失败: {e}")
            return False
    else:
        print("✓ BERT模型已存在")
    
    # 下载CNHuBERT模型
    cnhub_dir = pretrained_dir / "chinese-hubert-base"
    if not cnhub_dir.exists():
        print("\n2. 下载CNHuBERT模型 (chinese-hubert-base)...")
        try:
            model = HubertModel.from_pretrained("TencentGameMate/chinese-hubert-base")
            feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("TencentGameMate/chinese-hubert-base")
            
            # 保存到本地
            model.save_pretrained(cnhub_dir)
            feature_extractor.save_pretrained(cnhub_dir)
            print("✓ CNHuBERT模型下载完成")
        except Exception as e:
            print(f"✗ CNHuBERT模型下载失败: {e}")
            return False
    else:
        print("✓ CNHuBERT模型已存在")
    
    return True

def download_from_modelscope():
    """从ModelScope下载模型"""
    print("=== 从ModelScope下载预训练模型 ===")
    
    # 获取项目根目录
    base_dir = Path(__file__).parent.parent
    
    # 创建目录
    pretrained_dir = base_dir / "GPT_SoVITS/pretrained_models"
    pretrained_dir.mkdir(parents=True, exist_ok=True)
    
    # ModelScope下载链接
    urls = {
        "bert": "https://www.modelscope.cn/models/hfl/chinese-roberta-wwm-ext-large/resolve/master",
        "cnhubert": "https://www.modelscope.cn/models/TencentGameMate/chinese-hubert-base/resolve/master"
    }
    
    # 下载BERT模型
    bert_dir = pretrained_dir / "chinese-roberta-wwm-ext-large"
    if not bert_dir.exists():
        print("\n1. 从ModelScope下载BERT模型...")
        try:
            # 使用ModelScope的API下载
            from modelscope import snapshot_download
            bert_dir = snapshot_download('hfl/chinese-roberta-wwm-ext-large', 
                                       cache_dir=pretrained_dir,
                                       local_dir=bert_dir)
            print("✓ BERT模型下载完成")
        except Exception as e:
            print(f"✗ BERT模型下载失败: {e}")
            return False
    else:
        print("✓ BERT模型已存在")
    
    # 下载CNHuBERT模型
    cnhub_dir = pretrained_dir / "chinese-hubert-base"
    if not cnhub_dir.exists():
        print("\n2. 从ModelScope下载CNHuBERT模型...")
        try:
            from modelscope import snapshot_download
            cnhub_dir = snapshot_download('TencentGameMate/chinese-hubert-base',
                                        cache_dir=pretrained_dir,
                                        local_dir=cnhub_dir)
            print("✓ CNHuBERT模型下载完成")
        except Exception as e:
            print(f"✗ CNHuBERT模型下载失败: {e}")
            return False
    else:
        print("✓ CNHuBERT模型已存在")
    
    return True

def download_manual_links():
    """提供手动下载链接"""
    print("=== 手动下载链接 ===")
    print("\n如果自动下载失败，请手动下载以下模型：")
    print("\n1. BERT模型 (chinese-roberta-wwm-ext-large):")
    print("   - HuggingFace: https://huggingface.co/hfl/chinese-roberta-wwm-ext-large")
    print("   - ModelScope: https://www.modelscope.cn/models/hfl/chinese-roberta-wwm-ext-large")
    print("   下载后解压到: GPT_SoVITS/pretrained_models/chinese-roberta-wwm-ext-large/")
    
    print("\n2. CNHuBERT模型 (chinese-hubert-base):")
    print("   - HuggingFace: https://huggingface.co/TencentGameMate/chinese-hubert-base")
    print("   - ModelScope: https://www.modelscope.cn/models/TencentGameMate/chinese-hubert-base")
    print("   下载后解压到: GPT_SoVITS/pretrained_models/chinese-hubert-base/")
    
    print("\n3. 使用git-lfs下载:")
    print("   cd GPT_SoVITS/pretrained_models")
    print("   git lfs install")
    print("   git clone https://huggingface.co/hfl/chinese-roberta-wwm-ext-large")
    print("   git clone https://huggingface.co/TencentGameMate/chinese-hubert-base")

def check_models():
    """检查模型是否已正确安装"""
    print("\n=== 检查模型安装状态 ===")
    
    # 获取项目根目录
    base_dir = Path(__file__).parent.parent
    
    bert_dir = base_dir / "GPT_SoVITS/pretrained_models/chinese-roberta-wwm-ext-large"
    cnhub_dir = base_dir / "GPT_SoVITS/pretrained_models/chinese-hubert-base"
    
    bert_ok = bert_dir.exists() and (bert_dir / "config.json").exists()
    cnhub_ok = cnhub_dir.exists() and (cnhub_dir / "config.json").exists()
    
    print(f"BERT模型: {'✓ 已安装' if bert_ok else '✗ 未安装'}")
    print(f"CNHuBERT模型: {'✓ 已安装' if cnhub_ok else '✗ 未安装'}")
    
    if bert_ok and cnhub_ok:
        print("\n🎉 所有模型已正确安装！现在可以运行GPT-SoVITS了。")
        return True
    else:
        print("\n❌ 部分模型未安装，请重新下载。")
        return False

def main():
    print("GPT-SoVITS 预训练模型下载工具")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        method = sys.argv[1].lower()
    else:
        print("请选择下载方式:")
        print("1. 从HuggingFace下载 (推荐)")
        print("2. 从ModelScope下载")
        print("3. 显示手动下载链接")
        print("4. 检查模型安装状态")
        
        choice = input("\n请输入选择 (1-4): ").strip()
        
        if choice == "1":
            method = "huggingface"
        elif choice == "2":
            method = "modelscope"
        elif choice == "3":
            method = "manual"
        elif choice == "4":
            method = "check"
        else:
            print("无效选择，使用HuggingFace下载")
            method = "huggingface"
    
    try:
        if method == "huggingface":
            success = download_from_huggingface()
        elif method == "modelscope":
            success = download_from_modelscope()
        elif method == "manual":
            download_manual_links()
            success = True
        elif method == "check":
            success = check_models()
        else:
            print("无效的下载方式")
            success = False
        
        if success and method != "manual":
            check_models()
            
    except KeyboardInterrupt:
        print("\n\n下载被用户中断")
    except Exception as e:
        print(f"\n下载过程中出现错误: {e}")
        print("请尝试手动下载方式")

if __name__ == "__main__":
    main() 
 
 