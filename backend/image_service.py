"""
Image generation service for handling AI image creation
"""

import os
import logging
import time
import gc
import torch
from PIL import Image
import io
import glob
import psutil
from datetime import datetime
from diffusers import StableDiffusionPipeline
import model_loader
from config import *

logger = logging.getLogger(__name__)

class ImageService:
    def __init__(self):
        """Initialize the image service"""
        self.model_cache = {}
        self.model_last_used = {}
        self.generation_lock = False
        
    def get_model(self, style):
        """Get model with enhanced memory management"""
        # Unload unused models first
        self.unload_unused_models()
        
        # If we have too many models in memory, unload the least recently used
        if len(self.model_cache) >= MAX_MODELS_IN_MEMORY:
            if style not in self.model_cache:
                # Find least recently used model
                lru_style = min(self.model_last_used.keys(), key=lambda k: self.model_last_used[k])
                logger.info(f"Unloading LRU model: {lru_style}")
                del self.model_cache[lru_style]
                del self.model_last_used[lru_style]
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
        
        # Load model if not in cache
        if style not in self.model_cache:
            logger.info(f"Loading model: {style}")
            self.model_cache[style] = model_loader.load_model(style)
        
        # Update last used time
        self.model_last_used[style] = time.time()
        
        return self.model_cache[style]
    
    def unload_unused_models(self):
        """Unload models that haven't been used recently"""
        current_time = time.time()
        models_to_unload = []
        
        for style, last_used in self.model_last_used.items():
            if current_time - last_used > MODEL_TIMEOUT:
                models_to_unload.append(style)
        
        for style in models_to_unload:
            if style in self.model_cache:
                logger.info(f"Unloading unused model: {style}")
                model_loader.unload_model(self.model_cache[style])
                del self.model_cache[style]
                del self.model_last_used[style]
    
    def detect_visual_style(self, prompt):
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
    
    def generate_image(self, prompt, style=None, images_dir=IMAGES_DIR):
        """
        Generate image from prompt
        
        Args:
            prompt: Text prompt for image generation
            style: Style to use (auto-detected if None)
            images_dir: Directory to save generated images
            
        Returns:
            dict: Generation result with filename and metadata
        """
        try:
            # Check if generation is already in progress
            if self.generation_lock:
                return {
                    "success": False,
                    "error": "Generation already in progress"
                }
            
            self.generation_lock = True
            
            # Auto-detect style if not provided
            if style is None:
                style, model_path, dreamshaper_score, realistic_score, found_dreamshaper, found_realistic = self.detect_visual_style(prompt)
                logger.info(f"Auto-detected style: {style} (dreamshaper: {dreamshaper_score}, realistic: {realistic_score})")
            
            # Get model
            pipe = self.get_model(style)
            
            # Generate image
            logger.info(f"Generating image with prompt: {prompt[:100]}...")
            
            # Track generation time
            start_time = time.time()
            
            # Set generation parameters
            generation_kwargs = {
                "prompt": prompt,
                "negative_prompt": "blurry, low quality, distorted, deformed",
                "num_inference_steps": DEFAULT_INFERENCE_STEPS,
                "guidance_scale": DEFAULT_GUIDANCE_SCALE,
                "width": IMAGE_SIZE,
                "height": IMAGE_SIZE
            }
            
            # Ensure model is on correct device
            device = "cuda" if torch.cuda.is_available() else "cpu"
            pipe = pipe.to(device)
            
            # Generate image
            result = pipe(**generation_kwargs)
            
            # Calculate generation time
            generation_time = time.time() - start_time
            image = result.images[0]
            
            # Save image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"generated_{timestamp}_{style}.png"
            filepath = os.path.join(images_dir, filename)
            
            # Ensure directory exists
            os.makedirs(images_dir, exist_ok=True)
            
            # Save image with quality settings
            image.save(filepath, "PNG", optimize=True)
            
            logger.info(f"Image generated successfully: {filename}")
            
            return {
                "success": True,
                "filename": filename,
                "filepath": filepath,
                "style": style,
                "prompt": prompt,
                "timestamp": timestamp,
                "metadata": {
                    "model": style,
                    "steps": DEFAULT_INFERENCE_STEPS,
                    "guidance_scale": DEFAULT_GUIDANCE_SCALE,
                    "size": f"{IMAGE_SIZE}x{IMAGE_SIZE}",
                    "generation_time": f"{generation_time:.2f}s"
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating image: {e}")
            
            # Handle specific meta tensor error
            if "meta tensor" in str(e).lower():
                logger.error("Meta tensor error detected. Trying to reload model...")
                try:
                    # Clear model cache and try again
                    if style in self.model_cache:
                        del self.model_cache[style]
                    if style in self.model_last_used:
                        del self.model_last_used[style]
                    
                    # Force garbage collection
                    gc.collect()
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
                    
                    return {
                        "success": False,
                        "error": "Model loading issue. Please try again."
                    }
                except Exception as reload_error:
                    logger.error(f"Error during model reload: {reload_error}")
            
            return {
                "success": False,
                "error": str(e)
            }
        finally:
            self.generation_lock = False
    
    def cleanup_old_images(self, max_images=MAX_IMAGES_TO_KEEP):
        """Remove old generated images to save disk space"""
        try:
            image_files = []
            for ext in ["*.png", "*.jpg", "*.jpeg"]:
                image_files.extend(glob.glob(os.path.join(IMAGES_DIR, ext)))
            
            if len(image_files) > max_images:
                # Sort by modification time (oldest first)
                image_files.sort(key=os.path.getmtime)
                # Remove oldest files
                for old_file in image_files[:-max_images]:
                    os.remove(old_file)
                    logger.info(f"Removed old image: {os.path.basename(old_file)}")
        except Exception as e:
            logger.error(f"Error during image cleanup: {e}")
    
    def get_memory_usage(self):
        """Get current memory usage in MB"""
        try:
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            # Get GPU memory if available
            gpu_memory = 0
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.memory_allocated() / 1024 / 1024
            
            return {
                "cpu_memory_mb": memory_mb,
                "gpu_memory_mb": gpu_memory,
                "models_loaded": len(self.model_cache)
            }
        except Exception as e:
            logger.error(f"Error getting memory usage: {e}")
            return {"cpu_memory_mb": 0, "gpu_memory_mb": 0, "models_loaded": 0} 