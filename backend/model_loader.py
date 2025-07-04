from diffusers import StableDiffusionPipeline
import torch
import os

# Map to your saved model paths (update these as needed)
MODEL_SAVE_DIRS = {
    "dreamshaper": os.path.join(os.path.dirname(__file__), "models", "dreamshaper_model", "dreamshaper_model"),
    "realistic_vision": os.path.join(os.path.dirname(__file__), "models", "realistic_vision_model", "realistic_vision_model")
}

MODEL_PATHS = {
    "dreamshaper": MODEL_SAVE_DIRS["dreamshaper"],
    "realistic_vision": MODEL_SAVE_DIRS["realistic_vision"]
}

def load_model(selected_style):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🔄 Loading {selected_style} model from local path...")
    print(f"📂 Path: {MODEL_PATHS[selected_style]}")
    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_PATHS[selected_style],
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        safety_checker=None,
        requires_safety_checker=False
    )
    pipe = pipe.to(device)
    pipe.enable_attention_slicing()
    pipe.enable_model_cpu_offload()
    print(f"✅ {selected_style.upper()} model loaded successfully!")
    if device == "cuda":
        print(f"💾 Current VRAM usage: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
    return pipe

# Example usage:
# pipe = load_model("dreamshaper") 