import axios, { AxiosResponse } from 'axios';
import { 
  ImageGenerationRequest, 
  ImageGenerationResponse, 
  ServerStatus 
} from '../types';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 minutes for image generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 429:
          throw new Error('Rate limit exceeded. Please wait before making another request.');
        case 503:
          throw new Error('Server is busy. Please try again later.');
        case 400:
          throw new Error(error.response.data?.error || 'Invalid request.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(error.response.data?.error || 'An error occurred.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
);

export const imageGenerationAPI = {
  /**
   * Generate image from text prompt
   */
  generateImage: async (request: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
    const response = await api.post<ImageGenerationResponse>('/generate-image', {
      prompt: request.prompt,
    });
    return response.data;
  },

  /**
   * Get server status and resource usage
   */
  getStatus: async (): Promise<ServerStatus> => {
    const response = await api.get<ServerStatus>('/status');
    return response.data;
  },

  /**
   * Health check endpoint
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  },

  /**
   * Manual cleanup endpoint
   */
  cleanup: async (): Promise<{ message: string; memory_usage_mb: number }> => {
    const response = await api.post<{ message: string; memory_usage_mb: number }>('/cleanup');
    return response.data;
  },
};

export const audioTranscriptionAPI = {
  /**
   * Transcribe audio file (placeholder for future implementation)
   */
  transcribeAudio: async (audioFile: File): Promise<{ text: string }> => {
    // This would be implemented when audio transcription is added to backend
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    // For now, return a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ text: 'A majestic Renaissance portrait with classical lighting and rich textures' });
      }, 2000);
    });
  },
};

export default api; 