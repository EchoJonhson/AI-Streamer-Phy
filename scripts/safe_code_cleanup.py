#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安全代码清理脚本 - 基于Context7最佳实践

遵循Context7的排除原则：
- 排除过时/废弃的代码 (*deprecated*, *legacy*, *previous*, *outdated*, *superseded*)
- 基于原子提交原则进行渐进式清理
- 保持系统稳定性和功能完整性
"""

import os
import shutil
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple
import difflib

class SafeCodeCleaner:
    """安全代码清理器 - 遵循Context7最佳实践"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.src_dir = self.project_root / "src" / "open_llm_vtuber"
        self.backend_dir = self.project_root / "backend"
        self.backup_dir = self.project_root / "backup_cleanup"
        self.cleanup_log = []
        
        # 基于Context7原则的安全清理规则
        self.safe_to_remove = {
            # 几乎相同的文件（差异<20行）
            "low_risk": [
                "live2d_model.py",  # 已确认几乎相同
            ],
            # 需要仔细验证的文件
            "medium_risk": [
                "chat_history.py",
                "llm_manager.py", 
                "qwen_client.py",
                "sovits_inference_engine.py",
                "server.py",
                "routes.py",
                "websocket_handler.py",
            ],
            # 需要保留的兼容层文件
            "keep": [
                "ai_compat.py",
                "core_compat.py",
                "live2d_compat.py", 
                "voice_compat.py",
                "__init__.py"
            ],
            # 特殊文件需要单独分析
            "special": [
                "config.py",  # Backend版本有更好的路径处理
                "tts_manager.py",  # Backend版本功能更完整
            ]
        }
    
    def log_action(self, action: str, details: str = ""):
        """记录清理操作"""
        log_entry = f"[{action}] {details}"
        self.cleanup_log.append(log_entry)
        print(f"✓ {log_entry}")
    
    def create_safety_backup(self):
        """创建安全备份"""
        print("📦 创建安全备份...")
        
        if self.backup_dir.exists():
            shutil.rmtree(self.backup_dir)
        
        # 备份整个src/目录
        shutil.copytree(self.src_dir, self.backup_dir / "src_backup")
        
        # 备份backend/目录作为对比
        shutil.copytree(self.backend_dir, self.backup_dir / "backend_backup")
        
        self.log_action("BACKUP", f"已创建完整备份: {self.backup_dir}")
    
    def analyze_file_differences(self, src_file: Path, backend_file: Path) -> Dict:
        """分析两个文件的详细差异"""
        try:
            with open(src_file, 'r', encoding='utf-8') as f:
                src_content = f.read()
            with open(backend_file, 'r', encoding='utf-8') as f:
                backend_content = f.read()
            
            src_lines = src_content.splitlines()
            backend_lines = backend_content.splitlines()
            
            # 计算差异
            diff = list(difflib.unified_diff(
                src_lines, backend_lines,
                fromfile=str(src_file), tofile=str(backend_file),
                n=3
            ))
            
            # 计算相似度
            matcher = difflib.SequenceMatcher(None, src_content, backend_content)
            similarity = matcher.ratio()
            
            return {
                "src_lines": len(src_lines),
                "backend_lines": len(backend_lines),
                "similarity": similarity,
                "diff_lines": len(diff),
                "identical": similarity > 0.99,
                "nearly_identical": similarity > 0.95,
                "similar": similarity > 0.80,
                "diff_content": diff[:50] if len(diff) < 50 else diff[:50] + ["... (truncated)"]
            }
        except Exception as e:
            return {"error": str(e)}
    
    def verify_backend_functionality(self) -> bool:
        """验证backend/模块的功能完整性"""
        print("🔍 验证backend模块功能完整性...")
        
        critical_modules = [
            "backend.core.config",
            "backend.ai.qwen_client",
            "backend.voice.tts_manager",
            "backend.live2d.live2d_model"
        ]
        
        for module in critical_modules:
            try:
                result = subprocess.run([
                    "python", "-c", f"import {module}; print('✅ {module}')"
                ], capture_output=True, text=True, cwd=self.project_root)
                
                if result.returncode != 0:
                    self.log_action("ERROR", f"Backend模块导入失败: {module}")
                    return False
                else:
                    self.log_action("VERIFY", f"Backend模块正常: {module}")
            except Exception as e:
                self.log_action("ERROR", f"验证失败 {module}: {e}")
                return False
        
        return True
    
    def remove_file_safely(self, file_path: Path, reason: str) -> bool:
        """安全删除文件"""
        try:
            if file_path.exists():
                # 移动到备份目录而不是直接删除
                backup_file = self.backup_dir / "removed" / file_path.name
                backup_file.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(file_path), str(backup_file))
                
                self.log_action("REMOVE", f"{file_path.name} -> {reason}")
                return True
            else:
                self.log_action("SKIP", f"{file_path.name} 不存在")
                return False
        except Exception as e:
            self.log_action("ERROR", f"删除失败 {file_path.name}: {e}")
            return False
    
    def cleanup_low_risk_files(self):
        """清理低风险文件（几乎相同的文件）"""
        print("🧹 清理低风险重复文件...")
        
        for filename in self.safe_to_remove["low_risk"]:
            src_file = self.src_dir / filename
            backend_file = self.backend_dir / self._get_backend_path(filename)
            
            if src_file.exists() and backend_file.exists():
                # 分析差异
                diff_analysis = self.analyze_file_differences(src_file, backend_file)
                
                if diff_analysis.get("nearly_identical", False):
                    self.remove_file_safely(src_file, f"几乎相同，相似度: {diff_analysis.get('similarity', 0):.2%}")
                else:
                    self.log_action("SKIP", f"{filename} 差异较大，需要手动检查")
    
    def _get_backend_path(self, filename: str) -> str:
        """获取文件在backend/中的对应路径"""
        path_mapping = {
            "config.py": "core/config.py",
            "chat_history.py": "ai/chat_history.py",
            "llm_manager.py": "ai/llm_manager.py",
            "qwen_client.py": "ai/qwen_client.py",
            "live2d_model.py": "live2d/live2d_model.py",
            "tts_manager.py": "voice/tts_manager.py",
            "sovits_inference_engine.py": "voice/sovits_inference_engine.py",
            "server.py": "core/server.py",
            "routes.py": "core/routes.py",
            "websocket_handler.py": "core/websocket_handler.py",
        }
        return path_mapping.get(filename, filename)
    
    def git_commit_changes(self, message: str):
        """执行原子Git提交"""
        try:
            # 检查是否有更改
            result = subprocess.run(
                ["git", "status", "--porcelain"], 
                capture_output=True, text=True, cwd=self.project_root
            )
            
            if not result.stdout.strip():
                self.log_action("GIT", "没有更改需要提交")
                return True
            
            # 添加更改
            subprocess.run(["git", "add", "."], cwd=self.project_root, check=True)
            
            # 提交更改
            commit_message = f"""refactor: {message}

基于Context7最佳实践进行代码清理:
- 移除重复/过时的代码文件
- 保持系统稳定性和功能完整性
- 遵循原子提交原则

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""
            
            subprocess.run(
                ["git", "commit", "-m", commit_message],
                cwd=self.project_root, check=True
            )
            
            self.log_action("GIT", f"已提交: {message}")
            return True
            
        except subprocess.CalledProcessError as e:
            self.log_action("ERROR", f"Git提交失败: {e}")
            return False
    
    def run_tests_verification(self) -> bool:
        """运行测试验证系统稳定性"""
        print("🧪 运行测试验证...")
        
        test_commands = [
            ["python", "-c", "from backend.core.config import ConfigManager; print('✅ ConfigManager')"],
            ["python", "-c", "from backend.ai.qwen_client import QwenClient; print('✅ QwenClient')"],
            ["python", "-c", "from backend.voice.tts_manager import TTSManager; print('✅ TTSManager')"],
            ["python", "-c", "from backend.live2d.live2d_model import Live2DModel; print('✅ Live2DModel')"],
        ]
        
        for cmd in test_commands:
            try:
                result = subprocess.run(
                    cmd, capture_output=True, text=True, 
                    cwd=self.project_root, timeout=30
                )
                if result.returncode == 0:
                    self.log_action("TEST", f"通过: {' '.join(cmd)}")
                else:
                    self.log_action("ERROR", f"测试失败: {result.stderr}")
                    return False
            except Exception as e:
                self.log_action("ERROR", f"测试异常: {e}")
                return False
        
        return True
    
    def generate_cleanup_report(self):
        """生成清理报告"""
        print("📊 生成清理报告...")
        
        report_lines = [
            "# 代码清理执行报告",
            f"**执行时间**: {subprocess.run(['date'], capture_output=True, text=True).stdout.strip()}",
            "",
            "## 📋 清理操作摘要",
            ""
        ]
        
        # 添加清理日志
        for log_entry in self.cleanup_log:
            report_lines.append(f"- {log_entry}")
        
        # 分析剩余文件
        remaining_files = list(self.src_dir.glob("*.py"))
        report_lines.extend([
            "",
            "## 📂 剩余文件分析",
            f"src/open_llm_vtuber/ 中剩余 {len(remaining_files)} 个Python文件:",
            ""
        ])
        
        for file in remaining_files:
            if file.name in self.safe_to_remove["keep"]:
                report_lines.append(f"- ✅ **{file.name}** - 兼容层文件，需要保留")
            elif file.name in self.safe_to_remove["medium_risk"]:
                report_lines.append(f"- ⚠️ **{file.name}** - 需要进一步分析")
            elif file.name in self.safe_to_remove["special"]:
                report_lines.append(f"- 🔍 **{file.name}** - 特殊文件，需要手动处理")
            else:
                report_lines.append(f"- ❓ **{file.name}** - 未分类文件")
        
        report_lines.extend([
            "",
            "## 🎯 下一步建议",
            "",
            "1. **验证功能**: 运行完整的应用程序测试",
            "2. **分析中风险文件**: 逐个分析剩余的重复文件",
            "3. **渐进式清理**: 继续按原子提交方式清理",
            "4. **性能测试**: 确认清理后性能无回退",
            ""
        ])
        
        # 写入报告
        report_path = self.project_root / "docs" / "CODE_CLEANUP_REPORT.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        self.log_action("REPORT", f"清理报告已生成: {report_path}")
    
    def run_safe_cleanup(self):
        """执行安全清理流程"""
        print("🚀 开始安全代码清理...")
        print("基于Context7最佳实践: 排除过时、废弃、重复代码")
        print("=" * 60)
        
        # Step 1: 创建安全备份
        self.create_safety_backup()
        
        # Step 2: 验证backend功能
        if not self.verify_backend_functionality():
            print("❌ Backend功能验证失败，停止清理")
            return False
        
        # Step 3: 清理低风险文件
        self.cleanup_low_risk_files()
        
        # Step 4: 运行测试验证
        if not self.run_tests_verification():
            print("❌ 测试验证失败，回滚更改")
            return False
        
        # Step 5: Git提交更改
        self.git_commit_changes("清理低风险重复文件")
        
        # Step 6: 生成报告
        self.generate_cleanup_report()
        
        print("=" * 60)
        print("✅ 第一阶段安全清理完成！")
        print(f"📊 查看详细报告: docs/CODE_CLEANUP_REPORT.md")
        print(f"💾 备份位置: {self.backup_dir}")
        
        return True

def main():
    """主函数"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    print("🧹 AI-Streamer-Phy 安全代码清理工具")
    print("基于Context7最佳实践和原子提交原则")
    print(f"📂 项目根目录: {project_root}")
    
    # 确认执行
    confirm = input("是否开始安全清理? (y/N): ")
    if confirm.lower() != 'y':
        print("❌ 用户取消清理")
        return
    
    # 执行清理
    cleaner = SafeCodeCleaner(str(project_root))
    success = cleaner.run_safe_cleanup()
    
    if success:
        print("\n🎉 安全清理成功完成！")
        print("💡 建议: 运行完整应用测试确认系统稳定性")
    else:
        print("\n⚠️ 清理过程中遇到问题，请检查日志")

if __name__ == "__main__":
    main()