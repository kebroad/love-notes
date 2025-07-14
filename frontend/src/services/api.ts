import axios from 'axios';
import type { ApiResponse, LoginRequest, LoginResponse, LoveNote, NoteHistory } from '../types';

// API base configuration - automatically detect environment
const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Allow override via environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('🔧 Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Auto-detect based on environment
  if (isDevelopment) {
    console.log('🔧 Development mode detected - using localhost backend');
    return 'http://localhost:5001/love-notes-kb-2025/us-central1/api';
  } else {
    console.log('🔧 Production mode detected - using Firebase Functions backend');
    return 'https://us-central1-love-notes-kb-2025.cloudfunctions.net/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 Final API Base URL:', API_BASE_URL);
console.log('🔧 Environment info:', {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper function to create basic auth header
const createAuthHeader = (username: string, password: string): string => {
  return 'Basic ' + btoa(`${username}:${password}`);
};

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const authHeader = createAuthHeader(credentials.username, credentials.password);
      const response = await apiClient.post('/auth', {}, {
        headers: {
          'Authorization': authHeader,
        },
      });
      
      if (response.data.authenticated) {
        const user = {
          id: (credentials.username === 'kevin' ? 'user_kevin' : 'user_nicole') as 'user_kevin' | 'user_nicole',
          username: credentials.username,
          displayName: credentials.username === 'kevin' ? 'Kevin' : 'Nicole',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        
        return {
          success: true,
          data: { user },
        };
      } else {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please check your credentials.',
      };
    }
  },
};

// Images API - matching the backend we built
export const imagesAPI = {
  // Upload a new image
  upload: async (imageBlob: Blob, username: string, password: string): Promise<ApiResponse<{ timestamp: number }>> => {
    try {
      // Convert blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      
      const authHeader = createAuthHeader(username, password);
      const response = await apiClient.post('/images', {
        author: username,
        imageBase64: base64
      }, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Upload image error:', error);
      return {
        success: false,
        error: 'Failed to upload image. Please try again.',
      };
    }
  },

  // Get the latest image
  getLatest: async (username: string, password: string): Promise<ApiResponse<{ timestamp: number; downloadUrl: string } | null>> => {
    try {
      const authHeader = createAuthHeader(username, password);
      const response = await apiClient.get(`/images/${username}`, {
        headers: {
          'Authorization': authHeader,
        },
      });
      
      // The backend returns { success: true, timestamp: number, downloadUrl: string }
      if (response.data.success) {
        return {
          success: true,
          data: {
            timestamp: response.data.timestamp,
            downloadUrl: response.data.downloadUrl,
          },
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to load latest image',
        };
      }
    } catch (error) {
      console.error('Get latest image error:', error);
      return {
        success: false,
        error: 'Failed to load latest image.',
      };
    }
  },

  // List all images
  list: async (username: string, password: string): Promise<ApiResponse<Array<{ timestamp: number; downloadUrl: string }>>> => {
    try {
      const authHeader = createAuthHeader(username, password);
      const response = await apiClient.get(`/images/${username}/list`, {
        headers: {
          'Authorization': authHeader,
        },
      });
      
      // The backend returns { success: true, images: [...] }
      if (response.data.success) {
        return {
          success: true,
          data: response.data.images,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to load images',
        };
      }
    } catch (error) {
      console.error('List images error:', error);
      return {
        success: false,
        error: 'Failed to load images.',
      };
    }
  },

  // Delete an image
  delete: async (timestamp: number, username: string, password: string): Promise<ApiResponse<void>> => {
    try {
      const authHeader = createAuthHeader(username, password);
      await apiClient.delete(`/images/${username}/${timestamp}`, {
        headers: {
          'Authorization': authHeader,
        },
      });
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete image error:', error);
      return {
        success: false,
        error: 'Failed to delete image.',
      };
    }
  },
};

// Legacy Notes API - keeping for backward compatibility but adapting to new backend
export const notesAPI = {
  send: async (imageBlob: Blob, fromUserId: string, toUserId: string, password: string): Promise<ApiResponse<LoveNote>> => {
    try {
      // Extract username from userId
      const username = fromUserId === 'user_kevin' ? 'kevin' : 'nicole';
      
      // Upload the image using the new API
      const uploadResult = await imagesAPI.upload(imageBlob, username, password);
      
      if (!uploadResult.success || !uploadResult.data) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload image',
        };
      }
      
      // Create a mock LoveNote object for compatibility
      const loveNote: LoveNote = {
        id: uploadResult.data.timestamp.toString(),
        fromUserId: fromUserId as 'user_kevin' | 'user_nicole',
        toUserId: toUserId as 'user_kevin' | 'user_nicole',
        imageUrl: '', // Will be populated when needed
        createdAt: new Date(uploadResult.data.timestamp * 1000).toISOString(),
        deliveredAt: new Date().toISOString(),
        metadata: {
          imageSize: imageBlob.size,
          dimensions: {
            width: 640,
            height: 400,
          },
        },
      };
      
      return {
        success: true,
        data: loveNote,
      };
    } catch (error) {
      console.error('Send note error:', error);
      return {
        success: false,
        error: 'Failed to send love note. Please try again.',
      };
    }
  },

  getHistory: async (userId: string, password: string): Promise<ApiResponse<NoteHistory>> => {
    try {
      // Extract username from userId
      const username = userId === 'user_kevin' ? 'kevin' : 'nicole';
      
      // Get all images for this user
      const imagesResult = await imagesAPI.list(username, password);
      
      if (!imagesResult.success || !imagesResult.data) {
        return {
          success: false,
          error: imagesResult.error || 'Failed to load history',
        };
      }
      
      // Convert images to LoveNote format
      const notes: LoveNote[] = imagesResult.data.map(image => ({
        id: image.timestamp.toString(),
        fromUserId: userId as 'user_kevin' | 'user_nicole',
        toUserId: userId === 'user_kevin' ? 'user_nicole' : 'user_kevin',
        imageUrl: image.downloadUrl,
        createdAt: new Date(image.timestamp * 1000).toISOString(),
        deliveredAt: new Date(image.timestamp * 1000).toISOString(),
        metadata: {
          imageSize: 0,
          dimensions: {
            width: 640,
            height: 400,
          },
        },
      }));
      
      return {
        success: true,
        data: {
          sent: notes,
          received: [], // For now, all notes are considered "sent"
        },
      };
    } catch (error) {
      console.error('Get history error:', error);
      return {
        success: false,
        error: 'Failed to load note history.',
      };
    }
  },

  getLatest: async (userId: string, password: string): Promise<ApiResponse<LoveNote | null>> => {
    try {
      // Extract username from userId
      const username = userId === 'user_kevin' ? 'kevin' : 'nicole';
      
      // Get the latest image
      const latestResult = await imagesAPI.getLatest(username, password);
      
      if (!latestResult.success) {
        return {
          success: false,
          error: latestResult.error || 'Failed to load latest note',
        };
      }
      
      if (!latestResult.data) {
        return {
          success: true,
          data: null,
        };
      }
      
      // Convert to LoveNote format
      const loveNote: LoveNote = {
        id: latestResult.data.timestamp.toString(),
        fromUserId: userId as 'user_kevin' | 'user_nicole',
        toUserId: userId === 'user_kevin' ? 'user_nicole' : 'user_kevin',
        imageUrl: latestResult.data.downloadUrl,
        createdAt: new Date(latestResult.data.timestamp * 1000).toISOString(),
        deliveredAt: new Date(latestResult.data.timestamp * 1000).toISOString(),
        metadata: {
          imageSize: 0,
          dimensions: {
            width: 640,
            height: 400,
          },
        },
      };
      
      return {
        success: true,
        data: loveNote,
      };
    } catch (error) {
      console.error('Get latest note error:', error);
      return {
        success: false,
        error: 'Failed to load latest note.',
      };
    }
  },
};

// Health check API
export const healthAPI = {
  check: async (): Promise<ApiResponse<{ status: string; timestamp: number }>> => {
    try {
      const response = await apiClient.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: 'Health check failed',
      };
    }
  },
};

export default apiClient; 