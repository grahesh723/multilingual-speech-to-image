import { useState, useCallback } from 'react';
import { generateImage } from '../services/api';

/**
 * Custom hook for managing image generation state and API calls
 * @returns {Object} Image generation state and functions
 */
export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const generateImageHandler = useCallback(async (request) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await generateImage(request);
      setGeneratedImage(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearGeneratedImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  return {
    isGenerating,
    generatedImage,
    error,
    generateImage: generateImageHandler,
    clearError,
    clearGeneratedImage,
  };
}; 