# Love Notes Display - Raspberry Pi Setup

This directory contains the Raspberry Pi program that displays love notes on an Inky Impression 4" e-ink display.

## Hardware Requirements

- **Raspberry Pi Zero W** (or any Raspberry Pi with GPIO)
- **Inky Impression 4" e-ink display** (640x400 pixels)
- MicroSD card (8GB or larger)
- Power supply for Raspberry Pi

## Hardware Setup

1. **Connect the Inky Impression display** to your Raspberry Pi Zero W:
   - The display connects via the GPIO header
   - Follow the [official Pimoroni wiring guide](https://learn.pimoroni.com/article/getting-started-with-inky-impression)

2. **Enable SPI interface** (done automatically by Pimoroni installer):
   ```bash
   sudo raspi-config
   # Navigate to Interface Options > SPI > Enable
   ```

## Software Installation

### 1. Copy Files to Raspberry Pi

Transfer all files from this directory to your Raspberry Pi:

```bash
# On your Raspberry Pi
cd /home/pi
git clone <your-repo-url>
cd love-notes/raspberry-pi
```

Or copy files manually:
- `love_notes_display.py` - Main program
- `config.yaml` - Configuration template
- `requirements.txt` - Python dependencies
- `install.sh` - Installation script
- `love-notes-display.service` - Systemd service file

### 2. Run Installation Script

**Important**: Run the installation script with sudo:

```bash
# Make sure you're in the raspberry-pi directory
cd /home/pi/love-notes/raspberry-pi

# Run the installation script with sudo
sudo bash install.sh
```

The script will:
- Update system packages
- **Install Inky library using official Pimoroni installer**
- **Create the pimoroni virtual environment at `/home/pi/.virtualenvs/pimoroni`**
- Enable SPI and I2C interfaces automatically
- Install additional Python dependencies in the pimoroni virtual environment
- **Create a dedicated system user 'love-notes'**
- Create necessary directories with proper permissions
- Install the systemd service
- Set up auto-start on boot

### 3. Configure Your Settings

Edit the configuration file with your credentials:

```bash
sudo nano /etc/love_notes/config.yaml
```

Update the following fields:
- `user`: Your username (e.g., "kevin" or "nicole")
- `password`: Your password
- `api_url`: API endpoint (already set to production)

### 4. Start the Service

```bash
# Start the service
sudo systemctl start love-notes-display.service

# Check if it's running
sudo systemctl status love-notes-display.service

# View live logs
sudo journalctl -u love-notes-display.service -f
```

## Installation Details

### Pimoroni Virtual Environment

The installation follows the [official Pimoroni installation method](https://github.com/pimoroni/inky):

1. **Clones the official repository**: `git clone https://github.com/pimoroni/inky` (as kevin user)
2. **Runs the official installer**: `./install.sh` (as kevin user)
3. **Creates virtual environment**: `/home/kevin/.virtualenvs/pimoroni`
4. **Installs all dependencies**: Including proper SPI/I2C configuration

### Manual Installation (Alternative)

If you prefer to install manually:

```bash
# Switch to kevin user
su - kevin

# Install Inky library using official method
git clone https://github.com/pimoroni/inky
cd inky
./install.sh

# Activate the pimoroni virtual environment
source ~/.virtualenvs/pimoroni/bin/activate

# Install additional requirements
pip install -r requirements.txt
```

## Security Features

- **Dedicated System User**: The service runs as a dedicated `love-notes` system user (not pi or root)
- **Official Pimoroni Environment**: Uses the official pimoroni virtual environment
- **Restricted Permissions**: Configuration file has 600 permissions (only accessible by love-notes user)
- **Proper Ownership**: All application files are owned by the love-notes user
- **Minimal Privileges**: Service runs with minimal required permissions

## How It Works

1. **Startup**: The program displays a startup message when it begins
2. **API Polling**: Every 15 seconds, it checks the API for new images
3. **Image Processing**: When a new image is found, it downloads and processes it to fit the display
4. **Display Update**: The e-ink display is updated with the new image
5. **Error Handling**: Any errors are displayed on the screen with timestamps

## Service Management

```bash
# Start the service
sudo systemctl start love-notes-display.service

# Stop the service
sudo systemctl stop love-notes-display.service

# Restart the service
sudo systemctl restart love-notes-display.service

# Check status
sudo systemctl status love-notes-display.service

# View logs
sudo journalctl -u love-notes-display.service -f
# or
sudo tail -f /var/log/love_notes_display.log

# Disable auto-start
sudo systemctl disable love-notes-display.service

# Enable auto-start
sudo systemctl enable love-notes-display.service
```

## Troubleshooting

### Inky Library Not Found Error

If you get the error "ERROR: Inky library not installed. Please install with: pip install inky", try these solutions:

#### Quick Fix Script
Run the provided fix script:
```bash
sudo bash fix_inky.sh
```

#### Manual Fix Using Official Method
1. **Install using official Pimoroni installer**:
   ```bash
   git clone https://github.com/pimoroni/inky
   cd inky
   ./install.sh
   ```

2. **Test the installation**:
   ```bash
   source ~/.virtualenvs/pimoroni/bin/activate
   python -c "import inky; print('Inky version:', inky.__version__)"
   ```

3. **Install additional requirements**:
   ```bash
   source ~/.virtualenvs/pimoroni/bin/activate
   pip install -r /opt/love-notes/requirements.txt
   ```

### ModuleNotFoundError: No module named 'inky'

This usually means the pimoroni virtual environment is not active or not installed:

```bash
# Check if virtual environment exists
ls -la /home/kevin/.virtualenvs/pimoroni

# Switch to kevin user and activate it manually
su - kevin
source ~/.virtualenvs/pimoroni/bin/activate

# Test import
python -c "import inky"
```

### Display Not Working

1. **Check SPI is enabled**:
   ```bash
   lsmod | grep spi
   ```

2. **Check display connection**:
   - Ensure all GPIO pins are properly connected
   - Try the Pimoroni examples to test the display

3. **Check user permissions**:
   ```bash
   groups love-notes
   # Should show: love-notes spi gpio
   ```

4. **Check for SPI chip select issue**:
   ```bash
   # Add this line to /boot/firmware/config.txt if needed
   echo "dtoverlay=spi0-0cs" | sudo tee -a /boot/firmware/config.txt
   sudo reboot
   ```

### Network Issues

1. **Check Wi-Fi connection**:
   ```bash
   ping google.com
   ```

2. **Test API manually**:
   ```bash
   curl -X GET "https://us-central1-love-notes-kb-2025.cloudfunctions.net/api/health"
   ```

### Service Issues

1. **Check service logs**:
   ```bash
   sudo journalctl -u love-notes-display.service --no-pager
   ```

2. **Check Python dependencies in pimoroni virtual environment**:
   ```bash
   sudo -u kevin /home/kevin/.virtualenvs/pimoroni/bin/pip list | grep -E "(inky|PIL|requests|yaml)"
   ```

3. **Test the program manually**:
   ```bash
   sudo -u love-notes /home/kevin/.virtualenvs/pimoroni/bin/python /opt/love-notes/love_notes_display.py
   ```

4. **Check file permissions**:
   ```bash
   ls -la /opt/love-notes/
   ls -la /etc/love_notes/
   ```

5. **Check virtual environment**:
   ```bash
   ls -la /home/kevin/.virtualenvs/pimoroni/
   sudo -u kevin /home/kevin/.virtualenvs/pimoroni/bin/python --version
   ```

## Configuration Options

The `/etc/love_notes/config.yaml` file supports these options:

```yaml
# Required settings
user: "your-username"
password: "your-password"
api_url: "https://us-central1-love-notes-kb-2025.cloudfunctions.net/api"

# Optional display settings
display:
  rotation: 0  # 0, 90, 180, or 270 degrees
  debug: false # Enable debug logging
  
  image:
    background_color: "white"
    quality: "high"
```

## Files and Directories

- `/opt/love-notes/love_notes_display.py` - Main program
- `/opt/love-notes/requirements.txt` - Python dependencies
- `/home/kevin/.virtualenvs/pimoroni/` - Pimoroni virtual environment
- `/etc/love_notes/config.yaml` - Configuration file (restricted permissions)
- `/etc/systemd/system/love-notes-display.service` - Systemd service
- `/var/log/love_notes_display.log` - Log file
- `/opt/love-notes/` - Application home directory

## System User Details

- **Username**: `love-notes`
- **Home Directory**: `/opt/love-notes`
- **Groups**: `love-notes`, `spi`, `gpio`
- **Shell**: `/bin/bash`
- **Type**: System user (no login)
- **Python Environment**: `/home/kevin/.virtualenvs/pimoroni`

## Features

- ✅ Automatic startup on boot
- ✅ 15-second polling interval
- ✅ Image processing and scaling
- ✅ Error handling and display
- ✅ Comprehensive logging
- ✅ Graceful shutdown handling
- ✅ Configuration file support
- ✅ Network error resilience
- ✅ Dedicated system user for security
- ✅ Official Pimoroni virtual environment
- ✅ Proper file permissions and ownership

## API Integration

The program uses these API endpoints:
- `GET /images/{user}` - Fetch latest image
- Authentication via Basic HTTP Auth

## Performance

- **Memory usage**: ~50MB typical
- **CPU usage**: Very low (mostly idle)
- **Network usage**: Minimal (only when new images are available)
- **Display updates**: Only when new content is available
- **Boot time**: Ready within 30 seconds of Pi startup

## Manual Testing

To test the program manually:

```bash
# Activate the pimoroni virtual environment
source ~/.virtualenvs/pimoroni/bin/activate

# Test Inky library
python -c "import inky; print('Inky available')"

# Run the program directly
sudo -u love-notes /home/kevin/.virtualenvs/pimoroni/bin/python /opt/love-notes/love_notes_display.py
```

## Support

For issues or questions:
1. Check the logs first: `sudo journalctl -u love-notes-display.service -f`
2. Verify your configuration: `sudo cat /etc/love_notes/config.yaml`
3. Test the API manually with curl
4. Check the hardware connections
5. Verify user permissions: `groups love-notes`
6. Test pimoroni virtual environment: `su - kevin && source ~/.virtualenvs/pimoroni/bin/activate && python -c "import inky"`
7. Check official Pimoroni documentation: https://github.com/pimoroni/inky