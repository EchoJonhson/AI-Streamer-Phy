#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重复文件分析脚本 - 快速评估清理安全性
"""

import os
import difflib
from pathlib import Path

def analyze_file_similarity(src_file, backend_file):
    """分析文件相似度"""
    try:
        with open(src_file, 'r', encoding='utf-8') as f:
            src_content = f.read()
        with open(backend_file, 'r', encoding='utf-8') as f:
            backend_content = f.read()
        
        matcher = difflib.SequenceMatcher(None, src_content, backend_content)
        similarity = matcher.ratio()
        
        src_lines = len(src_content.splitlines())
        backend_lines = len(backend_content.splitlines())
        
        return {
            "similarity": similarity,
            "src_lines": src_lines,
            "backend_lines": backend_lines,
            "identical": similarity > 0.99,
            "nearly_identical": similarity > 0.95,
            "similar": similarity > 0.80
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    project_root = Path(__file__).parent.parent
    src_dir = project_root / "src" / "open_llm_vtuber"
    backend_dir = project_root / "backend"
    
    # 文件映射关系
    file_mappings = {
        "config.py": "core/config.py",
        "chat_history.py": "ai/chat_history.py",
        "llm_manager.py": "ai/llm_manager.py",
        "qwen_client.py": "ai/qwen_client.py",
        "tts_manager.py": "voice/tts_manager.py",
        "sovits_inference_engine.py": "voice/sovits_inference_engine.py",
        "server.py": "core/server.py",
        "routes.py": "core/routes.py",
        "websocket_handler.py": "core/websocket_handler.py",
        "asr_manager.py": "voice/asr_manager.py",
        "llm_api.py": "ai/llm_api.py",
        "premium_tts.py": "voice/premium_tts.py",
        "sovits_tts.py": "voice/sovits_tts.py",
        "voice_api.py": "voice/voice_api.py",
    }
    
    print("📊 重复文件相似度分析报告")
    print("=" * 60)
    
    safe_to_remove = []
    needs_review = []
    
    for src_filename, backend_path in file_mappings.items():
        src_file = src_dir / src_filename
        backend_file = backend_dir / backend_path
        
        if src_file.exists() and backend_file.exists():
            analysis = analyze_file_similarity(src_file, backend_file)
            
            if "error" in analysis:
                print(f"❌ {src_filename}: {analysis['error']}")
                continue
            
            similarity = analysis["similarity"]
            status = ""
            
            if analysis["identical"]:
                status = "🟢 相同"
                safe_to_remove.append(src_filename)
            elif analysis["nearly_identical"]:
                status = "🟡 几乎相同"
                safe_to_remove.append(src_filename)
            elif analysis["similar"]:
                status = "🟠 相似"
                needs_review.append(src_filename)
            else:
                status = "🔴 差异较大"
                needs_review.append(src_filename)
            
            print(f"{status} {src_filename}: {similarity:.1%} 相似度 ({analysis['src_lines']} -> {analysis['backend_lines']} 行)")
        else:
            if not src_file.exists():
                print(f"⚪ {src_filename}: src文件不存在")
            if not backend_file.exists():
                print(f"⚪ {src_filename}: backend文件不存在")
    
    print("\n" + "=" * 60)
    print("📋 清理建议:")
    print(f"🟢 安全删除 ({len(safe_to_remove)} 个): {', '.join(safe_to_remove)}")
    print(f"🟠 需要审查 ({len(needs_review)} 个): {', '.join(needs_review)}")

if __name__ == "__main__":
    main()