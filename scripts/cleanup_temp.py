#!/usr/bin/env python3
"""
临时文件清理脚本
自动清理 temp/ 目录下的过期文件
"""

import os
import time
import sys
import shutil
from pathlib import Path

def cleanup_temp_files(max_age_hours=24, dry_run=False):
    """
    清理临时文件
    
    Args:
        max_age_hours: 文件最大保存时间（小时）
        dry_run: 是否为测试模式（不实际删除文件）
    """
    project_root = Path(__file__).parent.parent
    temp_dir = project_root / "temp"
    
    if not temp_dir.exists():
        print(f"临时目录不存在：{temp_dir}")
        return
    
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    
    deleted_files = []
    deleted_size = 0
    
    print(f"开始清理 {temp_dir} 目录...")
    print(f"删除超过 {max_age_hours} 小时的文件")
    print(f"测试模式：{'是' if dry_run else '否'}")
    print("-" * 50)
    
    # 遍历所有文件
    for file_path in temp_dir.rglob("*"):
        if file_path.is_file():
            # 获取文件修改时间
            file_mtime = file_path.stat().st_mtime
            file_age = current_time - file_mtime
            
            # 如果文件过期
            if file_age > max_age_seconds:
                file_size = file_path.stat().st_size
                deleted_files.append(str(file_path))
                deleted_size += file_size
                
                age_hours = file_age / 3600
                print(f"删除文件：{file_path} (大小: {file_size} 字节, 年龄: {age_hours:.1f} 小时)")
                
                if not dry_run:
                    try:
                        file_path.unlink()
                    except OSError as e:
                        print(f"删除失败：{e}")
    
    # 删除空目录
    if not dry_run:
        for dir_path in temp_dir.rglob("*"):
            if dir_path.is_dir() and not any(dir_path.iterdir()):
                print(f"删除空目录：{dir_path}")
                try:
                    dir_path.rmdir()
                except OSError as e:
                    print(f"删除目录失败：{e}")
    
    print("-" * 50)
    print(f"清理完成！")
    print(f"删除文件数量：{len(deleted_files)}")
    print(f"释放磁盘空间：{deleted_size / 1024 / 1024:.2f} MB")
    
    return deleted_files

def get_temp_dir_size():
    """获取临时目录大小"""
    project_root = Path(__file__).parent.parent
    temp_dir = project_root / "temp"
    
    if not temp_dir.exists():
        return 0
    
    total_size = 0
    file_count = 0
    
    for file_path in temp_dir.rglob("*"):
        if file_path.is_file():
            total_size += file_path.stat().st_size
            file_count += 1
    
    return total_size, file_count

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="临时文件清理脚本")
    parser.add_argument("--max-age", type=int, default=24, 
                      help="文件最大保存时间（小时），默认24小时")
    parser.add_argument("--dry-run", action="store_true", 
                      help="测试模式，不实际删除文件")
    parser.add_argument("--status", action="store_true", 
                      help="查看临时目录状态")
    
    args = parser.parse_args()
    
    if args.status:
        size, count = get_temp_dir_size()
        print(f"临时目录状态：")
        print(f"文件数量：{count}")
        print(f"总大小：{size / 1024 / 1024:.2f} MB")
        return
    
    # 执行清理
    cleanup_temp_files(args.max_age, args.dry_run)

if __name__ == "__main__":
    main()