#!/usr/bin/env python3
"""
Startup script for the Speech-to-Image SaaS backend
"""

import os
import sys
from app import app, setup_logging
from config import HOST, PORT, DEBUG_MODE, THREADED

def main():
    """Main startup function"""
    # Setup logging
    setup_logging()
    
    # Create necessary directories
    os.makedirs("images", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    # Get configuration
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Starting Speech-to-Image SaaS Backend")
    print(f"📍 Server: {host}:{port}")
    print(f"🐛 Debug mode: {debug}")
    print(f"📁 Images directory: {os.path.abspath('images')}")
    print(f"📝 Logs directory: {os.path.abspath('logs')}")
    
    # Start the server
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )

if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=DEBUG_MODE, threaded=THREADED) 