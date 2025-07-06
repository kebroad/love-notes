// User types
export interface User {
  id: 'user_joe' | 'user_jane';
  username: 'joe' | 'jane';
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

// Love Note types
export interface LoveNote {
  id: string;
  fromUserId: 'user_joe' | 'user_jane';
  toUserId: 'user_joe' | 'user_jane';
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
  username: 'joe' | 'jane';
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