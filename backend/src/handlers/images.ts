import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as bcrypt from 'bcrypt';
import { CreateImageRequest, CreateImageResponse, GetImageResponse, ListImagesResponse, DeleteImageResponse, User } from '../types';

// Helper function to authenticate user
const authenticateUser = async (req: Request): Promise<string | null> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return null;
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      return null;
    }

    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(username.toLowerCase()).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data() as User;
    const isValidPassword = await bcrypt.compare(password, userData.password);
    
    return isValidPassword ? username.toLowerCase() : null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// POST /images - Create a new image
export const createImageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = await authenticateUser(req);
    if (!authenticatedUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { author, imageBase64 } = req.body as CreateImageRequest;

    if (!author || !imageBase64) {
      res.status(400).json({ success: false, message: 'Author and imageBase64 are required' });
      return;
    }

    if (author.toLowerCase() !== authenticatedUser) {
      res.status(403).json({ success: false, message: 'Cannot create image for different user' });
      return;
    }

    // Generate timestamp as image ID
    const timestamp = Date.now();
    const imageId = timestamp.toString();

    // Parse base64 image
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `images/${author.toLowerCase()}/${imageId}.jpg`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          uploadedBy: author.toLowerCase(),
          uploadedAt: new Date().toISOString(),
        }
      }
    });

    // Update user data in Firestore
    const db = admin.firestore();
    const userRef = db.collection('users').doc(author.toLowerCase());
    
    await userRef.update({
      images: FieldValue.arrayUnion(timestamp),
      latest: timestamp
    });

    const response: CreateImageResponse = {
      success: true,
      imageId,
      timestamp
    };

    res.json(response);
  } catch (error) {
    console.error('Create image error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /images/:author - Get latest image
export const getImageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = await authenticateUser(req);
    if (!authenticatedUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { author } = req.params;

    if (!author) {
      res.status(400).json({ success: false, message: 'Author parameter is required' });
      return;
    }

    // Get user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(author.toLowerCase()).get();

    if (!userDoc.exists) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const userData = userDoc.data() as User;
    
    if (!userData.latest) {
      res.status(404).json({ success: false, message: 'No images found' });
      return;
    }

    // Generate signed URL for the latest image
    const bucket = admin.storage().bucket();
    const fileName = `images/${author.toLowerCase()}/${userData.latest}.jpg`;
    const file = bucket.file(fileName);

    // For emulator, use a simpler URL format
    const isEmulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    let downloadUrl: string;
    
    if (isEmulator) {
      // Use emulator URL format
      const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9198';
      const bucketName = bucket.name;
      downloadUrl = `http://${emulatorHost}/v0/b/${bucketName}/o/${encodeURIComponent(fileName)}?alt=media`;
    } else {
      // Use signed URL for production
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
      downloadUrl = signedUrl;
    }

    const response: GetImageResponse = {
      success: true,
      timestamp: userData.latest,
      downloadUrl
    };

    res.json(response);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /images/:author/list - List all images
export const listImagesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = await authenticateUser(req);
    if (!authenticatedUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { author } = req.params;

    if (!author) {
      res.status(400).json({ success: false, message: 'Author parameter is required' });
      return;
    }

    // Get user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(author.toLowerCase()).get();

    if (!userDoc.exists) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const userData = userDoc.data() as User;
    
    if (!userData.images || userData.images.length === 0) {
      res.json({ success: true, images: [] });
      return;
    }

    // Generate signed URLs for all images
    const bucket = admin.storage().bucket();
    const isEmulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9198';
    const bucketName = bucket.name;
    
    const images = await Promise.all(
      userData.images.map(async (timestamp) => {
        const fileName = `images/${author.toLowerCase()}/${timestamp}.jpg`;
        const file = bucket.file(fileName);
        
        let downloadUrl: string;
        
        if (isEmulator) {
          // Use emulator URL format
          downloadUrl = `http://${emulatorHost}/v0/b/${bucketName}/o/${encodeURIComponent(fileName)}?alt=media`;
        } else {
          // Use signed URL for production
          const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          });
          downloadUrl = signedUrl;
        }

        return {
          id: timestamp.toString(),
          timestamp,
          downloadUrl
        };
      })
    );

    // Sort by timestamp descending (newest first)
    images.sort((a, b) => b.timestamp - a.timestamp);

    const response: ListImagesResponse = {
      success: true,
      images
    };

    res.json(response);
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /images/:author/:imageId - Delete an image
export const deleteImageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authenticatedUser = await authenticateUser(req);
    if (!authenticatedUser) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { author, imageId } = req.params;

    if (!author || !imageId) {
      res.status(400).json({ success: false, message: 'Author and imageId parameters are required' });
      return;
    }

    if (author.toLowerCase() !== authenticatedUser) {
      res.status(403).json({ success: false, message: 'Cannot delete image for different user' });
      return;
    }

    const timestamp = parseInt(imageId);
    if (isNaN(timestamp)) {
      res.status(400).json({ success: false, message: 'Invalid imageId' });
      return;
    }

    // Delete from Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `images/${author.toLowerCase()}/${imageId}.jpg`;
    const file = bucket.file(fileName);

    try {
      await file.delete();
    } catch (error) {
      console.error('File deletion error:', error);
      // Continue with database update even if file deletion fails
    }

    // Update user data in Firestore
    const db = admin.firestore();
    const userRef = db.collection('users').doc(author.toLowerCase());
    
    await userRef.update({
      images: FieldValue.arrayRemove(timestamp)
    });

    // If this was the latest image, update the latest field
    const userDoc = await userRef.get();
    const userData = userDoc.data() as User;
    
    if (userData.latest === timestamp) {
      const remainingImages = userData.images.filter(img => img !== timestamp);
      const newLatest = remainingImages.length > 0 ? Math.max(...remainingImages) : 0;
      await userRef.update({ latest: newLatest });
    }

    const response: DeleteImageResponse = {
      success: true,
      message: 'Image deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 