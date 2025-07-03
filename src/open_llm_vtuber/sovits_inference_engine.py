"""
SoVITS推理引擎 - 独立语音合成程序
直接调用GPT-SoVITS预训练模型，无需API服务器
"""

import os
import sys
import logging
import soundfile as sf
from pathlib import Path
import tempfile
import asyncio
import torch

# Add GPT-SoVITS paths
base_dir = Path(__file__).resolve().parent.parent.parent
gpt_sovits_path = base_dir / "GPT-SoVITS"
# Add GPT_SoVITS root to path
if str(gpt_sovits_path) not in sys.path:
    sys.path.insert(0, str(gpt_sovits_path))
# Add GPT_SoVITS submodule to path
if str(gpt_sovits_path / "GPT_SoVITS") not in sys.path:
    sys.path.insert(0, str(gpt_sovits_path / "GPT_SoVITS"))

try:
    from TTS_infer_pack.TTS import TTS, TTS_Config
except ImportError as e:
    logging.getLogger(__name__).error(f"Failed to import from TTS_infer_pack: {e}. Check sys.path: {sys.path}")
    raise

logger = logging.getLogger(__name__)

class SoVITSInferenceEngine:
    """SoVITS推理引擎"""
    
    def __init__(self, config=None):
        logger.info("🚀 Initializing SoVITS Inference Engine (Direct Call Version)...")
        self.config = config or {}
        
        # Get sovits configuration from config
        sovits_config = self.config.get('sovits', {})
        
        # Get absolute paths from sovits config
        self.gpt_path = sovits_config.get('pretrained_gpt_model', '')
        self.sovits_path = sovits_config.get('pretrained_sovits_model', '')
        self.ref_audio_path = sovits_config.get('reference_audio', '')
        self.prompt_text = sovits_config.get('prompt_text', '您回来啦，我等您很久啦！')
        
        # These pretrained model paths should ideally be in config.yaml as well
        bert_path = str(base_dir / "GPT-SoVITS/pretrained_models/chinese-roberta-wwm-ext-large")
        cnhuhbert_path = str(base_dir / "GPT-SoVITS/pretrained_models/chinese-hubert-base")

        # Check if all model files exist
        for path in [self.gpt_path, self.sovits_path, self.ref_audio_path, bert_path, cnhuhbert_path]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Required model file not found: {path}")

        # Use CUDA if available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        is_half = device == "cuda"

        custom_config = {
            "device": device,
            "is_half": is_half, 
            "version": "v2", # This might need to be dynamic based on model
            "t2s_weights_path": self.gpt_path,
            "vits_weights_path": self.sovits_path,
            "cnhuhbert_base_path": cnhuhbert_path,
            "bert_base_path": bert_path,
        }
        
        logger.info("🔧 Initializing TTS_Config...")
        tts_config = TTS_Config(custom_config)
        
        logger.info(f"🔧 Initializing TTS model on device: {device}...")
        self.tts_infer = TTS(tts_config)
        
        logger.info("✅ SoVITS Inference Engine initialized successfully.")
        logger.info(f"   - GPT Model: {os.path.basename(self.gpt_path)}")
        logger.info(f"   - SoVITS Model: {os.path.basename(self.sovits_path)}")
        logger.info(f"   - Reference Audio: {os.path.basename(self.ref_audio_path)}")
        logger.info(f"   - Prompt Text: {self.prompt_text}")

    async def generate_speech(self, text, output_path=None):
        logger.info(f"🎵 Synthesizing speech for text: {text[:50]}...")
        
        if not output_path:
            output_dir = base_dir / "temp" / "generated_audio"
            output_dir.mkdir(parents=True, exist_ok=True)
            output_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav", dir=str(output_dir))
            output_path = output_file.name
            output_file.close()

        inputs = {
            "text": text,
            "text_lang": "zh",
            "ref_audio_path": self.ref_audio_path,
            "prompt_text": self.prompt_text,
            "prompt_lang": "zh",
            "top_k": 5,
            "top_p": 1,
            "temperature": 1,
            "text_split_method": "cut5",
            "batch_size": 1,
            "speed_factor": 1.0,
            "ref_free": False,
        }
        
        loop = asyncio.get_event_loop()
        try:
            # The run method returns a generator, so we need to iterate through it
            result_generator = await loop.run_in_executor(
                None,  # Use default executor
                self.tts_infer.run,
                inputs
            )
            
            # 处理生成器返回值 - TTS.run()返回生成器
            if hasattr(result_generator, '__iter__'):
                # 迭代生成器获取音频数据
                audio_data = None
                sampling_rate = 16000  # 默认采样率
                
                for result in result_generator:
                    if isinstance(result, tuple) and len(result) == 2:
                        sampling_rate, audio_data = result
                        break
                    elif isinstance(result, dict) and 'audio' in result:
                        sampling_rate = result.get('sampling_rate', 16000)
                        audio_data = result['audio']
                        break
                    elif isinstance(result, (list, tuple)) and len(result) > 0:
                        # 可能是音频数据列表
                        audio_data = result
                        break
                
                if audio_data is not None:
                    sf.write(output_path, audio_data, sampling_rate)
                    logger.info(f"✅ Speech synthesized successfully and saved to: {output_path}")
                    return output_path
                else:
                    logger.error("❌ No audio data found in generator")
                    return None
            else:
                logger.error(f"❌ Unexpected TTS result format: {type(result_generator)}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Speech synthesis failed: {e}", exc_info=True)
            return None

    def cleanup(self):
        logger.info("🧹 Cleaning up SoVITS Inference Engine resources...")
        try:
            if hasattr(self, 'tts_infer'):
                del self.tts_infer
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except Exception as e:
            logger.error(f"Error during cleanup: {e}", exc_info=True)
        finally:
            logger.info("✅ SoVITS Inference Engine resources cleaned up.")

    def get_status(self):
        """获取引擎状态"""
        try:
            return {
                "engine": "sovits_inference",
                "initialized": True,
                "gpt_model": os.path.basename(self.gpt_path) if self.gpt_path else "未设置",
                "sovits_model": os.path.basename(self.sovits_path) if self.sovits_path else "未设置",
                "reference_audio": os.path.basename(self.ref_audio_path) if self.ref_audio_path else "未设置",
                "prompt_text": self.prompt_text[:50] + "..." if len(self.prompt_text) > 50 else self.prompt_text,
                "version": "v2",
                "status": "ready",
                "work_dir": str(base_dir / "temp"),
                "parameters": {
                    "temperature": 1,
                    "top_k": 5,
                    "top_p": 1,
                    "speed": 1.0
                }
            }
            
        except Exception as e:
            logger.error(f"获取引擎状态失败: {e}")
            return {"engine": "sovits_inference", "status": "error", "error": str(e)}
    
    def __del__(self):
        """析构函数"""
        try:
            self.cleanup()
        except:
            pass 