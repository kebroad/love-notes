# Kevin and Nicoles Love Notes 💕

A long-distance relationship gift system that allows two people to send handwritten love notes to each other's Raspberry Pi devices, displayed on beautiful e-ink screens.

## Project Overview

This system consists of three interconnected applications that work together to create a seamless love note sharing experience:

1. **Frontend Website** - A mobile and desktop compatible React app where users can create and send love notes
2. **Backend API** - TypeScript-based Firebase Functions handling data management and API requests
3. **Raspberry Pi Display** - Python application that receives and displays love notes on e-ink displays

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Frontend Web   │    │   Backend API    │    │   Raspberry Pi      │
│   React + TS    │◄──►│TypeScript Functions│◄──►│  Python + Inky      │
│                 │    │                  │    │                     │
│ • Excalidraw    │    │ • Authentication │    │ • Continuous Poll   │
│ • react-artboard│    │ • Image Storage  │    │ • E-ink Display     │
│ • Canvas        │    │ • Database Ops   │    │ • Image Rendering   │
│ • Auth UI       │    │                  │    │                     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      Firebase Cloud        │
                    │                            │
                    │ • Firestore Database       │
                    │ • Storage (Images)         │
                    │ • Hosting (Frontend)       │
                    │ • Functions (Backend)      │
                    └────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Excalidraw** for drawing interface (Draw page)
- **react-artboard** for painting interface (Paint page)
- **Firebase SDK** for authentication and API calls
- **Responsive Design** for mobile and desktop
- **Hosted on** Firebase Hosting

### Backend
- **TypeScript** with Firebase Functions
- **Express** for HTTP routing
- **Firestore** for database operations
- **Firebase Storage** for image storage
- **bcrypt** for password hashing
- **Sharp** for image processing
- **CORS** enabled for cross-origin requests

### Raspberry Pi
- **Python 3.9+**
- **Inky library** for e-ink display control
- **PIL (Pillow)** for image processing
- **Requests** for HTTP polling
- **Systemd** for service management

### Cloud Services
- **Firebase Firestore** - User data and metadata storage
- **Firebase Storage** - PNG image storage
- **Firebase Hosting** - Frontend deployment
- **Firebase Functions** - Backend API endpoints

## API Endpoints

The backend provides 4 main endpoints:

### 1. Authentication
```
POST /api/login
Content-Type: application/json

{
  "username": "kevin",
  "password": "Password123!"
}
```

### 2. Get Users
```
GET /api/users
```

### 3. Create Image
```
POST /api/create-image
Content-Type: application/json

{
  "userId": "kevin",
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "metadata": {
    "width": 640,
    "height": 400,
    "format": "png"
  }
}
```

### 4. Get Latest Image
```
GET /api/latest-image/:userId
```

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Make (optional, for Makefile commands)

### Setup & Development

1. **Install dependencies:**
   ```bash
   make install
   # or manually:
   cd frontend && npm install
   cd backend && npm install
   ```

2. **Start development servers:**
   ```bash
   make dev
   # This starts both frontend (port 3000) and backend (port 5001)
   ```

3. **Seed test data:**
   ```bash
   make seed
   ```

4. **Visit the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Firebase Emulator UI: http://localhost:4000

### Test Credentials
- **Kevin**: username=`kevin`, password=`Password123!`
- **Nicole**: username=`nicole`, password=`Password123!`

## Local Development

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Java Runtime (for Firebase emulators)

### Quick Start

**Option 1: Using the development script (recommended)**
```bash
# First time setup
./dev.sh setup

# Start development environment
./dev.sh start
```

**Option 2: Using Make commands**
1. **First time setup:**
   ```bash
   make setup
   ```

2. **Start development environment:**
   ```bash
   make dev
   ```

This will:
- Clean up any existing processes on Firebase ports
- Start Firebase emulators (Functions, Firestore, Storage)
- Build the backend
- Seed the database with test data
- Start the frontend development server

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001/love-notes-kb-2025/us-central1/api
   - Firebase Emulator UI: http://localhost:4000

### Development Scripts

**Using the development script:**
```bash
./dev.sh [command]
```

| Command | Description |
|---------|-------------|
| `./dev.sh start` | Start complete development environment |
| `./dev.sh stop` | Stop all development servers |
| `./dev.sh restart` | Restart all development servers |
| `./dev.sh setup` | First time setup (install dependencies) |
| `./dev.sh seed` | Seed database with test data |
| `./dev.sh health` | Check health of all services |
| `./dev.sh clean` | Clean up ports and processes |
| `./dev.sh clean-dev` | Complete development cleanup (stop all services) |
| `./dev.sh help` | Show help message |

### Development Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start complete development environment |
| `make emulator` | Start Firebase emulators only |
| `make frontend` | Start frontend development server only |
| `make backend` | Start backend/emulators only |
| `make seed` | Seed database with test data |
| `make clean-ports` | Kill processes using Firebase ports |
| `make clean-dev` | Complete development cleanup (stop all services) |
| `make stop` | Stop all development servers |
| `make restart` | Restart all development servers |
| `make health` | Check status of all services |
| `make build` | Build for production |

### Test Credentials

- **Kevin**: username=`kevin`, password=`password123`
- **Nicole**: username=`nicole`, password=`password123`

### Troubleshooting

**Complete cleanup for fresh start:**
```bash
make clean-dev
# or
./dev.sh clean-dev
```

**Port conflicts:**
```bash
make clean-ports
```

**Emulators not starting:**
```bash
make stop
make emulator
```

**Database not seeded:**
```bash
make seed
```

**Check service health:**
```bash
make health
```

## Hardware Requirements

### For Each Raspberry Pi Setup
- **Raspberry Pi Zero W** ([Adafruit Link](https://www.adafruit.com/product/5291))
- **Inky Impression 4-inch E-ink Display** (640x400 pixels) ([Pimoroni Link](https://shop.pimoroni.com/products/inky-impression-4?variant=39599238807635))
- **MicroSD Card** (16GB minimum, Class 10)
- **USB Power Supply** (5V, 2.5A recommended)
- **Case** (optional but recommended for protection)

## Project Structure

```
love-notes/
├── README.md
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── Makefile
│
├── frontend/                    # React TypeScript Frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Canvas/
│   │   │   └── Layout/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── public/
│
├── backend/                     # TypeScript Firebase Functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── handlers/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   └── images.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── firebase.ts
│   │   │   └── auth.ts
│   │   └── scripts/
│   │       └── seedData.ts
│   └── lib/                     # Compiled JavaScript
│
├── raspberry-pi/                # Python Display Application
│   ├── requirements.txt
│   ├── main.py
│   ├── config/
│   │   └── settings.py
│   ├── services/
│   │   ├── api_client.py
│   │   ├── display_manager.py
│   │   └── image_processor.py
│   ├── utils/
│   │   └── logger.py
│   └── systemd/
│       └── love-notes.service
│
└── docs/                        # Documentation
    ├── setup-guide.md
    ├── deployment.md
    ├── hardware-setup.md
    └── troubleshooting.md
```

## Implementation Phases

### Phase 1: Project Setup & Infrastructure ✅
**Deliverables:**
- [x] Firebase project creation and configuration
- [x] Repository structure setup
- [x] Basic CI/CD pipeline
- [x] Development environment documentation

**Tasks:**
1. Initialize Firebase project
2. Set up Firestore database structure
3. Configure Firebase Storage buckets
4. Create development and production environments
5. Set up basic security rules

### Phase 2: Backend API Development ✅
**Deliverables:**
- [x] Authentication system with bcrypt hashing
- [x] Love note storage API with image processing
- [x] User management endpoints
- [x] Database schema implementation
- [x] Local development with mock data

**API Endpoints:**
```
POST /api/login           # User authentication
GET  /api/users           # Get user information
POST /api/create-image    # Upload and store love note
GET  /api/latest-image/:userId # Get latest note for user
```

**Database Schema:**
```javascript
// Users Collection
{
  id: "kevin" | "nicole",
  username: "kevin" | "nicole",
  name: "Kevin" | "Nicole",
  email: "kevin@example.com",
  passwordHash: "bcrypt_hash",
  salt: "random_salt",
  imageUrl: "profile-images/kevin.jpg",
  createdAt: timestamp,
  lastLogin: timestamp,
  lastImageTimestamp: number
}

// Notes Collection
{
  id: "auto_generated",
  fromUserId: "kevin" | "nicole",
  toUserId: "nicole" | "kevin",
  timestamp: number,
  imageUrl: "images/kevin/1234567890.png",
  createdAt: timestamp,
  deliveredAt: timestamp | null,
  metadata: {
    width: 640,
    height: 400,
    format: "png",
    size: number
  }
}
```

### Phase 3: Frontend Development (Week 3)
**Deliverables:**
- [x] React application with TypeScript
- [x] Dual canvas interface (Draw & Paint)
- [x] Authentication UI
- [x] Love note creation interface
- [x] Responsive design implementation

**Key Components:**
1. **Authentication Flow**
   - Simple login form
   - Session management
   - Route protection

2. **Dual Canvas Interface**
   - **Draw Page**: Excalidraw component integration
     - Vector-based drawing with precise geometric shapes
     - Optimized for technical drawings and structured content
   - **Paint Page**: react-artboard component integration
     - Brush-based painting with realistic art tools
     - Includes pencil, brush, marker, airbrush, watercolor, and eraser
     - Color picker and adjustable brush sizes
   - Both canvases:
     - 60% page width with 8:5 aspect ratio (maintains 640x400 export ratio)
     - Responsive sizing: 80% on tablets, 95% on mobile
     - Optimized for e-ink display compatibility
     - Send note functionality with preview
     - Clear/undo functionality

3. **Note Management**
   - Send note functionality with preview modal
   - Note history view
   - Success/error feedback
   - Shared components for common functionality

### Phase 4: Raspberry Pi Application (Week 4)
**Deliverables:**
- [ ] Python polling application
- [ ] E-ink display integration
- [ ] Image processing pipeline
- [ ] System service configuration

**Key Features:**
1. **Polling System**
   - Configurable polling interval (default: 30 seconds)
   - Efficient timestamp-based updates
   - Error handling and retry logic

2. **Display Management**
   - Image download and caching
   - Proper e-ink refresh handling
   - Image scaling and positioning
   - Battery-friendly display updates

3. **System Integration**
   - Systemd service for auto-start
   - Logging and monitoring
   - Configuration management

### Phase 5: Testing & Deployment (Week 5)
**Deliverables:**
- [ ] End-to-end testing
- [ ] Production deployment
- [ ] Hardware setup guide
- [ ] User documentation

## Development Commands

```bash
# Setup (first time)
make setup

# Development
make dev                # Start both frontend and backend
make frontend          # Start only frontend
make backend           # Start only backend
make seed              # Seed database with test data

# Building
make build             # Build both for production
make clean             # Clean build artifacts

# Deployment
make deploy            # Deploy to Firebase
make logs              # View function logs

# Utilities
make help              # Show all available commands
make status            # Check Firebase project status
```

## Deployment

### Production Deployment
1. **Build the applications:**
   ```bash
   make build
   ```

2. **Deploy to Firebase:**
   ```bash
   make deploy
   ```

3. **Configure environment variables** (if needed):
   ```bash
   firebase functions:config:set somekey="someval"
   ```

### Local Development
1. **Start emulators:**
   ```bash
   make dev
   ```

2. **Seed test data:**
   ```bash
   make seed
   ```

3. **View emulator UI:**
   - Visit: http://localhost:4000

## Security Features

- **Password Security**: bcrypt hashing with salt
- **Rate Limiting**: Login attempt limiting
- **Input Validation**: Sanitization and validation
- **Firebase Security Rules**: Proper access control
- **Image Processing**: Automatic resizing and optimization
- **CORS**: Cross-origin resource sharing configured

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 