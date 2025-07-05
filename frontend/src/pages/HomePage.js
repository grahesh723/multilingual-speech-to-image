import React, { useState, useRef } from 'react';
import { 
  Mic, MicOff, Upload, Download, Type, Image, Play, Pause, X, RefreshCw, 
  Square, Settings, History, Crown, 
  Palette, Sliders, Save, Share2, Key, 
  Sparkles, Gem
} from 'lucide-react';
import { Header } from '../components/Header';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { SettingsModal } from '../components/SettingsModal';
import { HistoryModal } from '../components/HistoryModal';
import { PricingModal } from '../components/PricingModal';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useServerStatus } from '../hooks/useServerStatus';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { formatTime, formatFileSize } from '../utils/formatting';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

/**
 * Main HomePage component for the AI image generation application
 * @returns {JSX.Element} HomePage component
 */
export const HomePage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('speech');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [styleSettings, setStyleSettings] = useState({
    imageStyle: 'realistic',
    artStyle: 'classical',
    quality: 'standard'
  });
  const [imageHistory, setImageHistory] = useState([
    { id: 1, prompt: 'Renaissance portrait', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop', created: '2 hours ago' },
    { id: 2, prompt: 'Baroque landscape', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop', created: '1 day ago' },
    { id: 3, prompt: 'Classical architecture', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=200&h=200&fit=crop', created: '3 days ago' }
  ]);
  
  // Custom hooks
  const { isGenerating, generatedImage, generateImage, clearGeneratedImage } = useImageGeneration();
  const { 
    isRecording, recordingTime, audioData, hasRecordingData, 
    startRecording, stopRecording, clearRecording 
  } = useAudioRecording();
  
  const fileInputRef = useRef(null);

  // Mock user data
  const [currentUser, setCurrentUser] = useState({
    name: 'Artist Pro',
    email: 'artist@example.com',
    plan: 'Pro',
    creditsUsed: 45,
    creditsLimit: 100,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  });



  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      credits: 10,
      features: ['10 images/month', 'Basic styles', 'Standard quality', 'Community support'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'month',
      credits: 100,
      features: ['100 images/month', 'All styles', 'HD quality', 'Priority support', 'API access', 'Commercial license'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      credits: 500,
      features: ['500 images/month', 'Custom styles', '4K quality', 'Dedicated support', 'Full API', 'White-label option'],
      popular: false
    }
  ];

  // Event handlers
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setAudioProgress(0);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile({
        file,
        name: file.name,
        size: file.size,
      });
      setIsPlaying(false);
      setAudioProgress(0);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
      setTimeout(() => {
        setTranscribedText('A majestic Renaissance portrait with classical lighting and rich textures');
      }, 500);
    } else {
      startRecording();
    }
  };

  const handleGenerate = async () => {
    if (currentUser.creditsUsed >= currentUser.creditsLimit) {
      alert('Credit limit reached! Please upgrade your plan.');
      return;
    }
    
    setProcessingStage('Analyzing input...');
    
    setTimeout(() => {
      setProcessingStage('Transcribing audio...');
    }, 1000);

    setTimeout(() => {
      setProcessingStage('Generating image...');
    }, 2000);

    setTimeout(async () => {
      try {
        const prompt = transcribedText || textInput || 'A beautiful artwork';
        await generateImage({ prompt });
        setCurrentUser(prev => ({ ...prev, creditsUsed: prev.creditsUsed + 1 }));
        setProcessingStage('');
      } catch (err) {
        console.error('Generation failed:', err);
        setProcessingStage('');
      }
    }, 3500);
  };

  const handleClearAll = () => {
    setTextInput('');
    setAudioFile(null);
    clearRecording();
    setIsPlaying(false);
    clearGeneratedImage();
    setTranscribedText('');
    setAudioProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = `${API_BASE}/${generatedImage.image_path}`;
      link.download = 'generated-artwork.jpg';
      link.click();
    }
  };

  const handleSaveToHistory = () => {
    if (generatedImage) {
      const newItem = {
        id: Date.now(),
        prompt: transcribedText || textInput || 'Generated artwork',
        image: `${API_BASE}/${generatedImage.image_path}`,
        created: 'Just now',
        model_name: generatedImage.model_name,
        selected_style: generatedImage.selected_style,
        generation_time: generatedImage.generation_time,
      };
      setImageHistory(prev => [newItem, ...prev]);
    }
  };

  const tabs = [
    { id: 'speech', label: 'Speech', icon: Mic },
    { id: 'audio', label: 'Audio File', icon: Upload },
    { id: 'text', label: 'Text', icon: Type }
  ];

  // Audio progress simulation
  React.useEffect(() => {
    if (isPlaying && audioFile) {
      const progressInterval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(progressInterval);
    }
  }, [isPlaying, audioFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50">
      <Header
        currentUser={currentUser}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        setShowHistory={setShowHistory}
        setShowPricing={setShowPricing}
        setShowSettings={setShowSettings}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-light mb-4 bg-gradient-to-r from-stone-800 via-amber-800 to-yellow-800 bg-clip-text text-transparent tracking-tight">
            Transform Voice to Art
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light">
            Create masterpieces with the power of your voice and classical AI artistry ✨
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gradient-to-r from-stone-200 to-amber-200 rounded-2xl p-1.5 shadow-lg border border-amber-300">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-white shadow-lg transform scale-105'
                        : 'text-stone-700 hover:text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Input */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Content */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-8 shadow-xl border border-amber-200">
                {activeTab === 'speech' && (
                  <div className="text-center space-y-8">
                    <div>
                      <h3 className="text-2xl font-light mb-2 bg-gradient-to-r from-stone-800 to-amber-800 bg-clip-text text-transparent">Record Your Vision</h3>
                      <p className="text-stone-600">Speak your artistic vision into existence</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center space-y-6">
                        <button
                          onClick={handleRecordToggle}
                          className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 relative ${
                            isRecording 
                              ? 'bg-gradient-to-r from-red-100 to-rose-100 border-red-400 text-red-600 shadow-lg' 
                              : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-400 text-amber-700 hover:shadow-lg'
                          }`}
                        >
                          {isRecording ? (
                            <MicOff className="w-8 h-8" />
                          ) : (
                            <Mic className="w-8 h-8" />
                          )}
                          
                          {isRecording && (
                            <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
                          )}
                        </button>
                        
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-300 w-80 shadow-inner">
                          <AudioVisualizer data={audioData} isActive={isRecording} />
                        </div>
                      </div>
                    </div>

                    {(isRecording || hasRecordingData) && (
                      <div className="space-y-4">
                        <div className="flex justify-center items-center gap-2 text-amber-800">
                          {isRecording && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                          <span className="font-medium">
                            {isRecording ? `Recording: ${formatTime(recordingTime)}` : 'Recording Complete'}
                          </span>
                        </div>
                        
                        {isRecording && (
                          <div className="flex justify-center">
                            <button
                              onClick={stopRecording}
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                            >
                              <Square className="w-4 h-4" />
                              Stop Recording
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {transcribedText && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 text-left border border-amber-300">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">Transcribed Vision:</h4>
                        <p className="text-stone-800">{transcribedText}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'audio' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-light mb-2 bg-gradient-to-r from-stone-800 to-amber-800 bg-clip-text text-transparent">Upload Audio</h3>
                      <p className="text-stone-600">Choose an audio file containing your artistic description</p>
                    </div>
                    
                    <div 
                      className="border-2 border-dashed border-amber-400 rounded-xl p-8 text-center hover:border-amber-500 hover:bg-amber-50 transition-all duration-300 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                      <p className="text-stone-700 mb-2">Drop your audio file here or click to browse</p>
                      <p className="text-sm text-stone-500">Supports MP3, WAV, M4A (Max 10MB)</p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </div>

                    {audioFile && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-300">
                        <div className="flex items-center gap-4 mb-3">
                          <button
                            onClick={handlePlayToggle}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-200 to-yellow-200 flex items-center justify-center hover:from-amber-300 hover:to-yellow-300 transition-all duration-300 transform hover:scale-105"
                          >
                            {isPlaying ? <Pause className="w-5 h-5 text-amber-800" /> : <Play className="w-5 h-5 text-amber-800" />}
                          </button>
                          <div className="flex-1">
                            <div className="text-sm text-amber-900 mb-1 font-medium">{audioFile.name}</div>
                            <div className="text-xs text-amber-700">{formatFileSize(audioFile.size)}</div>
                          </div>
                          <button 
                            onClick={() => setAudioFile(null)}
                            className="text-amber-500 hover:text-amber-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full transition-all duration-300"
                            style={{ width: `${audioProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {transcribedText && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-300">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">Transcribed Vision:</h4>
                        <p className="text-stone-800">{transcribedText}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-light mb-2 bg-gradient-to-r from-stone-800 to-amber-800 bg-clip-text text-transparent">Text Description</h3>
                      <p className="text-stone-600">Describe your artistic vision in words</p>
                    </div>
                    
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="A Renaissance portrait with dramatic chiaroscuro lighting, depicting a noble figure in rich velvet robes against a dark background..."
                      className="w-full h-40 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none"
                      maxLength={500}
                    />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500">{textInput.length}/500 characters</span>
                      <button
                        onClick={() => setTextInput('')}
                        className="text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-stone-800">Style Settings</h4>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    <Sliders className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stone-700 mb-1">Style</label>
                    <div className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
                      {styleSettings.imageStyle.charAt(0).toUpperCase() + styleSettings.imageStyle.slice(1)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-stone-700 mb-1">Art Period</label>
                    <div className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
                      {styleSettings.artStyle.charAt(0).toUpperCase() + styleSettings.artStyle.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              {isGenerating && (
                <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-6 shadow-xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                    <span className="text-lg font-medium bg-gradient-to-r from-stone-800 to-amber-800 bg-clip-text text-transparent">
                      {processingStage || 'Generating your masterpiece...'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-medium bg-gradient-to-r from-stone-200 to-amber-200 hover:from-stone-300 hover:to-amber-300 text-stone-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <X className="w-5 h-5" />
                  Clear All
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || 
                    (activeTab === 'audio' && !audioFile) || 
                    (activeTab === 'text' && !textInput.trim()) ||
                    (activeTab === 'speech' && !hasRecordingData && !transcribedText)}
                  className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-medium bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Art...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Artwork
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Generated Image & Stats */}
            <div className="space-y-6">
              {/* User Stats */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-6 shadow-xl border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-stone-800">Your Plan</h4>
                  <div className="flex items-center gap-1 text-amber-700">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentUser.plan}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-600">Credits Used</span>
                      <span className="font-medium text-stone-800">{currentUser.creditsUsed}/{currentUser.creditsLimit}</span>
                    </div>
                    <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full transition-all duration-300"
                        style={{ width: `${(currentUser.creditsUsed / currentUser.creditsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowPricing(true)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Generated Image */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-6 shadow-xl border border-amber-200">
                <h3 className="text-xl font-medium mb-6 flex items-center gap-2 text-stone-800">
                  <Image className="w-5 h-5 text-amber-600" />
                  Your Masterpiece
                </h3>
                
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img 
                        src={`${API_BASE}/${generatedImage.image_path}`}
                        alt="Generated artwork" 
                        className="w-full h-80 object-cover rounded-xl transition-all duration-300 group-hover:scale-[1.02] shadow-lg border border-amber-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={handleSaveToHistory}
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-stone-200 to-amber-200 hover:from-stone-300 hover:to-amber-300 text-stone-800 rounded-lg transition-all duration-300 font-medium text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button 
                        className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-stone-200 to-amber-200 hover:from-stone-300 hover:to-amber-300 text-stone-800 rounded-lg transition-all duration-300 font-medium text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-amber-200 to-yellow-200 hover:from-amber-300 hover:to-yellow-300 text-amber-800 py-3 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-105 shadow-lg border border-amber-300"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Recreate
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="flex-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-600 text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 border-2 border-dashed border-amber-400 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50">
                    <div className="text-center">
                      <Palette className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                      <p className="text-amber-800 mb-2 text-lg font-medium">Your artwork awaits</p>
                      <p className="text-sm text-amber-700">Speak your vision to create art ✨</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-6 shadow-xl border border-amber-200">
                <h4 className="text-lg font-medium text-stone-800 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowHistory(true)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-amber-100 rounded-lg text-stone-700 transition-colors"
                  >
                    <History className="w-5 h-5 text-amber-600" />
                    <span>View History</span>
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-amber-100 rounded-lg text-stone-700 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-amber-600" />
                    <span>Style Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-amber-100 rounded-lg text-stone-700 transition-colors">
                    <Key className="w-5 h-5 text-amber-600" />
                    <span>API Access</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={styleSettings}
        onSettingsChange={setStyleSettings}
      />
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        imageHistory={imageHistory}
      />
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        pricingPlans={pricingPlans}
        currentUser={currentUser}
      />
    </div>
  );
}; 