import os
import sys
from datetime import datetime
from diffusers import StableDiffusionPipeline
import torch

# Define style detection keywords
DREAMSHAPER_KEYWORDS = {
    'anime': 3, 'cartoon': 3, 'fantasy': 2, 'magical': 2, 'mystical': 2,
    'ethereal': 2, 'glowing': 2, 'sparkles': 2, 'vibrant': 1, 'stylized': 2,
    'art': 1, 'illustration': 2, 'drawing': 2, 'painting': 1, 'colorful': 1, 'bright': 1
}

REALISTIC_KEYWORDS = {
    'realistic': 3, 'photorealistic': 3, 'cinematic': 3, 'photography': 3,
    'photo': 2, 'documentary': 2, 'lifelike': 2, 'natural': 1, 'real': 1,
    'professional': 1, 'portrait': 1, 'landscape': 1, 'film': 2, 'movie': 2,
    'dramatic lighting': 1, 'film photography': 2
}

MODEL_PATHS = {
    "dreamshaper": os.path.join("backend", "models", "dreamshaper_model", "dreamshaper_model"),
    "realistic_vision": os.path.join("backend", "models", "realistic_vision_model", "realistic_vision_model")
}

def detect_visual_style(prompt):
    prompt_lower = prompt.lower()
    dreamshaper_score = 0
    realistic_score = 0
    found_dreamshaper = []
    found_realistic = []

    for keyword, score in DREAMSHAPER_KEYWORDS.items():
        if keyword in prompt_lower:
            dreamshaper_score += score
            found_dreamshaper.append(f"{keyword} (+{score})")

    for keyword, score in REALISTIC_KEYWORDS.items():
        if keyword in prompt_lower:
            realistic_score += score
            found_realistic.append(f"{keyword} (+{score})")

    if dreamshaper_score > realistic_score:
        return "dreamshaper", dreamshaper_score, realistic_score, found_dreamshaper, found_realistic
    else:
        return "realistic_vision", dreamshaper_score, realistic_score, found_dreamshaper, found_realistic

def generate_image(prompt, model_path, images_dir):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading model from {model_path} on {device}...")
    pipe = StableDiffusionPipeline.from_pretrained(model_path, torch_dtype=torch.float16 if device=="cuda" else torch.float32)
    pipe = pipe.to(device)
    pipe.enable_attention_slicing()
    print(f"Generating image for prompt: {prompt}")
    image = pipe(prompt).images[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"generated_{timestamp}.png"
    image_path = os.path.join(images_dir, filename)
    image.save(image_path)
    print(f"Image saved to {image_path}")
    return image_path

if __name__ == "__main__":
    prompt = "A surreal painting of a clock melting over a tree branch, in the style of Salvador Dalí, vibrant colors, dreamlike atmosphere"
    images_dir = os.path.join("backend", "images")
    os.makedirs(images_dir, exist_ok=True)

    # Detect style
    selected_style, ds_score, rv_score, ds_keywords, rv_keywords = detect_visual_style(prompt)
    print("\n🔍 STYLE DETECTION ANALYSIS:")
    print("="*60)
    print(f"📊 DreamShaper Score: {ds_score} | Keywords: {ds_keywords}")
    print(f"📊 Realistic Vision Score: {rv_score} | Keywords: {rv_keywords}")
    print("="*60)
    print(f"🎯 SELECTED MODEL: {selected_style.upper()}")
    print(f"🤖 Model path: {MODEL_PATHS[selected_style]}")
    print("="*60)

    # Generate image
    generate_image(prompt, MODEL_PATHS[selected_style], images_dir) 
    