"""
Configuration file for backend optimizations
Adjust these values based on your system's capabilities
"""

import os

# Memory Management Settings
MAX_MODELS_IN_MEMORY = 1  # Number of models to keep in memory simultaneously
MODEL_TIMEOUT = 300  # Seconds before unloading unused models (5 minutes)
MAX_MEMORY_USAGE_MB = 8000  # Maximum memory usage before rejecting requests (8GB)

# Image Management Settings
MAX_IMAGES_TO_KEEP = 10  # Maximum number of generated images to keep
IMAGE_QUALITY = 85  # JPEG quality for saved images (1-100)
IMAGE_SIZE = 512  # Size of generated images (512x512 for lower memory usage)

# Generation Settings
DEFAULT_INFERENCE_STEPS = 20  # Reduced from default 50 for faster generation
DEFAULT_GUIDANCE_SCALE = 7.5  # Standard guidance scale

# Cleanup Settings
CLEANUP_INTERVAL = 60  # Seconds between automatic cleanups
AUTO_CLEANUP_ENABLED = True  # Enable automatic cleanup

# Server Settings
DEBUG_MODE = False  # Disable debug mode for production (reduces memory usage)
THREADED = True  # Enable threading for concurrent requests
HOST = '0.0.0.0'
PORT = 5000

# Model Paths
MODEL_PATHS = {
    "dreamshaper": os.path.join("backend", "models", "dreamshaper_model", "dreamshaper_model"),
    "realistic_vision": os.path.join("backend", "models", "realistic_vision_model", "realistic_vision_model")
}

# Directories
IMAGES_DIR = os.path.join("backend", "images")

# Performance Monitoring
ENABLE_MEMORY_MONITORING = True  # Enable memory usage tracking
LOG_MEMORY_USAGE = True  # Log memory usage in responses

# Optimization Flags
ENABLE_ATTENTION_SLICING = True
ENABLE_MODEL_CPU_OFFLOAD = True
ENABLE_VAE_SLICING = True
ENABLE_SEQUENTIAL_CPU_OFFLOAD = True
LOW_CPU_MEM_USAGE = True

# Style Detection Weights
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