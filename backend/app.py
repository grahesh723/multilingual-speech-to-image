from flask import Flask, request, jsonify, send_from_directory, abort, send_file
from flask_cors import CORS
import os
import time
import logging
import re
from datetime import datetime, timedelta
import psutil
import glob
from config import *
from speech_service import SpeechService
from image_service import ImageService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize services
speech_service = SpeechService()
image_service = ImageService()

# Rate limiting
REQUEST_COUNTS = {}
RATE_LIMIT_WINDOW = 60  # 1 minute
MAX_REQUESTS_PER_WINDOW = 10

# Create images directory
os.makedirs(IMAGES_DIR, exist_ok=True)

def setup_logging():
    """Setup logging configuration"""
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Rotating file handler
    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler(
        'logs/app.log', 
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

@app.route('/transcribe-audio', methods=['POST'])
def transcribe_audio():
    """Transcribe uploaded audio file to text"""
    try:
        # Check rate limit
        client_ip = request.remote_addr
        if not check_rate_limit(client_ip):
            return jsonify({
                "success": False,
                "error": "Rate limit exceeded. Please wait before making another request."
            }), 429
        
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "No audio file provided"
            }), 400
        
        audio_file = request.files['audio']
        
        # Validate file
        if audio_file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        # Read audio data
        audio_data = audio_file.read()
        
        # Validate audio data
        if not speech_service.validate_audio(audio_data):
            return jsonify({
                "success": False,
                "error": "Invalid audio file or file too large"
            }), 400
        
        # Get file extension
        file_extension = audio_file.filename.rsplit('.', 1)[1].lower() if '.' in audio_file.filename else 'wav'
        
        # Process audio
        result = speech_service.process_audio(audio_data, file_extension)
        
        if result["success"]:
            return jsonify({
                "success": True,
                "text": result["text"],
                "confidence": result["confidence"],
                "language": result["language"]
            })
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Failed to transcribe audio")
            }), 500
            
    except Exception as e:
        logger.error(f"Error in transcribe_audio: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

def check_rate_limit(client_ip):
    """Check if client has exceeded rate limit"""
    global REQUEST_COUNTS
    current_time = time.time()
    
    # Clean old entries
    REQUEST_COUNTS = {ip: timestamp for ip, timestamp in REQUEST_COUNTS.items() 
                     if current_time - timestamp < RATE_LIMIT_WINDOW}
    
    # Check if client has made too many requests
    if client_ip in REQUEST_COUNTS:
        return False
    
    REQUEST_COUNTS[client_ip] = current_time
    return True

# Removed old functions - now handled by services

@app.route('/generate-image', methods=['POST'])
def generate_image_api():
    """Generate image from text prompt"""
    try:
        # Check rate limit
        client_ip = request.remote_addr
        if not check_rate_limit(client_ip):
            return jsonify({
                "success": False,
                "error": "Rate limit exceeded. Please wait before making another request."
            }), 429
        

        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        prompt = data.get('prompt', '').strip()
        style = data.get('style')  # Optional, will auto-detect if not provided
        
        # Validate prompt
        if not prompt:
            return jsonify({
                "success": False,
                "error": "Prompt is required"
            }), 400
        
        try:
            prompt = sanitize_prompt(prompt)
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 400
        
        # Check memory usage
        memory_usage = image_service.get_memory_usage()
        if memory_usage["cpu_memory_mb"] > MAX_MEMORY_USAGE_MB:
            return jsonify({
                "success": False,
                "error": "Server is currently overloaded. Please try again later."
            }), 503
        
        # Generate image using image service
        result = image_service.generate_image(prompt, style, IMAGES_DIR)
        
        if result["success"]:
            # Clean up old images
            image_service.cleanup_old_images()
            return jsonify({
                "success": True,
                "filename": result["filename"],
                "image_url": f"/images/{result['filename']}",
                "image_path": f"/images/{result['filename']}",  # For frontend compatibility
                "prompt": result["prompt"],
                "style": result["style"],
                "metadata": result.get("metadata", {})
            })
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Failed to generate image")
            }), 500
            
    except Exception as e:
        logger.error(f"Error in generate_image_api: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

@app.route('/images/<filename>')
def serve_image(filename):
    """Enhanced image serving with security checks"""
    # Validate filename
    if not re.match(r'^generated_\d{8}_\d{6}(_[a-zA-Z0-9_]+)?\.png$', filename):
        return jsonify({'error': 'Invalid filename format'}), 400
    file_path = os.path.join(IMAGES_DIR, filename)
    # Security check - ensure file is within images directory
    if not os.path.abspath(file_path).startswith(os.path.abspath(IMAGES_DIR)):
        return jsonify({'error': 'Access denied'}), 403
    if not os.path.exists(file_path):
        return jsonify({'error': 'Image not found'}), 404
    logger.info(f"Serving image: {filename}")
    return send_from_directory(IMAGES_DIR, filename)

@app.route('/download/<filename>')
def download_image(filename):
    """Force download of the image file with security checks"""
    # Validate filename (allow underscores in style)
    if not re.match(r'^generated_\d{8}_\d{6}(_[a-zA-Z0-9_]+)?\.png$', filename):
        return jsonify({'error': 'Invalid filename format'}), 400
    file_path = os.path.join(IMAGES_DIR, filename)
    # Security check - ensure file is within images directory
    if not os.path.abspath(file_path).startswith(os.path.abspath(IMAGES_DIR)):
        return jsonify({'error': 'Access denied'}), 403
    if not os.path.exists(file_path):
        return jsonify({'error': 'Image not found'}), 404
    logger.info(f"Downloading image: {filename}")
    return send_file(file_path, as_attachment=True)

@app.route('/status', methods=['GET'])
def get_status():
    """Get server status and system information"""
    try:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Get memory usage from services
        image_memory = image_service.get_memory_usage()
        
        status_data = {
            'server_status': 'running',
            'timestamp': datetime.now().isoformat(),
            'memory_usage_mb': image_memory["cpu_memory_mb"],
            'memory_percent': memory.percent,
            'cpu_percent': cpu_percent,
            'disk_percent': disk.percent,
            'models_loaded': list(image_service.model_cache.keys()),
            'is_generating': image_service.generation_lock,
            'images_count': len(glob.glob(os.path.join(IMAGES_DIR, "generated_*.png"))),
            'speech_model_loaded': speech_service.model_loaded,
            'supported_audio_formats': speech_service.get_supported_formats()
        }
        
        # Add GPU information if available
        if image_memory["gpu_memory_mb"] > 0:
            status_data['gpu_available'] = True
            status_data['gpu_memory_mb'] = image_memory["gpu_memory_mb"]
        else:
            status_data['gpu_available'] = False
        
        return jsonify(status_data), 200
        
    except Exception as e:
        logger.error(f"Error in status endpoint: {e}")
        return jsonify({'error': 'Error getting status'}), 500

@app.route('/cleanup', methods=['POST'])
def manual_cleanup():
    """Manual cleanup endpoint"""
    try:
        # Clean up old images
        image_service.cleanup_old_images()
        
        # Unload unused models
        image_service.unload_unused_models()
        
        return jsonify({
            "success": True,
            "message": "Cleanup completed successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error in manual cleanup: {e}")
        return jsonify({
            "success": False,
            "error": "Error during cleanup"
        }), 500

@app.route('/images', methods=['GET'])
def get_image_history():
    """Get list of generated images"""
    try:
        image_files = []
        for ext in ["*.png", "*.jpg", "*.jpeg"]:
            image_files.extend(glob.glob(os.path.join(IMAGES_DIR, ext)))
        
        # Sort by modification time (newest first)
        image_files.sort(key=os.path.getmtime, reverse=True)
        
        images = []
        for filepath in image_files[:20]:  # Limit to 20 most recent
            filename = os.path.basename(filepath)
            stat = os.stat(filepath)
            
            images.append({
                "filename": filename,
                "url": f"/images/{filename}",
                "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "size_bytes": stat.st_size
            })
        
        return jsonify({
            "success": True,
            "images": images,
            "total_count": len(image_files)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting image history: {e}")
        return jsonify({
            "success": False,
            "error": "Error retrieving image history"
        }), 500
    try:
        logger.info("Manual cleanup initiated")
        
        # Cleanup images
        image_service.cleanup_old_images()
        
        # Unload unused models
        image_service.unload_unused_models()
        
        # Force garbage collection
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        memory_after = image_service.get_memory_usage()
        
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

