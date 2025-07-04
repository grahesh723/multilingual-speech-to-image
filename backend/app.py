from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import whisper
from pydub import AudioSegment
import io
import os
from datetime import datetime
from diffusers import StableDiffusionPipeline
import torch
import whisper
import model_loader

app = Flask(__name__)
CORS(app)

# Style detection keywords
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
IMAGES_DIR = os.path.join("backend", "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# Remove preloading at startup
# PRELOADED_MODELS = {
#     "dreamshaper": model_loader.load_model("dreamshaper"),
#     "realistic_vision": model_loader.load_model("realistic_vision")
# }

# Model cache for lazy loading
MODEL_CACHE = {}

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
        return ("dreamshaper", "Lykon/dreamshaper-8", dreamshaper_score, realistic_score, found_dreamshaper, found_realistic)
    else:
        return ("realistic_vision", "SG161222/Realistic_Vision_V5.1_noVAE", dreamshaper_score, realistic_score, found_dreamshaper, found_realistic)

def get_model(style):
    # Lazy-load and cache the model
    if style not in MODEL_CACHE:
        MODEL_CACHE[style] = model_loader.load_model(style)
    return MODEL_CACHE[style]

def generate_image(prompt, style, images_dir):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = get_model(style)
    print(f"Generating image for prompt: {prompt} using {style}")
    image = pipe(prompt).images[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"generated_{timestamp}.png"
    image_path = os.path.join(images_dir, filename)
    image.save(image_path)
    return image_path

@app.route('/generate-image', methods=['POST'])
def generate_image_api():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    # Enhanced style detection
    style, model_name, ds_score, rv_score, ds_keywords, rv_keywords = detect_visual_style(prompt)
    try:
        image_path = generate_image(prompt, style, IMAGES_DIR)
        filename = os.path.basename(image_path)
        return jsonify({
            'image_path': f'images/{filename}',
            'selected_style': style,
            'model_name': model_name,
            'dreamshaper_score': ds_score,
            'realistic_vision_score': rv_score,
            'dreamshaper_keywords': ds_keywords,
            'realistic_vision_keywords': rv_keywords
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/images/<filename>')
def serve_image(filename):
    images_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'images'))
    file_path = os.path.join(images_dir, filename)
    print(f"Serving image from: {file_path} (exists: {os.path.exists(file_path)})")
    if not os.path.exists(file_path):
        return abort(404)
    return send_from_directory(images_dir, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True,threaded=True) 

