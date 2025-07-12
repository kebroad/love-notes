import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9198';
process.env.GCLOUD_PROJECT = 'love-notes-kb-2025';

const app = initializeApp({
  projectId: 'love-notes-kb-2025',
  storageBucket: 'love-notes-kb-2025.appspot.com'
});

const storage = getStorage(app);
const bucket = storage.bucket();

interface SeedData {
  users: {
    [key: string]: {
      password: string;
      images: number[];
      latest: number;
    };
  };
  image_files: {
    [key: string]: Array<{
      filename: string;
      timestamp: number;
      path: string;
    }>;
  };
}

async function seedStorageImages(): Promise<void> {
  try {
    console.log('🌱 Starting Firebase Storage seeding...');
    
    // Read the seed data YAML file
    const seedDataPath = path.join(__dirname, '../../../testdata/seed-data.yaml');
    const seedDataContent = fs.readFileSync(seedDataPath, 'utf8');
    const seedData = yaml.load(seedDataContent) as SeedData;
    
    console.log('📖 Loaded seed data from YAML file');
    
    // Upload images for each user
    for (const [username, imageFiles] of Object.entries(seedData.image_files)) {
      console.log(`📸 Uploading images for user: ${username}`);
      
      for (const imageFile of imageFiles) {
        const localImagePath = path.join(__dirname, '../../../testdata', imageFile.path);
        const storageImagePath = `images/${username}/${imageFile.filename}`;
        
        // Check if local file exists
        if (!fs.existsSync(localImagePath)) {
          console.error(`❌ Local image file not found: ${localImagePath}`);
          continue;
        }
        
        // Upload to Firebase Storage
        try {
          await bucket.upload(localImagePath, {
            destination: storageImagePath,
            metadata: {
              metadata: {
                uploadedBy: username,
                timestamp: imageFile.timestamp.toString(),
                originalName: imageFile.filename
              }
            }
          });
          
          console.log(`✅ Uploaded: ${storageImagePath}`);
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${storageImagePath}:`, uploadError);
        }
      }
    }
    
    console.log('🎉 Storage seeding completed successfully!');
    
    // List all uploaded files to verify
    console.log('\n📋 Verifying uploaded files:');
    const [files] = await bucket.getFiles();
    files.forEach(file => {
      console.log(`   - ${file.name}`);
    });
    
  } catch (error) {
    console.error('❌ Storage seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedStorageImages()
  .then(() => {
    console.log('✨ Storage seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Storage seeding process failed:', error);
    process.exit(1);
  }); 