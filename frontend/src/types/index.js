/**
 * @typedef {Object} User
 * @property {string} name - User's display name
 * @property {string} email - User's email address
 * @property {'Free' | 'Pro' | 'Enterprise'} plan - User's subscription plan
 * @property {number} creditsUsed - Number of credits used
 * @property {number} creditsLimit - Total credit limit
 * @property {string} avatar - URL to user's avatar image
 */

/**
 * @typedef {Object} GeneratedImage
 * @property {number} id - Unique identifier
 * @property {string} prompt - The prompt used to generate the image
 * @property {string} image - URL to the generated image
 * @property {string} created - When the image was created
 * @property {string} [model_name] - Name of the model used
 * @property {string} [selected_style] - Style that was selected
 * @property {string} [generation_time] - Time taken to generate
 */

/**
 * @typedef {Object} ImageGenerationRequest
 * @property {string} prompt - The text prompt for image generation
 * @property {string} [style] - Optional style parameter
 * @property {string} [artStyle] - Optional art style parameter
 * @property {string} [quality] - Optional quality parameter
 */

/**
 * @typedef {Object} ImageGenerationResponse
 * @property {string} image_path - Path to the generated image
 * @property {string} selected_style - Style that was selected
 * @property {string} model_name - Name of the model used
 * @property {number} dreamshaper_score - Score for dreamshaper model
 * @property {number} realistic_vision_score - Score for realistic vision model
 * @property {string[]} dreamshaper_keywords - Keywords matched for dreamshaper
 * @property {string[]} realistic_vision_keywords - Keywords matched for realistic vision
 * @property {string} generation_time - Time taken to generate
 * @property {number} prompt_length - Length of the prompt
 * @property {number} [memory_usage_mb] - Memory usage in MB
 */

/**
 * @typedef {Object} ServerStatus
 * @property {string} server_status - Current server status
 * @property {string} timestamp - Timestamp of the status
 * @property {number} memory_usage_mb - Memory usage in MB
 * @property {number} memory_percent - Memory usage percentage
 * @property {number} cpu_percent - CPU usage percentage
 * @property {number} disk_percent - Disk usage percentage
 * @property {string[]} models_loaded - List of loaded models
 * @property {boolean} is_generating - Whether currently generating
 * @property {number} images_count - Number of images generated
 * @property {number} uptime - Server uptime in seconds
 * @property {boolean} [gpu_available] - Whether GPU is available
 * @property {number} [gpu_memory_allocated_gb] - GPU memory allocated in GB
 * @property {number} [gpu_memory_reserved_gb] - GPU memory reserved in GB
 */

/**
 * @typedef {Object} PricingPlan
 * @property {string} name - Plan name
 * @property {string} price - Plan price
 * @property {string} period - Billing period
 * @property {number} credits - Number of credits included
 * @property {string[]} features - List of plan features
 * @property {boolean} popular - Whether this is the popular plan
 */

/**
 * @typedef {Object} AudioFile
 * @property {File} file - The audio file object
 * @property {string} name - File name
 * @property {number} size - File size in bytes
 * @property {number} [duration] - Audio duration in seconds
 */

/**
 * @typedef {'speech' | 'audio' | 'text'} InputTab
 */

/**
 * @typedef {Object} ProcessingStage
 * @property {string} stage - Current processing stage
 * @property {number} progress - Progress percentage
 */

/**
 * @typedef {Object} StyleSettings
 * @property {'realistic' | 'anime' | 'artistic' | 'abstract'} imageStyle - Image style
 * @property {'classical' | 'renaissance' | 'baroque' | 'impressionist' | 'modern'} artStyle - Art style
 * @property {'standard' | 'hd' | '4k'} quality - Image quality
 */

/**
 * @typedef {Object} AudioVisualizerData
 * @property {number[]} data - Audio visualization data
 * @property {boolean} isActive - Whether audio is currently active
 */

/**
 * @typedef {Object} ModalState
 * @property {boolean} settings - Whether settings modal is open
 * @property {boolean} history - Whether history modal is open
 * @property {boolean} pricing - Whether pricing modal is open
 * @property {boolean} userMenu - Whether user menu is open
 */

// Export types for use in other files
export {}; 