import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { AuthResponse, User } from '../types';

export const authHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status(401).json({ authenticated: false });
      return;
    }

    // Parse Basic Auth header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      res.status(401).json({ authenticated: false });
      return;
    }

    // Get user from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(username.toLowerCase()).get();

    if (!userDoc.exists) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const userData = userDoc.data() as User;
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    
    if (!isValidPassword) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const response: AuthResponse = {
      authenticated: true,
      user: username.toLowerCase()
    };

    res.json(response);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ authenticated: false });
  }
}; 