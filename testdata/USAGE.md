# Test Data Usage Guide

This guide explains how to use the test data to seed your Firebase emulators for development and testing.

## Prerequisites

1. Firebase emulators running: `firebase emulators:start --only functions,firestore,storage`
2. Backend dependencies installed: `cd backend && npm install`

## Seeding Process

### 1. Database Seeding

Seed the Firestore database with user credentials and image metadata:

```bash
cd backend
npm run seed
```

This will:
- Create user documents for `kevin` and `nicole` with hashed passwords
- Add image timestamp arrays to each user
- Set the latest image timestamp for each user

### 2. Storage Seeding

Upload test images to Firebase Storage emulator:

```bash
cd backend
npm run seed-storage
```

This will:
- Read the YAML seed data file
- Upload all 6 test images (3 per user) to Firebase Storage
- Organize images in `images/{username}/` directories
- Add metadata to each uploaded image

## Verification

### Check Database
1. Open Firebase Emulator UI: http://localhost:4000
2. Go to Firestore tab
3. Check the `users` collection for `kevin` and `nicole` documents

### Check Storage
1. Open Firebase Emulator UI: http://localhost:4000
2. Go to Storage tab
3. Browse the `images/` folder to see uploaded test images

### API Testing

Test the authentication API:
```bash
# Kevin's credentials
curl -X POST http://localhost:5001/love-notes-kb-2025/us-central1/api/auth \
  -H "Authorization: Basic $(echo -n 'kevin:password123' | base64)" \
  -H "Content-Type: application/json"

# Nicole's credentials  
curl -X POST http://localhost:5001/love-notes-kb-2025/us-central1/api/auth \
  -H "Authorization: Basic $(echo -n 'nicole:password123' | base64)" \
  -H "Content-Type: application/json"
```

Test the image listing API:
```bash
# List Kevin's images
curl -X GET "http://localhost:5001/love-notes-kb-2025/us-central1/api/images/list" \
  -H "Authorization: Basic $(echo -n 'kevin:password123' | base64)"

# List Nicole's images
curl -X GET "http://localhost:5001/love-notes-kb-2025/us-central1/api/images/list" \
  -H "Authorization: Basic $(echo -n 'nicole:password123' | base64)"
```

## Test Data Overview

### Users
- **kevin**: password123, 3 images (Jan 1-3, 2024)
- **nicole**: password123, 3 images (Jan 4-6, 2024)

### Images
All images are 640x400 pixels with colored backgrounds and text labels:

**Kevin's Images:**
- `1704067200.jpg` - Jan 1, 2024 (Blue background)
- `1704153600.jpg` - Jan 2, 2024 (Purple background)  
- `1704240000.jpg` - Jan 3, 2024 (Pink background)

**Nicole's Images:**
- `1704326400.jpg` - Jan 4, 2024 (Orange background)
- `1704412800.jpg` - Jan 5, 2024 (Green background)
- `1704499200.jpg` - Jan 6, 2024 (Teal background)

## Troubleshooting

### Storage Permission Errors
If you get 403 Forbidden errors:
1. Check that storage rules allow access: `storage.rules`
2. Restart emulators: `firebase emulators:start --only functions,firestore,storage`

### Database Connection Issues
If seeding fails:
1. Ensure emulators are running
2. Check project ID matches in scripts: `love-notes-kb-2025`
3. Verify Firebase configuration: `firebase.json`

### Missing Dependencies
If scripts fail to run:
```bash
cd backend
npm install js-yaml @types/js-yaml
```

## Reset Data

To clear all test data:
1. Stop emulators: `Ctrl+C`
2. Delete emulator data: `rm -rf .firebase/emulators/`
3. Restart emulators and re-seed

## Development Workflow

1. Start emulators: `firebase emulators:start --only functions,firestore,storage`
2. Seed database: `npm run seed` (in backend directory)
3. Seed storage: `npm run seed-storage` (in backend directory)
4. Develop and test your application
5. Reset data when needed using the reset process above 