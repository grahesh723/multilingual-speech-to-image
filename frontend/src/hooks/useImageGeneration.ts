import { useState, useCallback } from 'react';
import { imageGenerationAPI } from '../services/api';
import { ImageGenerationRequest, ImageGenerationResponse } from '../types';

interface UseImageGenerationReturn {
  isGenerating: boolean;
  generatedImage: ImageGenerationResponse | null;
  error: string | null;
  generateImage: (request: ImageGenerationRequest) => Promise<void>;
  clearError: () => void;
  clearGeneratedImage: () => void;
}

export const useImageGeneration = (): UseImageGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (request: ImageGenerationRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await imageGenerationAPI.generateImage(request);
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
    generateImage,
    clearError,
    clearGeneratedImage,
  };
}; 