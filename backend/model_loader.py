from diffusers import StableDiffusionPipeline
import torch
import os
import gc
from config import MODEL_PATHS

def load_model(selected_style):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🔄 Loading {selected_style} model from local path...")
    print(f"📂 Path: {MODEL_PATHS[selected_style]}")
    
    # Force garbage collection before loading
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    
    # Load with memory optimizations
    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_PATHS[selected_style],
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        safety_checker=None,
        requires_safety_checker=False,
        low_cpu_mem_usage=True,  # Reduce CPU memory usage during loading
        variant="fp16" if device == "cuda" else None  # Use fp16 variant for GPU
    )
    
    pipe = pipe.to(device)
    
    # Enable memory optimizations (use only compatible ones)
    pipe.enable_attention_slicing()
    
    # Additional optimizations for lower memory usage
    if device == "cuda":
        pipe.enable_vae_slicing()  # Slice VAE for lower memory usage
        # Don't use CPU offload as it causes meta tensor issues
    
    print(f"✅ {selected_style.upper()} model loaded successfully!")
    if device == "cuda":
        print(f"💾 Current VRAM usage: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
        print(f"💾 VRAM reserved: {torch.cuda.memory_reserved() / 1024**3:.2f} GB")
    
    return pipe

def unload_model(pipe):
    """Safely unload a model to free memory"""
    if pipe is not None:
        try:
            # Move to CPU first
            pipe = pipe.to("cpu")
            # Delete the pipeline
            del pipe
            # Force garbage collection
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            print("🗑️ Model unloaded successfully")
        except Exception as e:
            print(f"⚠️ Error unloading model: {e}")

# Example usage:
# pipe = load_model("dreamshaper")
# unload_model(pipe) 