import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../types';

// Initialize Firebase Admin for local development with emulators
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'love-notes-kb-2025',
    storageBucket: 'love-notes-kb-2025.firebasestorage.app'
  });
}

// Connect to emulators - updated ports
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9198';

// Test data from testdata folder
const testData = {
  users: {
    kevin: {
      password: "password123",
      images: [1704067200, 1704153600, 1704240000], // 2024-01-01, 01-02, 01-03
      latest: 1704240000
    },
    nicole: {
      password: "password123", 
      images: [1704326400, 1704412800, 1704499200], // 2024-01-04, 01-05, 01-06
      latest: 1704499200
    }
  },
  imageFiles: {
    kevin: [
      { filename: "1704067200.jpg", timestamp: 1704067200, path: "../testdata/images/kevin/1704067200.jpg" },
      { filename: "1704153600.jpg", timestamp: 1704153600, path: "../testdata/images/kevin/1704153600.jpg" },
      { filename: "1704240000.jpg", timestamp: 1704240000, path: "../testdata/images/kevin/1704240000.jpg" }
    ],
    nicole: [
      { filename: "1704326400.jpg", timestamp: 1704326400, path: "../testdata/images/nicole/1704326400.jpg" },
      { filename: "1704412800.jpg", timestamp: 1704412800, path: "../testdata/images/nicole/1704412800.jpg" },
      { filename: "1704499200.jpg", timestamp: 1704499200, path: "../testdata/images/nicole/1704499200.jpg" }
    ]
  }
};

// Timeout wrapper function
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Test connection to emulators
const testConnections = async () => {
  console.log('🔍 Testing emulator connections...');
  
  try {
    // Test Firestore connection
    const db = admin.firestore();
    await withTimeout(
      db.collection('_test').doc('_test').set({ test: true }),
      5000,
      'Firestore connection test'
    );
    console.log('✅ Firestore emulator connected (port 8081)');
    
    // Clean up test document
    await db.collection('_test').doc('_test').delete();
    
    // Test Storage connection
    const bucket = admin.storage().bucket();
    await withTimeout(
      bucket.file('_test.txt').save(Buffer.from('test')),
      5000,
      'Storage connection test'
    );
    console.log('✅ Storage emulator connected (port 9198)');
    
    // Clean up test file
    await bucket.file('_test.txt').delete();
    
  } catch (error) {
    console.error('❌ Emulator connection failed:', error);
    console.error('');
    console.error('Make sure the Firebase emulators are running:');
    console.error('  firebase emulators:start --only functions,firestore,storage --project love-notes-kb-2025');
    console.error('');
    console.error('Expected emulator ports:');
    console.error('  - Firestore: localhost:8081');
    console.error('  - Storage: localhost:9198');
    console.error('  - Functions: localhost:5001');
    throw error;
  }
};

const seedUsers = async () => {
  const db = admin.firestore();
  const saltRounds = 10;

  // Create test users using data from testdata
  const users: { [key: string]: Omit<User, 'images' | 'latest'> } = {
    kevin: {
      username: 'kevin',
      password: await bcrypt.hash(testData.users.kevin.password, saltRounds),
    },
    nicole: {
      username: 'nicole',
      password: await bcrypt.hash(testData.users.nicole.password, saltRounds),
    }
  };

  // Seed users with timeout
  for (const [username, userData] of Object.entries(users)) {
    const userRef = db.collection('users').doc(username);
    await withTimeout(
      userRef.set({
        ...userData,
        images: [],
        latest: 0
      }),
      10000,
      `Creating user ${username}`
    );
    console.log(`✅ Created user: ${username}`);
  }

  console.log('🎉 Seed data created successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('- Username: kevin, Password: password123');
  console.log('- Username: nicole, Password: password123');
};

const uploadTestImages = async () => {
  const bucket = admin.storage().bucket();
  const db = admin.firestore();
  
  const users = ['kevin', 'nicole'] as const;
  
  for (const user of users) {
    const imageFiles = testData.imageFiles[user];
    const timestamps: number[] = [];
    
    for (const imageFile of imageFiles) {
      const imagePath = path.resolve(imageFile.path);
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️  Test image not found: ${imagePath}`);
        continue;
      }
      
      // Read the actual image file
      const imageBuffer = fs.readFileSync(imagePath);
      console.log(`📸 Loading test image: ${imagePath} (${imageBuffer.length} bytes)`);
      
      const fileName = `images/${user}/${imageFile.timestamp}.jpg`;
      const file = bucket.file(fileName);
      
      try {
        await withTimeout(
          file.save(imageBuffer, {
            metadata: {
              contentType: 'image/jpeg',
              metadata: {
                uploadedBy: user,
                uploadedAt: new Date(imageFile.timestamp * 1000).toISOString(),
                originalFilename: imageFile.filename
              }
            }
          }),
          10000,
          `Uploading test image ${fileName}`
        );
        
        timestamps.push(imageFile.timestamp);
        console.log(`✅ Uploaded test image: ${fileName} (${imageBuffer.length} bytes)`);
        
        // Verify the upload by checking if file exists
        const [exists] = await file.exists();
        if (exists) {
          console.log(`✅ Verified: ${fileName} exists in storage`);
        } else {
          console.warn(`⚠️  Warning: ${fileName} upload reported success but file doesn't exist`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error);
        continue;
      }
    }
    
    // Update user document with image timestamps
    const userRef = db.collection('users').doc(user);
    await withTimeout(
      userRef.update({
        images: timestamps,
        latest: timestamps.length > 0 ? Math.max(...timestamps) : 0
      }),
      10000,
      `Updating user ${user} with images`
    );
    
    console.log(`✅ Updated user ${user} with ${timestamps.length} test images`);
  }
};

const main = async () => {
  // Set overall timeout for the entire script
  const scriptTimeout = setTimeout(() => {
    console.error('❌ Script timed out after 60 seconds');
    console.error('This usually means the emulators are not responding properly.');
    process.exit(1);
  }, 60000);

  try {
    console.log('🌱 Seeding database with test data...');
    
    // Test connections first
    await testConnections();
    
    // Run seeding operations
    await seedUsers();
    await uploadTestImages();
    
    console.log('✨ All done!');
    clearTimeout(scriptTimeout);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    clearTimeout(scriptTimeout);
    process.exit(1);
  }
};

main(); 