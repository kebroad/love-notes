// User types
export interface User {
  id: 'user_kevin' | 'user_nicole';
  username: 'kevin' | 'nicole';
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

// Love Note types
export interface LoveNote {
  id: string;
  fromUserId: 'user_kevin' | 'user_nicole';
  toUserId: 'user_kevin' | 'user_nicole';
  imageUrl: string;
  createdAt: string;
  deliveredAt: string | null;
  metadata: {
    imageSize: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface LoginRequest {
  username: 'kevin' | 'nicole';
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

// Canvas types
export interface CanvasExportData {
  blob: Blob;
  width: number;
  height: number;
}

// Note history types
export interface NoteHistory {
  sent: LoveNote[];
  received: LoveNote[];
} 