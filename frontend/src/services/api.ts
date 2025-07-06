import axios from 'axios';
import type { ApiResponse, LoginRequest, LoginResponse, LoveNote, NoteHistory } from '../types';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/love-notes-demo/us-central1/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please check your credentials.',
      };
    }
  },
};

// Notes API
export const notesAPI = {
  send: async (imageBlob: Blob, fromUserId: string, toUserId: string): Promise<ApiResponse<LoveNote>> => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'love-note.png');
      formData.append('fromUserId', fromUserId);
      formData.append('toUserId', toUserId);

      const response = await apiClient.post('/notes/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Send note error:', error);
      return {
        success: false,
        error: 'Failed to send love note. Please try again.',
      };
    }
  },

  getHistory: async (userId: string): Promise<ApiResponse<NoteHistory>> => {
    try {
      const response = await apiClient.get(`/notes/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get history error:', error);
      return {
        success: false,
        error: 'Failed to load note history.',
      };
    }
  },

  getLatest: async (userId: string): Promise<ApiResponse<LoveNote | null>> => {
    try {
      const response = await apiClient.get(`/notes/latest/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get latest note error:', error);
      return {
        success: false,
        error: 'Failed to load latest note.',
      };
    }
  },
};

export default apiClient; 