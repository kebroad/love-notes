# Love Notes Backend

TypeScript Firebase Functions backend for the Love Notes app.

## API Endpoints

### Authentication
- `POST /api/auth` - Authenticate user with Basic Auth header

### Images
- `POST /api/images` - Create new image
- `GET /api/images/:author` - Get latest image for author
- `GET /api/images/:author/list` - List all images for author
- `DELETE /api/images/:author/:imageId` - Delete specific image

### Health Check
- `GET /api/health` - Service health check

## Database Structure

Collection: `users`
Documents: `kevin`, `nicole`
Fields:
- `username`: string
- `password`: string (bcrypt hashed)
- `images`: number[] (array of timestamps)
- `latest`: number (latest image timestamp)

## Storage Structure

```
/kevin/
  ├── 1234567890123.png
  ├── 1234567890124.png
  └── ...
/nicole/
  ├── 1234567890125.png
  ├── 1234567890126.png
  └── ...
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the emulators:
   ```bash
   npm run serve
   ```

4. Seed test data:
   ```bash
   npm run seed
   ```

## Test Credentials

- Username: `kevin`, Password: `password123`
- Username: `nicole`, Password: `password123`

## Example Usage

### Authentication
```bash
curl -X POST http://localhost:5001/demo-love-notes/us-central1/api/auth \
  -H "Authorization: Basic $(echo -n 'kevin:password123' | base64)"
```

### Create Image
```bash
curl -X POST http://localhost:5001/demo-love-notes/us-central1/api/images \
  -H "Authorization: Basic $(echo -n 'kevin:password123' | base64)" \
  -H "Content-Type: application/json" \
  -d '{"author": "kevin", "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="}'
```

### Get Latest Image
```bash
curl -X GET http://localhost:5001/demo-love-notes/us-central1/api/images/kevin \
  -H "Authorization: Basic $(echo -n 'kevin:password123' | base64)"
``` 