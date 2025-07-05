export interface User {
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  creditsUsed: number;
  creditsLimit: number;
  avatar: string;
}

export interface GeneratedImage {
  id: number;
  prompt: string;
  image: string;
  created: string;
  model_name?: string;
  selected_style?: string;
  generation_time?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  artStyle?: string;
  quality?: string;
}

export interface ImageGenerationResponse {
  image_path: string;
  selected_style: string;
  model_name: string;
  dreamshaper_score: number;
  realistic_vision_score: number;
  dreamshaper_keywords: string[];
  realistic_vision_keywords: string[];
  generation_time: string;
  prompt_length: number;
  memory_usage_mb?: number;
}

export interface ServerStatus {
  server_status: string;
  timestamp: string;
  memory_usage_mb: number;
  memory_percent: number;
  cpu_percent: number;
  disk_percent: number;
  models_loaded: string[];
  is_generating: boolean;
  images_count: number;
  uptime: number;
  gpu_available?: boolean;
  gpu_memory_allocated_gb?: number;
  gpu_memory_reserved_gb?: number;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  credits: number;
  features: string[];
  popular: boolean;
}

export interface AudioFile {
  file: File;
  name: string;
  size: number;
  duration?: number;
}

export type InputTab = 'speech' | 'audio' | 'text';

export interface ProcessingStage {
  stage: string;
  progress: number;
}

export interface StyleSettings {
  imageStyle: 'realistic' | 'anime' | 'artistic' | 'abstract';
  artStyle: 'classical' | 'renaissance' | 'baroque' | 'impressionist' | 'modern';
  quality: 'standard' | 'hd' | '4k';
}

export interface AudioVisualizerData {
  data: number[];
  isActive: boolean;
}

export interface ModalState {
  settings: boolean;
  history: boolean;
  pricing: boolean;
  userMenu: boolean;
} 