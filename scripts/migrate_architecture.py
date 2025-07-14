#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
架构迁移脚本 - 统一到backend/架构

基于Context7最佳实践和架构分析报告，这个脚本将：
1. 更新所有导入路径到backend/架构
2. 备份关键文件
3. 验证迁移完整性
"""

import os
import re
import shutil
import glob
from pathlib import Path
from typing import List, Dict, Tuple

class ArchitectureMigrator:
    """架构迁移器"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.backup_dir = self.project_root / "backup_src_architecture"
        self.migration_log = []
        
        # 定义导入映射关系
        self.import_mappings = {
            "from src.open_llm_vtuber.config": "from backend.core.config",
            "from src.open_llm_vtuber.chat_history": "from backend.ai.chat_history",
            "from src.open_llm_vtuber.llm_manager": "from backend.ai.llm_manager",
            "from src.open_llm_vtuber.live2d_model": "from backend.live2d.live2d_model",
            "from src.open_llm_vtuber.tts_manager": "from backend.voice.tts_manager",
            "from src.open_llm_vtuber.sovits_inference_engine": "from backend.voice.sovits_inference_engine",
            "from src.open_llm_vtuber.server": "from backend.core.server",
            "from src.open_llm_vtuber.qwen_client": "from backend.ai.qwen_client",
            "from src.open_llm_vtuber.agent": "from backend.ai.agent",
            "from src.open_llm_vtuber.": "from backend.",
        }
        
        # 需要更新的文件模式
        self.target_patterns = [
            "scripts/**/*.py",
            "tests/**/*.py", 
            "docs/**/*.md",
            "*.py"
        ]
    
    def log_action(self, action: str, details: str = ""):
        """记录迁移操作"""
        log_entry = f"[{action}] {details}"
        self.migration_log.append(log_entry)
        print(f"✓ {log_entry}")
    
    def create_backup(self):
        """创建src/架构的备份"""
        print("📦 创建备份...")
        
        src_dir = self.project_root / "src" / "open_llm_vtuber"
        if src_dir.exists():
            if self.backup_dir.exists():
                shutil.rmtree(self.backup_dir)
            shutil.copytree(src_dir, self.backup_dir)
            self.log_action("BACKUP", f"已备份 {src_dir} 到 {self.backup_dir}")
        else:
            self.log_action("SKIP_BACKUP", "src/open_llm_vtuber 目录不存在")
    
    def find_files_to_update(self) -> List[Path]:
        """查找需要更新的文件"""
        files_to_update = []
        
        for pattern in self.target_patterns:
            for file_path in self.project_root.glob(pattern):
                if file_path.is_file() and file_path.suffix == '.py' or file_path.suffix == '.md':
                    files_to_update.append(file_path)
        
        # 排除备份目录和一些特殊目录
        exclude_patterns = [
            str(self.backup_dir),
            "node_modules",
            "__pycache__",
            ".git",
            "GPT-SoVITS"
        ]
        
        filtered_files = []
        for file_path in files_to_update:
            should_exclude = False
            for exclude in exclude_patterns:
                if exclude in str(file_path):
                    should_exclude = True
                    break
            if not should_exclude:
                filtered_files.append(file_path)
        
        return filtered_files
    
    def update_imports_in_file(self, file_path: Path) -> bool:
        """更新单个文件中的导入语句"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            changes_made = False
            
            # 应用导入映射
            for old_import, new_import in self.import_mappings.items():
                if old_import in content:
                    content = content.replace(old_import, new_import)
                    changes_made = True
                    self.log_action("IMPORT_UPDATE", f"{file_path}: {old_import} -> {new_import}")
            
            # 如果有更改，写回文件
            if changes_made:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
            
        except Exception as e:
            self.log_action("ERROR", f"更新文件失败 {file_path}: {e}")
            return False
    
    def update_all_imports(self):
        """更新所有文件中的导入语句"""
        print("🔄 更新导入语句...")
        
        files_to_update = self.find_files_to_update()
        updated_files = 0
        
        for file_path in files_to_update:
            if self.update_imports_in_file(file_path):
                updated_files += 1
        
        self.log_action("IMPORT_SUMMARY", f"共更新了 {updated_files} 个文件")
    
    def identify_redundant_files(self) -> List[Tuple[Path, Path]]:
        """识别重复的文件"""
        redundant_files = []
        src_dir = self.project_root / "src" / "open_llm_vtuber"
        backend_dir = self.project_root / "backend"
        
        if not src_dir.exists():
            return redundant_files
        
        # 映射关系：从src/文件到backend/对应文件
        file_mappings = {
            "config.py": "core/config.py",
            "chat_history.py": "ai/chat_history.py", 
            "llm_manager.py": "ai/llm_manager.py",
            "live2d_model.py": "live2d/live2d_model.py",
            "tts_manager.py": "voice/tts_manager.py",
            "sovits_inference_engine.py": "voice/sovits_inference_engine.py",
            "server.py": "core/server.py",
            "qwen_client.py": "ai/qwen_client.py",
        }
        
        for src_file, backend_file in file_mappings.items():
            src_path = src_dir / src_file
            backend_path = backend_dir / backend_file
            
            if src_path.exists() and backend_path.exists():
                redundant_files.append((src_path, backend_path))
        
        return redundant_files
    
    def analyze_differences(self, src_file: Path, backend_file: Path) -> Dict:
        """分析两个文件的差异"""
        try:
            with open(src_file, 'r', encoding='utf-8') as f:
                src_content = f.read()
            with open(backend_file, 'r', encoding='utf-8') as f:
                backend_content = f.read()
            
            src_lines = src_content.splitlines()
            backend_lines = backend_content.splitlines()
            
            return {
                "src_lines": len(src_lines),
                "backend_lines": len(backend_lines),
                "identical": src_content.strip() == backend_content.strip(),
                "src_size": len(src_content),
                "backend_size": len(backend_content)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def generate_migration_report(self):
        """生成迁移报告"""
        print("📊 生成迁移报告...")
        
        redundant_files = self.identify_redundant_files()
        report_lines = [
            "# 架构迁移执行报告",
            f"**执行时间**: {os.popen('date').read().strip()}",
            "",
            "## 📋 执行操作摘要",
            ""
        ]
        
        # 添加迁移日志
        for log_entry in self.migration_log:
            report_lines.append(f"- {log_entry}")
        
        report_lines.extend([
            "",
            "## 🔍 重复文件分析",
            ""
        ])
        
        # 分析重复文件
        for src_file, backend_file in redundant_files:
            diff = self.analyze_differences(src_file, backend_file)
            report_lines.extend([
                f"### {src_file.name}",
                f"- **源文件**: `{src_file}`",
                f"- **目标文件**: `{backend_file}`",
                f"- **是否相同**: {'✅ 是' if diff.get('identical', False) else '❌ 否'}",
                f"- **源文件行数**: {diff.get('src_lines', 'N/A')}",
                f"- **目标文件行数**: {diff.get('backend_lines', 'N/A')}",
                ""
            ])
        
        report_lines.extend([
            "## ✅ 下一步建议",
            "",
            "1. **验证功能**: 运行完整测试套件",
            "2. **检查配置**: 确认所有配置文件正确",
            "3. **删除重复**: 逐步删除src/中的重复文件",
            "4. **更新文档**: 更新相关文档和README",
            "",
            "## 🎯 迁移完成标准",
            "",
            "- [ ] 所有导入路径已更新",
            "- [ ] 功能测试通过",
            "- [ ] 性能无显著下降",
            "- [ ] 文档已同步更新",
            ""
        ])
        
        # 写入报告文件
        report_path = self.project_root / "docs" / "MIGRATION_EXECUTION_REPORT.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        self.log_action("REPORT", f"迁移报告已生成: {report_path}")
    
    def run_migration(self):
        """执行完整的迁移过程"""
        print("🚀 开始架构迁移...")
        print("=" * 60)
        
        # Step 1: 创建备份
        self.create_backup()
        
        # Step 2: 更新导入语句  
        self.update_all_imports()
        
        # Step 3: 生成报告
        self.generate_migration_report()
        
        print("=" * 60)
        print("✅ 架构迁移完成！")
        print(f"📊 查看详细报告: docs/MIGRATION_EXECUTION_REPORT.md")
        print(f"💾 备份位置: {self.backup_dir}")

def main():
    """主函数"""
    # 获取项目根目录
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    print("🎯 AI-Streamer-Phy 架构统一迁移工具")
    print(f"📂 项目根目录: {project_root}")
    
    # 确认执行
    confirm = input("是否继续执行迁移? (y/N): ")
    if confirm.lower() != 'y':
        print("❌ 用户取消迁移")
        return
    
    # 执行迁移
    migrator = ArchitectureMigrator(str(project_root))
    migrator.run_migration()

if __name__ == "__main__":
    main()