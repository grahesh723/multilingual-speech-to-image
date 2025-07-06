# Speech-to-Image SaaS Backend

A robust Flask backend for the Speech-to-Image SaaS application, featuring speech recognition, AI image generation, and comprehensive memory management.

## Features

- **Speech Recognition**: Audio-to-text conversion using OpenAI Whisper
- **AI Image Generation**: Text-to-image generation using Stable Diffusion models
- **Memory Management**: Intelligent model caching and cleanup
- **Rate Limiting**: Request throttling to prevent abuse
- **Auto Style Detection**: Smart model selection based on prompt content
- **Image History**: Track and serve generated images
- **Health Monitoring**: System status and resource usage tracking

## Architecture

The backend is organized into modular services:

- **`app.py`**: Main Flask application with API endpoints
- **`speech_service.py`**: Speech recognition and audio processing
- **`image_service.py`**: AI image generation and model management
- **`model_loader.py`**: Model loading and optimization
- **`config.py`**: Configuration settings and constants

## API Endpoints

### Speech Recognition
- `POST /transcribe-audio` - Convert audio file to text

### Image Generation
- `POST /generate-image` - Generate image from text prompt
- `GET /images/<filename>` - Serve generated images
- `GET /images` - Get image history

### System Management
- `GET /status` - Get server status and system info
- `POST /cleanup` - Manual cleanup of old files
- `GET /health` - Health check endpoint

## Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Download AI Models** (optional - will download automatically on first use):
   ```bash
   # The models will be downloaded automatically when first used
   # You can also manually download them to speed up first run
   ```

3. **Set up environment variables** (optional):
   ```bash
   export HOST=0.0.0.0
   export PORT=5000
   export DEBUG=False
   ```

## Running the Server

### Development Mode
```bash
python run.py
```

### Production Mode
```bash
# Set debug to false
export DEBUG=False
python run.py
```

### Using Gunicorn (Recommended for Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Configuration

Key configuration options in `config.py`:

- **Memory Management**: Control model caching and memory usage
- **Image Settings**: Quality, size, and retention policies
- **Generation Parameters**: Inference steps, guidance scale
- **Rate Limiting**: Request limits and timeouts

## Model Management

The backend supports two main image generation models:

1. **Dreamshaper**: Best for artistic, fantasy, and stylized images
2. **Realistic Vision**: Best for photorealistic and cinematic images

Models are automatically selected based on prompt content, or you can specify manually.

## Memory Optimization

- **Lazy Loading**: Models are loaded only when needed
- **LRU Caching**: Least recently used models are unloaded
- **Automatic Cleanup**: Old images and unused models are cleaned up
- **Memory Monitoring**: Real-time memory usage tracking

## Error Handling

- **Input Validation**: Comprehensive prompt and file validation
- **Rate Limiting**: Prevents abuse and overload
- **Graceful Degradation**: Continues operation even with partial failures
- **Detailed Logging**: Comprehensive error tracking and debugging

## Security Features

- **Input Sanitization**: Removes potentially dangerous content
- **File Validation**: Checks file types and sizes
- **Path Traversal Protection**: Prevents directory traversal attacks
- **Rate Limiting**: Prevents abuse and DoS attacks

## Monitoring

The backend provides comprehensive monitoring:

- **System Status**: CPU, memory, and disk usage
- **Model Status**: Loaded models and memory usage
- **Generation Status**: Current generation state
- **Image Statistics**: Count and storage usage

## Development

### Adding New Models

1. Update `model_loader.py` with new model paths
2. Add model-specific keywords to `config.py`
3. Update style detection logic in `image_service.py`

### Adding New Endpoints

1. Add route in `app.py`
2. Implement validation and error handling
3. Add appropriate logging
4. Update documentation

## Troubleshooting

### Common Issues

1. **Out of Memory**: Reduce `MAX_MODELS_IN_MEMORY` in config
2. **Slow Generation**: Increase `DEFAULT_INFERENCE_STEPS` for better quality
3. **Model Loading Errors**: Check model paths and permissions
4. **Audio Processing Issues**: Verify audio file format and size

### Logs

Logs are stored in `logs/app.log` with rotation enabled.

## Performance Tips

1. **Use GPU**: Ensure CUDA is available for faster generation
2. **Optimize Memory**: Adjust model cache settings based on available RAM
3. **Batch Processing**: Consider implementing batch generation for multiple requests
4. **CDN**: Use a CDN for serving generated images in production

## License

This project is part of the Speech-to-Image SaaS application. 