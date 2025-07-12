import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { authHandler } from './handlers/auth';
import { createImageHandler, getImageHandler, listImagesHandler, deleteImageHandler } from './handlers/images';

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

// Routes
app.post('/auth', authHandler);
app.post('/images', createImageHandler);
app.get('/images/:author', getImageHandler);
app.get('/images/:author/list', listImagesHandler);
app.delete('/images/:author/:imageId', deleteImageHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the API as a Firebase Function
export const api = functions.https.onRequest(app); 