#!/bin/bash

# Love Notes Development Helper Script
# This script provides an easy way to start the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:$1 >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    if ! command_exists firebase; then
        print_error "Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
        exit 1
    fi
    
    if ! command_exists java; then
        print_warning "Java is not installed. Firebase emulators require Java runtime."
        print_info "Please install Java from https://www.oracle.com/java/technologies/downloads/"
        exit 1
    fi
    
    print_success "All prerequisites are installed!"
}

# Function to show help
show_help() {
    echo "Love Notes Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start the complete development environment"
    echo "  stop      - Stop all development servers"
    echo "  restart   - Restart all development servers"
    echo "  setup     - First time setup (install dependencies)"
    echo "  seed      - Seed database with test data"
    echo "  health    - Check health of all services"
    echo "  clean     - Clean up ports and processes"
    echo "  clean-dev - Complete development cleanup (stop all services)"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start      # Start everything"
    echo "  ./dev.sh setup      # First time setup"
    echo "  ./dev.sh health     # Check if services are running"
    echo "  ./dev.sh clean-dev  # Complete cleanup for fresh start"
}

# Function to start development environment
start_dev() {
    print_info "Starting Love Notes development environment..."
    
    # Check if make is available
    if ! command_exists make; then
        print_error "Make is not installed. Please install make or run commands manually."
        exit 1
    fi
    
    # Clean up any existing processes
    print_info "Cleaning up existing processes..."
    make clean-ports
    
    # Start the development environment
    print_info "Starting development environment..."
    make dev
}

# Function to stop development environment
stop_dev() {
    print_info "Stopping Love Notes development environment..."
    make stop
    print_success "Development environment stopped!"
}

# Function to completely clean development environment
clean_dev() {
    print_info "Performing complete development cleanup..."
    make clean-dev
    print_success "Complete development cleanup finished!"
    print_info "Run './dev.sh start' to start fresh development environment"
}

# Function to restart development environment
restart_dev() {
    print_info "Restarting Love Notes development environment..."
    make restart
}

# Function to run setup
setup_dev() {
    print_info "Setting up Love Notes development environment..."
    check_prerequisites
    make setup
    print_success "Setup completed!"
    print_info "Run './dev.sh start' to start the development environment"
}

# Function to seed database
seed_db() {
    print_info "Seeding database with test data..."
    make seed
    print_success "Database seeded successfully!"
}

# Function to check health
check_health() {
    print_info "Checking health of all services..."
    make health
}

# Function to clean up
clean_up() {
    print_info "Cleaning up ports and processes..."
    make clean-ports
    print_success "Cleanup completed!"
}

# Main script logic
case "${1:-start}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    setup)
        setup_dev
        ;;
    seed)
        seed_db
        ;;
    health)
        check_health
        ;;
    clean)
        clean_up
        ;;
    clean-dev)
        clean_dev
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 