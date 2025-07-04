from diffusers import StableDiffusionPipeline
import os
import torch

# Model names on Hugging Face
DREAMSHAPER_HF = "Lykon/dreamshaper-8"
REALISTIC_VISION_HF = "SG161222/Realistic_Vision_V5.1_noVAE"

# Local save directories
DREAMSHAPER_DIR = os.path.join("backend", "models", "dreamshaper_model")
REALISTIC_VISION_DIR = os.path.join("backend", "models", "realistic_vision_model")

def download_and_save_model(hf_name, save_dir):
    if os.path.exists(os.path.join(save_dir, "model_index.json")):
        print(f"Model already exists at {save_dir}, skipping download.")
        return
    print(f"Downloading {hf_name} to {save_dir} ...")
    pipe = StableDiffusionPipeline.from_pretrained(hf_name, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
    pipe.save_pretrained(save_dir)
    print(f"Saved model to {save_dir}")

if __name__ == "__main__":
    os.makedirs(DREAMSHAPER_DIR, exist_ok=True)
    os.makedirs(REALISTIC_VISION_DIR, exist_ok=True)
    download_and_save_model(DREAMSHAPER_HF, DREAMSHAPER_DIR)
    download_and_save_model(REALISTIC_VISION_HF, REALISTIC_VISION_DIR) 