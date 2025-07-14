#!/usr/bin/env python3
"""
Love Notes Display for Raspberry Pi Zero W with Inky Impression 4"
Fetches love notes from the API and displays them on the e-ink display
"""

import time
import logging
import sys
import os
import yaml
import requests
import base64
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import signal
import threading

# Import Inky Impression library
from inky.auto import auto

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/love_notes_display.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LoveNotesDisplay:
    def __init__(self, config_path='/etc/love_notes/config.yaml'):
        self.config_path = config_path
        self.config = {}
        self.current_timestamp = None
        self.running = True
        self.display_lock = threading.Lock()
        
        # Initialize Inky Impression display
        try:
            self.inky_display = auto()
            logger.info(f"Initialized Inky Impression display: {self.inky_display.width}x{self.inky_display.height}")
        except Exception as e:
            logger.error(f"Failed to initialize Inky display: {e}")
            sys.exit(1)
        
        # Load initial configuration
        self.load_config()
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False
    
    def load_config(self):
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r') as f:
                self.config = yaml.safe_load(f)
            logger.info(f"Loaded configuration for user: {self.config.get('user', 'unknown')}")
        except FileNotFoundError:
            logger.error(f"Config file not found: {self.config_path}")
            sys.exit(1)
        except yaml.YAMLError as e:
            logger.error(f"Error parsing config file: {e}")
            sys.exit(1)
    
    def fetch_latest_image(self):
        """Fetch the latest image from the API"""
        try:
            # Prepare authentication
            auth_string = f"{self.config['user']}:{self.config['password']}"
            auth_bytes = auth_string.encode('ascii')
            auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
            
            headers = {
                'Authorization': f'Basic {auth_b64}',
                'Content-Type': 'application/json'
            }
            
            # Make API request
            url = f"{self.config['api_url']}/images/{self.config['user']}"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return {
                        'timestamp': data['timestamp'],
                        'download_url': data['downloadUrl']
                    }
                else:
                    logger.error(f"API returned error: {data.get('message', 'Unknown error')}")
            elif response.status_code == 404:
                logger.info("No images found for user")
            else:
                logger.error(f"API request failed with status {response.status_code}: {response.text}")
                
        except requests.exceptions.Timeout:
            logger.error("API request timed out")
        except requests.exceptions.ConnectionError:
            logger.error("Failed to connect to API")
        except Exception as e:
            logger.error(f"Error fetching latest image: {e}")
        
        return None
    
    def download_image(self, download_url):
        """Download image from the provided URL"""
        try:
            response = requests.get(download_url, timeout=30)
            if response.status_code == 200:
                return Image.open(BytesIO(response.content))
            else:
                logger.error(f"Failed to download image: HTTP {response.status_code}")
        except Exception as e:
            logger.error(f"Error downloading image: {e}")
        return None
    
    
    def display_image(self, image):
        """Display the image on the Inky display"""
        with self.display_lock:
            try:
                self.inky_display.set_image(image)
                self.inky_display.show()
                logger.info("Successfully updated display with new image")
            except Exception as e:
                logger.error(f"Error displaying image: {e}")
    
    def run(self):
        """Main loop"""
        logger.info("Starting Love Notes Display service")
        
        while self.running:
            try:
                # Reload config (in case it changed)
                self.load_config()
                
                # Fetch latest image info
                image_info = self.fetch_latest_image()
                
                if image_info:
                    # Check if we have a new image
                    if self.current_timestamp != image_info['timestamp']:
                        logger.info(f"New image detected (timestamp: {image_info['timestamp']})")
                        
                        # Download the image
                        image = self.download_image(image_info['download_url'])
                        
                        if image:
                            # Process and display the image
                            self.display_image(image)
                            self.current_timestamp = image_info['timestamp']
                    else:
                        logger.debug("No new image available")
                else:
                    logger.warning("Failed to fetch image info")
                
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
            
            # Wait 15 seconds before next check
            for _ in range(15):
                if not self.running:
                    break
                time.sleep(1)
        
        logger.info("Love Notes Display service stopped")

def main():
    """Main entry point"""
    try:
        display = LoveNotesDisplay()
        display.run()
    except KeyboardInterrupt:
        logger.info("Service interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 