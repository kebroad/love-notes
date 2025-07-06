# Joe and Janes Love Notes 💕

A long-distance relationship gift system that allows two people to send handwritten love notes to each other's Raspberry Pi devices, displayed on beautiful e-ink screens.

## Project Overview

This system consists of three interconnected applications that work together to create a seamless love note sharing experience:

1. **Frontend Website** - A mobile and desktop compatible React app where users can create and send love notes
2. **Backend API** - Golang-based Firebase Functions handling data management and API requests
3. **Raspberry Pi Display** - Python application that receives and displays love notes on e-ink displays

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Frontend Web   │    │   Backend API    │    │   Raspberry Pi      │
│   React + TS    │◄──►│ Golang Functions │◄──►│  Python + Inky      │
│                 │    │                  │    │                     │
│ • Excalidraw    │    │ • Authentication │    │ • Continuous Poll   │
│ • Canvas        │    │ • Image Storage  │    │ • E-ink Display     │
│ • Auth UI       │    │ • Database Ops   │    │ • Image Rendering   │
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
- **Excalidraw** for drawing interface
- **Firebase SDK** for authentication and API calls
- **Responsive Design** for mobile and desktop
- **Hosted on** Firebase Hosting

### Backend
- **Golang** with Firebase Functions
- **Firestore** for database operations
- **Firebase Storage** for image storage
- **bcrypt** for password hashing
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
├── .firebaserc
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
├── backend/                     # Golang Firebase Functions
│   ├── go.mod
│   ├── go.sum
│   ├── main.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── notes.go
│   │   └── middleware.go
│   ├── models/
│   │   └── types.go
│   └── utils/
│       ├── firebase.go
│       └── validation.go
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

### Phase 1: Project Setup & Infrastructure (Week 1)
**Deliverables:**
- [ ] Firebase project creation and configuration
- [ ] Repository structure setup
- [ ] Basic CI/CD pipeline
- [ ] Development environment documentation

**Tasks:**
1. Initialize Firebase project
2. Set up Firestore database structure
3. Configure Firebase Storage buckets
4. Create development and production environments
5. Set up basic security rules

### Phase 2: Backend API Development (Week 2)
**Deliverables:**
- [ ] Authentication system
- [ ] Love note storage API
- [ ] Raspberry Pi polling API
- [ ] Database schema implementation

**API Endpoints:**
```
POST /api/auth/login           # User authentication
POST /api/notes/send           # Upload and store love note
GET  /api/notes/latest/:userId # Get latest note for Raspberry Pi
GET  /api/notes/history/:userId # Get note history (optional)
```

**Database Schema:**
```javascript
// Users Collection
{
  id: "user_joe" | "user_jane",
  username: "joe" | "jane",
  passwordHash: "bcrypt_hash",
  salt: "random_salt",
  createdAt: timestamp,
  lastLogin: timestamp
}

// Notes Collection
{
  id: "auto_generated",
  fromUserId: "user_joe" | "user_jane",
  toUserId: "user_jane" | "user_joe",
  imageUrl: "gs://bucket/path/to/image.png",
  createdAt: timestamp,
  deliveredAt: timestamp | null,
  metadata: {
    imageSize: number,
    dimensions: { width: 640, height: 400 }
  }
}
```

### Phase 3: Frontend Development (Week 3)
**Deliverables:**
- [ ] React application with TypeScript
- [ ] Excalidraw integration
- [ ] Authentication UI
- [ ] Love note creation interface
- [ ] Responsive design implementation

**Key Components:**
1. **Authentication Flow**
   - Simple login form
   - Session management
   - Route protection

2. **Canvas Interface**
   - Excalidraw component integration
   - 60% page width with 8:5 aspect ratio (maintains 640x400 export ratio)
   - Responsive sizing: 80% on tablets, 95% on mobile
   - Drawing tools and colors
   - Clear/undo functionality
   - Optimized for e-ink display compatibility

3. **Note Management**
   - Send note functionality
   - Note history view
   - Success/error feedback

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

## Quick Start Guide

### Prerequisites
- Node.js 18+
- Go 1.21+
- Python 3.9+
- Firebase CLI
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd love-notes
```

### 2. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
```

### 3. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### 4. Backend Development
```bash
cd backend
go mod tidy
firebase emulators:start --only functions
```

### 5. Raspberry Pi Setup
```bash
cd raspberry-pi
pip3 install -r requirements.txt
python3 main.py
```

## Configuration

### Environment Variables

**Frontend (.env)**
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

**Backend (Firebase Functions)**
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

**Raspberry Pi (config/settings.py)**
```python
API_BASE_URL = "https://your-region-your-project.cloudfunctions.net/api"
USER_ID = "user_joe"  # or "user_jane"
POLLING_INTERVAL = 30  # seconds
DISPLAY_TYPE = "inky_impression_4"
```

## Deployment Instructions

### Frontend Deployment
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend Deployment
```bash
cd backend
firebase deploy --only functions
```

### Raspberry Pi Deployment
```bash
# Copy files to Raspberry Pi
scp -r raspberry-pi/ pi@your-pi-ip:~/love-notes/

# SSH into Raspberry Pi
ssh pi@your-pi-ip

# Install and start service
cd ~/love-notes
sudo cp systemd/love-notes.service /etc/systemd/system/
sudo systemctl enable love-notes
sudo systemctl start love-notes
```

## Security Considerations

1. **Authentication**: Simple but secure password-based auth with bcrypt
2. **CORS**: Properly configured for production domains
3. **Firebase Rules**: Restrictive Firestore and Storage rules
4. **Rate Limiting**: API endpoints protected against abuse
5. **Input Validation**: All user inputs sanitized and validated

## Monitoring & Maintenance

- **Firebase Console**: Monitor function executions and errors
- **Raspberry Pi Logs**: Systemd journal logging
- **Storage Usage**: Monitor Firebase Storage consumption
- **Performance**: Track API response times and success rates

## Cost Estimation

**Monthly Firebase Costs (estimated):**
- Functions: ~$0.50/month (low usage)
- Firestore: ~$1.00/month (minimal reads/writes)
- Storage: ~$0.10/month (image storage)
- Hosting: Free tier sufficient
- **Total: ~$2/month**

## Future Enhancements

- [ ] Push notifications when notes are received
- [ ] Note templates and stickers
- [ ] Scheduling future notes
- [ ] Photo attachments
- [ ] Multiple display themes
- [ ] Voice notes (audio to text)
- [ ] Weather and date overlay
- [ ] Battery level monitoring

## Support & Troubleshooting

See `docs/troubleshooting.md` for common issues and solutions.

## License

This project is created for personal use. Feel free to adapt for your own long-distance relationship! ❤️

---

**Built with ❤️ for Joe and Jane** 