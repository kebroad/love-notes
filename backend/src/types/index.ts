export interface User {
  username: string;
  password: string;
  images: number[];
  latest: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: string;
}

export interface CreateImageRequest {
  author: string;
  imageBase64: string;
}

export interface CreateImageResponse {
  success: boolean;
  imageId: string;
  timestamp: number;
}

export interface GetImageResponse {
  success: boolean;
  timestamp: number;
  downloadUrl: string;
}

export interface ListImagesResponse {
  success: boolean;
  images: {
    id: string;
    timestamp: number;
    downloadUrl: string;
  }[];
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
} 