#!/usr/bin/env python3
"""
测试用户的SoVITS模型
"""

import os
import sys

def test_model_files():
    """测试模型文件是否存在"""
    print("🔍 检查模型文件...")
    
    base_path = "audio_files/中配数据集制"
    
    # GPT模型
    gpt_models = [
        "GPT_weights_v2/ALuoNa_cn-e5.ckpt",
        "GPT_weights_v2/ALuoNa_cn-e10.ckpt", 
        "GPT_weights_v2/ALuoNa_cn-e15.ckpt"
    ]
    
    # SoVITS模型
    sovits_models = [
        "SoVITS_weights_v2/ALuoNa_cn_e4_s64.pth",
        "SoVITS_weights_v2/ALuoNa_cn_e8_s128.pth",
        "SoVITS_weights_v2/ALuoNa_cn_e12_s192.pth",
        "SoVITS_weights_v2/ALuoNa_cn_e16_s256.pth"
    ]
    
    print("\n📁 GPT模型文件:")
    for model in gpt_models:
        path = os.path.join(base_path, model)
        exists = os.path.exists(path)
        size = f"({os.path.getsize(path) / 1024 / 1024:.1f}MB)" if exists else ""
        status = "✅" if exists else "❌"
        print(f"  {status} {model} {size}")
    
    print("\n📁 SoVITS模型文件:")
    for model in sovits_models:
        path = os.path.join(base_path, model)
        exists = os.path.exists(path)
        size = f"({os.path.getsize(path) / 1024 / 1024:.1f}MB)" if exists else ""
        status = "✅" if exists else "❌"
        print(f"  {status} {model} {size}")
    
    # 检查参考音频
    ref_audio = "audio_files/arona_attendance_enter_1.wav"
    print(f"\n🎵 参考音频:")
    exists = os.path.exists(ref_audio)
    size = f"({os.path.getsize(ref_audio) / 1024:.1f}KB)" if exists else ""
    status = "✅" if exists else "❌"
    print(f"  {status} {ref_audio} {size}")

def recommend_model_combinations():
    """推荐模型组合"""
    print("\n🎯 推荐的模型组合:")
    
    combinations = [
        {
            "name": "🏆 最高质量组合",
            "description": "最充分训练，最佳效果",
            "gpt": "ALuoNa_cn-e15.ckpt (15 epochs)",
            "sovits": "ALuoNa_cn_e16_s256.pth (16 epochs, 256 steps)"
        },
        {
            "name": "⚖️ 平衡质量组合", 
            "description": "较好效果，适中资源",
            "gpt": "ALuoNa_cn-e10.ckpt (10 epochs)",
            "sovits": "ALuoNa_cn_e12_s192.pth (12 epochs, 192 steps)"
        },
        {
            "name": "🚀 快速测试组合",
            "description": "快速加载，基础效果",
            "gpt": "ALuoNa_cn-e5.ckpt (5 epochs)",
            "sovits": "ALuoNa_cn_e8_s128.pth (8 epochs, 128 steps)"
        }
    ]
    
    for i, combo in enumerate(combinations, 1):
        print(f"\n{i}. {combo['name']}")
        print(f"   {combo['description']}")
        print(f"   GPT: {combo['gpt']}")
        print(f"   SoVITS: {combo['sovits']}")

def main():
    """主函数"""
    print("=" * 60)
    print("🎭 SoVITS模型检查工具")
    print("=" * 60)
    
    test_model_files()
    recommend_model_combinations()
    
    print("\n" + "=" * 60)
    print("💡 使用建议:")
    print("1. 所有模型文件都需要存在才能正常使用")
    print("2. 推荐使用'最高质量组合'获得最佳效果")
    print("3. 如果想快速测试，可以使用'快速测试组合'")
    print("4. 确保参考音频文件存在且文本内容匹配")
    print("=" * 60)

if __name__ == "__main__":
    main() 