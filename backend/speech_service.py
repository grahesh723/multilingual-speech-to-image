"""
Speech recognition service for handling audio processing and transcription
"""

import whisper
import os
import tempfile
import logging
from pydub import AudioSegment
import io
import numpy as np

logger = logging.getLogger(__name__)

class SpeechService:
    def __init__(self):
        """Initialize the speech service with Whisper model"""
        self.model = None
        self.model_loaded = False
        
    def load_model(self, model_size="base"):
        """Load Whisper model (lazy loading)"""
        if not self.model_loaded:
            try:
                logger.info(f"Loading Whisper model: {model_size}")
                self.model = whisper.load_model(model_size)
                self.model_loaded = True
                logger.info("Whisper model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading Whisper model: {e}")
                raise
    
    def process_audio(self, audio_data, audio_format="wav"):
        """
        Process audio data and convert to text
        
        Args:
            audio_data: Raw audio data (bytes)
            audio_format: Audio format (wav, mp3, etc.)
            
        Returns:
            dict: Transcription result with text and confidence
        """
        try:
            # Load model if not loaded
            if not self.model_loaded:
                self.load_model()
            
            # Create temporary file for audio processing
            with tempfile.NamedTemporaryFile(suffix=f".{audio_format}", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe audio
                result = self.model.transcribe(temp_file_path)
                
                # Extract text and confidence
                text = result.get("text", "").strip()
                language = result.get("language", "en")
                
                # Calculate confidence (average of segment confidences if available)
                confidence = 0.0
                if "segments" in result and result["segments"]:
                    confidences = [seg.get("avg_logprob", 0) for seg in result["segments"]]
                    confidence = np.mean(confidences) if confidences else 0.0
                
                return {
                    "text": text,
                    "confidence": confidence,
                    "language": language,
                    "success": True
                }
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Error processing audio: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "language": "en",
                "success": False,
                "error": str(e)
            }
    
    def convert_audio_format(self, audio_data, input_format, output_format="wav"):
        """
        Convert audio format using pydub
        
        Args:
            audio_data: Raw audio data
            input_format: Input audio format
            output_format: Output audio format
            
        Returns:
            bytes: Converted audio data
        """
        try:
            # Load audio from bytes
            audio = AudioSegment.from_file(io.BytesIO(audio_data), format=input_format)
            
            # Export to desired format
            output_buffer = io.BytesIO()
            audio.export(output_buffer, format=output_format)
            
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error converting audio format: {e}")
            raise
    
    def validate_audio(self, audio_data, max_size_mb=10):
        """
        Validate audio data
        
        Args:
            audio_data: Raw audio data
            max_size_mb: Maximum allowed size in MB
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not audio_data:
            return False
        
        # Check file size
        size_mb = len(audio_data) / (1024 * 1024)
        if size_mb > max_size_mb:
            logger.warning(f"Audio file too large: {size_mb:.2f}MB (max: {max_size_mb}MB)")
            return False
        
        return True
    
    def get_supported_formats(self):
        """Get list of supported audio formats"""
        return ["wav", "mp3", "m4a", "ogg", "flac", "aac"] 