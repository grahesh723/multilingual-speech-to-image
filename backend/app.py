from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import whisper
from pydub import AudioSegment
import io
import os
import gc
import threading
import time
import logging
import re
from datetime import datetime, timedelta
from diffusers import StableDiffusionPipeline
import torch
import whisper
import model_loader
import psutil
import glob
from config import *

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Rate limiting
REQUEST_COUNTS = {}
RATE_LIMIT_WINDOW = 60  # 1 minute
MAX_REQUESTS_PER_WINDOW = 10

# Model cache for lazy loading with memory management
MODEL_CACHE = {}
MODEL_LAST_USED = {}

# Request queue to prevent multiple simultaneous generations
GENERATION_LOCK = threading.Lock()
IS_GENERATING = False

# Create images directory
os.makedirs(IMAGES_DIR, exist_ok=True)

def setup_logging():
    """Setup logging configuration"""
    if not os.path.exists('backend/logs'):
        os.makedirs('backend/logs')
    
    # Rotating file handler
    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler(
        'backend/logs/app.log', 
        maxBytes=1024*1024,  # 1MB
        backupCount=5
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    logger.addHandler(file_handler)

def sanitize_prompt(prompt):
    """Sanitize and validate the input prompt"""
    if not prompt or not isinstance(prompt, str):
        raise ValueError("Prompt must be a non-empty string")
    
    # Remove potentially dangerous characters
    prompt = re.sub(r'[<>"\']', '', prompt)
    
    # Limit prompt length
    if len(prompt) > 500:
        raise ValueError("Prompt too long (max 500 characters)")
    
    # Check for suspicious patterns
    suspicious_patterns = [
        r'system:', r'exec', r'eval', r'import', r'os\.', r'subprocess',
        r'file://', r'http://', r'https://', r'ftp://'
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, prompt, re.IGNORECASE):
            raise ValueError("Prompt contains forbidden patterns")
    
    return prompt.strip()

def check_rate_limit(client_ip):
    """Check if client has exceeded rate limit"""
    current_time = time.time()
    
    # Clean old entries
    REQUEST_COUNTS = {ip: timestamp for ip, timestamp in REQUEST_COUNTS.items() 
                     if current_time - timestamp < RATE_LIMIT_WINDOW}
    
    # Check if client has made too many requests
    if client_ip in REQUEST_COUNTS:
        return False
    
    REQUEST_COUNTS[client_ip] = current_time
    return True

def get_memory_usage():
    """Get current memory usage in MB"""
    try:
        process = psutil.Process()
        return process.memory_info().rss / 1024 / 1024
    except Exception as e:
        logger.error(f"Error getting memory usage: {e}")
        return 0

def cleanup_old_images():
    """Remove old generated images to save disk space"""
    try:
        image_files = glob.glob(os.path.join(IMAGES_DIR, "generated_*.png"))
        if len(image_files) > MAX_IMAGES_TO_KEEP:
            # Sort by modification time (oldest first)
            image_files.sort(key=os.path.getmtime)
            # Remove oldest files
            for old_file in image_files[:-MAX_IMAGES_TO_KEEP]:
                os.remove(old_file)
                logger.info(f"Removed old image: {os.path.basename(old_file)}")
    except Exception as e:
        logger.error(f"Error during image cleanup: {e}")

def unload_unused_models():
    """Unload models that haven't been used recently"""
    current_time = time.time()
    models_to_unload = []
    
    for style, last_used in MODEL_LAST_USED.items():
        if current_time - last_used > MODEL_TIMEOUT:
            models_to_unload.append(style)
    
    for style in models_to_unload:
        if style in MODEL_CACHE:
            logger.info(f"Unloading unused model: {style}")
            del MODEL_CACHE[style]
            del MODEL_LAST_USED[style]
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

def detect_visual_style(prompt):
    """Enhanced style detection with better scoring"""
    prompt_lower = prompt.lower()
    dreamshaper_score = 0
    realistic_score = 0
    found_dreamshaper = []
    found_realistic = []
    
    # Check for dreamshaper keywords
    for keyword, score in DREAMSHAPER_KEYWORDS.items():
        if keyword in prompt_lower:
            dreamshaper_score += score
            found_dreamshaper.append(f"{keyword} (+{score})")
    
    # Check for realistic keywords
    for keyword, score in REALISTIC_KEYWORDS.items():
        if keyword in prompt_lower:
            realistic_score += score
            found_realistic.append(f"{keyword} (+{score})")
    
    # Determine style with confidence
    if dreamshaper_score > realistic_score:
        return ("dreamshaper", "Lykon/dreamshaper-8", dreamshaper_score, realistic_score, found_dreamshaper, found_realistic)
    else:
        return ("realistic_vision", "SG161222/Realistic_Vision_V5.1_noVAE", dreamshaper_score, realistic_score, found_dreamshaper, found_realistic)

def get_model(style):
    """Get model with enhanced memory management"""
    global MODEL_CACHE, MODEL_LAST_USED
    
    # Unload unused models first
    unload_unused_models()
    
    # If we have too many models in memory, unload the least recently used
    if len(MODEL_CACHE) >= MAX_MODELS_IN_MEMORY:
        if style not in MODEL_CACHE:
            # Find least recently used model
            lru_style = min(MODEL_LAST_USED.keys(), key=lambda k: MODEL_LAST_USED[k])
            logger.info(f"Unloading LRU model: {lru_style}")
            del MODEL_CACHE[lru_style]
            del MODEL_LAST_USED[lru_style]
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
    
    # Load model if not in cache
    if style not in MODEL_CACHE:
        logger.info(f"Loading model: {style}")
        MODEL_CACHE[style] = model_loader.load_model(style)
    
    # Update last used time
    MODEL_LAST_USED[style] = time.time()
    
    return MODEL_CACHE[style]

def generate_image(prompt, style, images_dir):
    """Generate image with enhanced error handling and optimization"""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    try:
        pipe = get_model(style)
        
        logger.info(f"Generating image for prompt: {prompt[:50]}... using {style}")
        logger.info(f"Memory usage before generation: {get_memory_usage():.1f} MB")
        
        # Use configuration settings
        image = pipe(
            prompt,
            num_inference_steps=DEFAULT_INFERENCE_STEPS,
            height=IMAGE_SIZE,
            width=IMAGE_SIZE,
            guidance_scale=DEFAULT_GUIDANCE_SCALE
        ).images[0]
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"generated_{timestamp}.png"
        image_path = os.path.join(images_dir, filename)
        
        # Save with optimization
        image.save(image_path, optimize=True, quality=IMAGE_QUALITY)
        
        logger.info(f"Memory usage after generation: {get_memory_usage():.1f} MB")
        logger.info(f"Image saved: {filename}")
        
        # Cleanup old images if enabled
        if AUTO_CLEANUP_ENABLED:
            cleanup_old_images()
        
        return image_path
        
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        raise

@app.route('/generate-image', methods=['POST'])
def generate_image_api():
    """Enhanced image generation endpoint with validation and rate limiting"""
    global IS_GENERATING
    
    # Get client IP for rate limiting
    client_ip = request.remote_addr
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        return jsonify({
            'error': 'Rate limit exceeded. Please wait before making another request.'
        }), 429
    
    # Check if already generating
    if IS_GENERATING:
        return jsonify({
            'error': 'Another generation is in progress. Please wait.',
            'estimated_wait_time': '30-60 seconds'
        }), 429
    
    # Validate request
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON data'}), 400
    
    prompt = data.get('prompt')
    
    # Validate prompt
    try:
        prompt = sanitize_prompt(prompt)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    # Check memory usage
    memory_usage = get_memory_usage()
    if memory_usage > MAX_MEMORY_USAGE_MB:
        return jsonify({
            'error': 'Server memory usage is high. Please try again later.',
            'memory_usage_mb': memory_usage
        }), 503
    
    with GENERATION_LOCK:
        IS_GENERATING = True
    
    try:
        # Enhanced style detection
        style, model_name, ds_score, rv_score, ds_keywords, rv_keywords = detect_visual_style(prompt)
        
        # Generate image
        image_path = generate_image(prompt, style, IMAGES_DIR)
        filename = os.path.basename(image_path)
        
        # Prepare response
        response_data = {
            'image_path': f'images/{filename}',
            'selected_style': style,
            'model_name': model_name,
            'dreamshaper_score': ds_score,
            'realistic_vision_score': rv_score,
            'dreamshaper_keywords': ds_keywords,
            'realistic_vision_keywords': rv_keywords,
            'generation_time': datetime.now().isoformat(),
            'prompt_length': len(prompt)
        }
        
        # Add memory usage if enabled
        if LOG_MEMORY_USAGE:
            response_data['memory_usage_mb'] = get_memory_usage()
        
        logger.info(f"Successfully generated image: {filename}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error in generate_image_api: {e}")
        return jsonify({
            'error': 'Internal server error during image generation',
            'details': str(e) if DEBUG_MODE else 'Please try again later'
        }), 500
    finally:
        with GENERATION_LOCK:
            IS_GENERATING = False

@app.route('/images/<filename>')
def serve_image(filename):
    """Enhanced image serving with security checks"""
    # Validate filename
    if not re.match(r'^generated_\d{8}_\d{6}\.png$', filename):
        return jsonify({'error': 'Invalid filename format'}), 400
    
    images_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'images'))
    file_path = os.path.join(images_dir, filename)
    
    # Security check - ensure file is within images directory
    if not os.path.abspath(file_path).startswith(os.path.abspath(images_dir)):
        return jsonify({'error': 'Access denied'}), 403
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'Image not found'}), 404
    
    logger.info(f"Serving image: {filename}")
    return send_from_directory(images_dir, filename)

@app.route('/status', methods=['GET'])
def get_status():
    """Enhanced status endpoint with detailed information"""
    try:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        status_data = {
            'server_status': 'running',
            'timestamp': datetime.now().isoformat(),
            'memory_usage_mb': get_memory_usage(),
            'memory_percent': memory.percent,
            'cpu_percent': cpu_percent,
            'disk_percent': disk.percent,
            'models_loaded': list(MODEL_CACHE.keys()),
            'is_generating': IS_GENERATING,
            'images_count': len(glob.glob(os.path.join(IMAGES_DIR, "generated_*.png"))),
            'uptime': time.time() - app.start_time if hasattr(app, 'start_time') else 0
        }
        
        # Add GPU information if available
        if torch.cuda.is_available():
            status_data['gpu_available'] = True
            status_data['gpu_memory_allocated_gb'] = torch.cuda.memory_allocated() / 1024**3
            status_data['gpu_memory_reserved_gb'] = torch.cuda.memory_reserved() / 1024**3
        else:
            status_data['gpu_available'] = False
        
        return jsonify(status_data), 200
        
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        return jsonify({'error': 'Error getting status'}), 500

@app.route('/cleanup', methods=['POST'])
def manual_cleanup():
    """Enhanced manual cleanup endpoint"""
    try:
        logger.info("Manual cleanup initiated")
        
        # Cleanup images
        cleanup_old_images()
        
        # Unload unused models
        unload_unused_models()
        
        # Force garbage collection
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        memory_after = get_memory_usage()
        
        logger.info(f"Manual cleanup completed. Memory usage: {memory_after:.1f} MB")
        
        return jsonify({
            'message': 'Cleanup completed successfully',
            'memory_usage_mb': memory_after,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in manual cleanup: {e}")
        return jsonify({'error': 'Error during cleanup'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with API information"""
    return jsonify({
        'service': 'AI Image Generation API',
        'version': '1.0.0',
        'endpoints': {
            'POST /generate-image': 'Generate image from text prompt',
            'GET /images/<filename>': 'Serve generated image',
            'GET /status': 'Get server status and resource usage',
            'POST /cleanup': 'Manual cleanup of models and images',
            'GET /health': 'Health check endpoint'
        },
        'documentation': 'See /status for detailed information'
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Setup logging
    setup_logging()
    
    # Record start time
    app.start_time = time.time()
    
    logger.info("Starting AI Image Generation Server")
    logger.info(f"Configuration: MAX_MODELS_IN_MEMORY={MAX_MODELS_IN_MEMORY}, "
                f"IMAGE_SIZE={IMAGE_SIZE}, DEFAULT_INFERENCE_STEPS={DEFAULT_INFERENCE_STEPS}")
    
    # Start server
    app.run(host=HOST, port=PORT, debug=DEBUG_MODE, threaded=THREADED) 

