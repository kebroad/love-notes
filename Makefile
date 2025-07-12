# Love Notes Development Makefile

# Variables
FRONTEND_DIR := frontend
BACKEND_DIR := backend
NODE_BIN := node_modules/.bin
PROJECT_ID := love-notes-kb-2025

# Default target
.PHONY: help
help:
	@echo "Love Notes Development Commands:"
	@echo "  make install        - Install all dependencies (frontend & backend)"
	@echo "  make dev            - Start both frontend and backend in development mode"
	@echo "  make frontend       - Start only the frontend development server"
	@echo "  make backend        - Start only the backend Firebase emulators"
	@echo "  make emulator       - Start Firebase emulators (with port cleanup)"
	@echo "  make seed           - Seed the database with test data"
	@echo "  make build          - Build both frontend and backend for production"
	@echo "  make clean          - Clean node_modules and build artifacts"
	@echo "  make clean-ports    - Kill processes using Firebase emulator ports"
	@echo "  make clean-dev      - Complete development cleanup (stop all services)"
	@echo "  make test           - Run all tests"
	@echo "  make deploy         - Deploy to Firebase (production)"
	@echo "  make logs           - View Firebase function logs"
	@echo "  make setup          - First time setup"
	@echo "  make restart        - Restart development servers"

# Install dependencies
.PHONY: install
install:
	@echo "📦 Installing dependencies..."
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install
	@echo "Installing backend dependencies..."
	cd $(BACKEND_DIR) && npm install
	@echo "✅ All dependencies installed!"

# Clean up ports used by Firebase emulators
.PHONY: clean-ports
clean-ports:
	@echo "🧹 Cleaning up Firebase emulator ports..."
	@lsof -ti:4000,4400,5001,8080,8081,9199,9198 | xargs kill -9 2>/dev/null || true
	@ps aux | grep -E "(firebase|java)" | grep -v grep | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@echo "✅ Ports cleaned up!"

# Complete development cleanup - stop all services and clean environment
.PHONY: clean-dev
clean-dev:
	@echo "🧹 Complete development cleanup..."
	@echo "Stopping all development processes..."
	@# Stop Vite frontend server
	@pkill -f "vite" 2>/dev/null || true
	@# Stop Firebase emulators
	@pkill -f "firebase" 2>/dev/null || true
	@# Stop Java processes (Firestore/Storage emulators)
	@ps aux | grep -E "(java.*firestore|java.*storage)" | grep -v grep | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@# Clean up all Firebase emulator ports
	@lsof -ti:4000,4400,4500,4501,5001,8080,8081,9150,9199,9198,5173 | xargs kill -9 2>/dev/null || true
	@# Clean up any remaining Node.js processes related to the project
	@ps aux | grep -E "(node.*love-notes|npm.*dev)" | grep -v grep | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@echo "Cleaning Firebase emulator cache..."
	@rm -rf ~/.cache/firebase/emulators/ui-* 2>/dev/null || true
	@echo "Cleaning local log files..."
	@rm -f firebase-debug.log firestore-debug.log ui-debug.log 2>/dev/null || true
	@echo "✅ Complete development cleanup finished!"
	@echo ""
	@echo "To start fresh development environment:"
	@echo "  make dev    - Start everything (emulators + frontend + seed)"
	@echo "  make setup  - First time setup if needed"

# Start Firebase emulators with proper cleanup
.PHONY: emulator
emulator: clean-ports
	@echo "🔥 Starting Firebase emulators..."
	@echo "Building backend first..."
	@cd $(BACKEND_DIR) && npm run build
	@echo "Starting emulators..."
	@firebase emulators:start --only functions,firestore,storage --project $(PROJECT_ID)

# Start Firebase emulators in background
.PHONY: emulator-bg
emulator-bg: clean-ports
	@echo "🔥 Starting Firebase emulators in background..."
	@echo "Building backend first..."
	@cd $(BACKEND_DIR) && npm run build
	@echo "Starting emulators..."
	@firebase emulators:start --only functions,firestore,storage --project $(PROJECT_ID) &
	@echo "Waiting for emulators to start..."
	@sleep 10
	@echo "✅ Emulators started in background!"

# Development - run both frontend and backend
.PHONY: dev
dev: emulator-bg
	@echo "🚀 Starting Love Notes development environment..."
	@echo "Frontend will be available at: http://localhost:5173"
	@echo "Backend API will be available at: http://localhost:5001"
	@echo "Firebase Emulator UI will be available at: http://localhost:4000"
	@echo ""
	@echo "Seeding database with test data..."
	@sleep 5
	@cd $(BACKEND_DIR) && npm run seed
	@echo ""
	@echo "Starting frontend development server..."
	@cd $(FRONTEND_DIR) && npm run dev

# Frontend development server only
.PHONY: frontend
frontend:
	@echo "🎨 Starting frontend development server..."
	cd $(FRONTEND_DIR) && npm run dev

# Backend development server only
.PHONY: backend
backend: emulator

# Seed database with test data
.PHONY: seed
seed:
	@echo "🌱 Seeding database with test data..."
	@echo "Make sure Firebase emulators are running first!"
	@echo "Testing emulator connection..."
	@curl -s http://localhost:5001/$(PROJECT_ID)/us-central1/api/health > /dev/null || (echo "❌ Emulators not running! Run 'make emulator' first." && exit 1)
	@echo "✅ Emulators are running, proceeding with seed..."
	cd $(BACKEND_DIR) && npm run seed

# Build for production
.PHONY: build
build:
	@echo "🏗️  Building for production..."
	@echo "Building backend..."
	cd $(BACKEND_DIR) && npm run build
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm run build
	@echo "✅ Build completed!"

# Clean build artifacts and node_modules
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(BACKEND_DIR)/lib
	rm -rf $(BACKEND_DIR)/node_modules
	@echo "✅ Clean completed!"

# Run tests
.PHONY: test
test:
	@echo "🧪 Running tests..."
	cd $(BACKEND_DIR) && npm test
	@echo "✅ Tests completed!"

# Deploy to Firebase
.PHONY: deploy
deploy:
	@echo "🚀 Deploying to Firebase..."
	@echo "Building first..."
	@make build
	@echo "Deploying..."
	firebase deploy
	@echo "✅ Deployment completed!"

# View Firebase function logs
.PHONY: logs
logs:
	@echo "📋 Viewing Firebase function logs..."
	firebase functions:log

# Stop all development servers
.PHONY: stop
stop:
	@echo "🛑 Stopping all development servers..."
	@make clean-ports
	@pkill -f "vite" 2>/dev/null || true
	@echo "✅ All servers stopped!"

# Development setup (first time)
.PHONY: setup
setup:
	@echo "🔧 Setting up Love Notes development environment..."
	@echo "Installing dependencies..."
	@make install
	@echo "Building backend..."
	cd $(BACKEND_DIR) && npm run build
	@echo ""
	@echo "🎉 Setup completed!"
	@echo ""
	@echo "To start development:"
	@echo "  1. Run 'make dev' to start everything (emulators + frontend + seed)"
	@echo "  2. Or run 'make emulator' and 'make frontend' separately"
	@echo "  3. Visit http://localhost:5173 to use the app"
	@echo ""
	@echo "Test credentials:"
	@echo "  Username: kevin, Password: password123"
	@echo "  Username: nicole, Password: password123"

# Quick start (install, build, seed, and run)
.PHONY: quick-start
quick-start:
	@echo "⚡ Quick start: setting up and running Love Notes..."
	@make setup
	@echo "Starting development environment..."
	@make dev

# Restart development servers
.PHONY: restart
restart:
	@echo "🔄 Restarting development servers..."
	@make clean-dev
	@sleep 2
	@make dev

# Check Firebase project status
.PHONY: status
status:
	@echo "📊 Firebase project status:"
	firebase projects:list
	@echo ""
	@echo "Current project:"
	firebase use
	@echo ""
	@echo "Emulator status:"
	@curl -s http://localhost:5001/$(PROJECT_ID)/us-central1/api/health 2>/dev/null && echo "✅ Emulators running" || echo "❌ Emulators not running"

# Initialize Firebase project (first time setup)
.PHONY: firebase-init
firebase-init:
	@echo "🔥 Initializing Firebase project..."
	firebase init
	@echo "✅ Firebase project initialized!"

# Health check for all services
.PHONY: health
health:
	@echo "🏥 Health check for all services:"
	@echo -n "Frontend (http://localhost:5173): "
	@curl -s http://localhost:5173 > /dev/null && echo "✅ Running" || echo "❌ Not running"
	@echo -n "Backend API (http://localhost:5001): "
	@curl -s http://localhost:5001/$(PROJECT_ID)/us-central1/api/health > /dev/null && echo "✅ Running" || echo "❌ Not running"
	@echo -n "Firestore (http://localhost:8081): "
	@curl -s http://localhost:8081 > /dev/null && echo "✅ Running" || echo "❌ Not running"
	@echo -n "Storage (http://localhost:9198): "
	@curl -s http://localhost:9198 > /dev/null && echo "✅ Running" || echo "❌ Not running"
	@echo -n "Emulator UI (http://localhost:4000): "
	@curl -s http://localhost:4000 > /dev/null && echo "✅ Running" || echo "❌ Not running" 