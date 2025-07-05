import axios from 'axios';

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
  (response) => {
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

/**
 * Generate image from text prompt
 * @param {Object} request - The image generation request
 * @param {string} request.prompt - The text prompt
 * @returns {Promise<Object>} The generated image response
 */
export const generateImage = async (request) => {
  const response = await api.post('/generate-image', {
    prompt: request.prompt,
  });
  return response.data;
};

/**
 * Get server status and resource usage
 * @returns {Promise<Object>} Server status information
 */
export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Manual cleanup endpoint
 * @returns {Promise<Object>} Cleanup result
 */
export const cleanup = async () => {
  const response = await api.post('/cleanup');
  return response.data;
};

/**
 * Transcribe audio file (placeholder for future implementation)
 * @param {File} audioFile - The audio file to transcribe
 * @returns {Promise<Object>} Transcription result
 */
export const transcribeAudio = async (audioFile) => {
  // This would be implemented when audio transcription is added to backend
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  // For now, return a mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ text: 'A majestic Renaissance portrait with classical lighting and rich textures' });
    }, 2000);
  });
};

export default api; 