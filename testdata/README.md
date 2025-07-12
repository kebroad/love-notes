# Test Data Directory

This directory contains seed data for the Love Notes project's Firebase emulators.

## Structure

```
testdata/
├── seed-data.yaml          # Database seed data (users, passwords, image metadata)
├── images/                 # Test images for Firebase Storage
│   ├── kevin/             # Kevin's test images
│   │   ├── 1704067200.jpg # Jan 1, 2024 - 640x400 test image
│   │   ├── 1704153600.jpg # Jan 2, 2024 - 640x400 test image
│   │   └── 1704240000.jpg # Jan 3, 2024 - 640x400 test image
│   └── nicole/            # Nicole's test images
│       ├── 1704326400.jpg # Jan 4, 2024 - 640x400 test image
│       ├── 1704412800.jpg # Jan 5, 2024 - 640x400 test image
│       └── 1704499200.jpg # Jan 6, 2024 - 640x400 test image
└── README.md              # This file
```

## Seed Data

The `seed-data.yaml` file contains:

- **Users**: Kevin and Nicole with their passwords and image metadata
- **Image Files**: Mapping of timestamps to actual image files

### User Credentials
- **Kevin**: `kevin:password123`
- **Nicole**: `nicole:password123`

### Image Timestamps
All images are named by Unix timestamp:
- Kevin's images: 1704067200, 1704153600, 1704240000
- Nicole's images: 1704326400, 1704412800, 1704499200

## Usage

1. **Database Seeding**: Use the existing `backend/src/scripts/seedData.ts` script, which can be updated to read from this YAML file
2. **Storage Seeding**: Create a script to upload the test images to Firebase Storage emulator
3. **Testing**: Use these images and data for API testing and development

## Image Details

All test images are:
- **Dimensions**: 640x400 pixels
- **Format**: JPEG
- **Content**: Simple colored backgrounds with text labels
- **Naming**: Unix timestamp matching the database records

## Next Steps

To use this test data:

1. Update the seed script to read from `seed-data.yaml`
2. Create a storage seeding script to upload images to Firebase Storage emulator
3. Run both scripts to populate the emulators with test data 