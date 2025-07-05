# AI Image Generation Frontend

A modern, responsive React application for AI-powered image generation with speech-to-text, audio upload, and text input capabilities.

## 🚀 Features

### Core Functionality
- **Speech Recording**: Record your artistic vision with real-time audio visualization
- **Audio Upload**: Upload audio files for transcription and image generation
- **Text Input**: Direct text input for precise prompt control
- **AI Image Generation**: Generate high-quality images using Stable Diffusion models
- **Style Selection**: Choose from multiple art styles and periods

### User Experience
- **Modern UI**: Beautiful gradient design with smooth animations
- **Real-time Status**: Monitor server resources and generation progress
- **Image History**: View and manage previously generated images
- **Download & Share**: Save and share your generated artwork
- **Responsive Design**: Works perfectly on desktop and mobile devices

### Advanced Features
- **Credit System**: Track usage with configurable limits
- **Pricing Plans**: Multiple subscription tiers (Free, Pro, Enterprise)
- **Settings Management**: Customize generation parameters
- **Error Handling**: Comprehensive error messages and recovery
- **Performance Monitoring**: Real-time server status and resource usage

## 🛠️ Technology Stack

- **React 18** with JavaScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **Custom Hooks** for state management

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Navigation and user menu
│   ├── AudioVisualizer.js # Audio recording visualization
│   ├── Modal.js        # Base modal component
│   ├── SettingsModal.js # Style settings modal
│   ├── HistoryModal.js # Image history modal
│   └── PricingModal.js # Pricing plans modal
├── pages/              # Page components
│   └── HomePage.js     # Main application page
├── hooks/              # Custom React hooks
│   ├── useImageGeneration.js # Image generation logic
│   ├── useServerStatus.js # Server monitoring
│   └── useAudioRecording.js # Audio recording functionality
├── services/           # API services
│   └── api.js         # Backend communication
├── types/              # JSDoc type definitions
│   └── index.js       # All application types
├── utils/              # Utility functions
│   └── formatting.js  # Data formatting helpers
└── contexts/           # React contexts (future use)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE=http://localhost:5000
```

## 🎨 Usage

### Speech Recording
1. Click the microphone button to start recording
2. Speak your artistic vision clearly
3. Click "Stop Recording" when finished
4. Review the transcribed text
5. Click "Generate Artwork" to create your image

### Audio Upload
1. Click the "Audio File" tab
2. Upload an audio file (MP3, WAV, M4A)
3. Preview the audio if needed
4. The system will transcribe the audio
5. Generate your artwork

### Text Input
1. Click the "Text" tab
2. Type your artistic description
3. Use up to 500 characters
4. Click "Generate Artwork"

### Style Settings
1. Click the settings icon in the Style Settings panel
2. Choose your preferred image style and art period
3. Select quality level based on your plan
4. Save your settings

## 🔧 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Component styles in individual component files
- Global styles in `src/index.css`

### API Configuration
Modify API endpoints in `src/services/api.js`:
- Base URL configuration
- Request/response interceptors
- Error handling logic

### Features
Add new features by:
- Creating new components in `src/components/`
- Adding new hooks in `src/hooks/`
- Extending types in `src/types/index.js`

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with side-by-side layout
- **Tablet**: Optimized layout with stacked panels
- **Mobile**: Touch-friendly interface with simplified navigation

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting support
- Secure file upload handling
- XSS protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload the `build` folder to S3
- **Docker**: Use the provided Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the backend API documentation
- Open an issue on GitHub

## 🔮 Future Enhancements

- **Real-time Collaboration**: Share generation sessions
- **Advanced Filters**: More style and quality options
- **Batch Processing**: Generate multiple images at once
- **API Integration**: Third-party service connections
- **Mobile App**: Native iOS/Android applications
