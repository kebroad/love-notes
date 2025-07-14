#!/bin/bash
# Love Notes Display - Installation Script for Raspberry Pi Zero W
# Run this script with sudo: sudo bash install.sh

set -e

echo "🎨 Love Notes Display - Installation Script"
echo "==========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run with sudo"
    echo "Please run: sudo bash install.sh"
    exit 1
fi

# Check if we're on a Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    echo "Continuing anyway..."
fi

echo "📦 Updating system packages..."
apt update
apt install -y git

echo "🎨 Installing Inky library using official Pimoroni installer..."
# Create temporary directory for installation in kevin's home
TEMP_DIR=$(sudo -u kevin mktemp -d)

# Change to kevin's home directory and run as kevin user
cd /home/kevin

echo "📥 Cloning Pimoroni Inky repository as kevin user..."
sudo -u kevin git clone https://github.com/pimoroni/inky "$TEMP_DIR/inky"

# Run the official Pimoroni installer as kevin user
echo "🔧 Running official Pimoroni installer as kevin user..."
cd "$TEMP_DIR/inky"
sudo -u kevin ./install.sh

# Clean up temporary directory
rm -rf "$TEMP_DIR"

# Go back to original directory
cd - > /dev/null

echo "👤 Creating dedicated system user 'love-notes'..."
if ! id "love-notes" &>/dev/null; then
    useradd --system --create-home --home-dir /opt/love-notes --shell /bin/bash --groups spi,gpio,i2c love-notes
    echo "✅ Created system user 'love-notes'"
else
    echo "✅ System user 'love-notes' already exists"
    # Make sure user is in the right groups
    usermod -a -G spi,gpio,i2c love-notes
fi

echo "📁 Creating directories and setting permissions..."
mkdir -p /etc/love_notes
mkdir -p /var/log
mkdir -p /opt/love-notes
chown -R love-notes:love-notes /opt/love-notes
chmod 755 /opt/love-notes

# Copy files to the system user's directory
echo "📋 Installing application files..."
cp love_notes_display.py /opt/love-notes/
cp requirements.txt /opt/love-notes/
chown love-notes:love-notes /opt/love-notes/love_notes_display.py
chown love-notes:love-notes /opt/love-notes/requirements.txt
chmod 755 /opt/love-notes/love_notes_display.py

echo "📋 Installing additional Python requirements in pimoroni virtual environment..."
# Install additional requirements in the pimoroni virtual environment as kevin user
sudo -u kevin /home/kevin/.virtualenvs/pimoroni/bin/pip install -r /opt/love-notes/requirements.txt

# Give love-notes user read access to the virtual environment site-packages
echo "🔐 Setting up virtual environment access for love-notes user..."
chmod -R o+r /home/kevin/.virtualenvs/pimoroni/lib/python3.11/site-packages
find /home/kevin/.virtualenvs/pimoroni/lib/python3.11/site-packages -type d -exec chmod o+x {} \;

echo "🔍 Verifying Inky installation..."
if sudo -u kevin /home/kevin/.virtualenvs/pimoroni/bin/python -c "import inky; print('✅ Inky library installed successfully')"; then
    echo "✅ Inky library verification passed"
else
    echo "❌ Inky library installation failed"
    echo "Please check the installation logs above"
    exit 1
fi

echo "⚙️  Setting up configuration..."
if [ ! -f "/etc/love_notes/config.yaml" ]; then
    cp config.yaml /etc/love_notes/config.yaml
    chown love-notes:love-notes /etc/love_notes/config.yaml
    chmod 600 /etc/love_notes/config.yaml
    echo "📝 Configuration file created at /etc/love_notes/config.yaml"
    echo "Please edit this file with your credentials before starting the service"
else
    echo "📝 Configuration file already exists at /etc/love_notes/config.yaml"
    # Ensure proper ownership and permissions
    chown love-notes:love-notes /etc/love_notes/config.yaml
    chmod 600 /etc/love_notes/config.yaml
fi

echo "🔧 Installing systemd services..."
cp love-notes-interfaces.service /etc/systemd/system/
cp love-notes-display.service /etc/systemd/system/
systemctl daemon-reload

echo "📝 Setting up log file permissions..."
touch /var/log/love_notes_display.log
chown love-notes:love-notes /var/log/love_notes_display.log
chmod 644 /var/log/love_notes_display.log

echo "🚀 Setting up services to start on boot..."
systemctl enable love-notes-interfaces.service
systemctl enable love-notes-display.service

echo "✅ Installation complete!"
echo ""
echo "System user 'love-notes' has been created with home directory: /opt/love-notes"
echo "Inky library installed in Pimoroni virtual environment: /home/kevin/.virtualenvs/pimoroni"
echo ""
echo "🔍 Final verification:"
echo "Testing Python imports in pimoroni virtual environment..."
if sudo -u kevin /home/kevin/.virtualenvs/pimoroni/bin/python -c "import inky, PIL, requests, yaml; print('✅ All required libraries available')"; then
    echo "✅ All dependencies verified successfully"
else
    echo "❌ Some dependencies may have issues - check logs when starting service"
fi
echo ""
echo "Next steps:"
echo "1. Edit the configuration file:"
echo "   sudo nano /etc/love_notes/config.yaml"
echo ""
echo "2. Start the services:"
echo "   sudo systemctl start love-notes-interfaces.service"
echo "   sudo systemctl start love-notes-display.service"
echo ""
echo "3. Check service status:"
echo "   sudo systemctl status love-notes-interfaces.service"
echo "   sudo systemctl status love-notes-display.service"
echo ""
echo "4. View logs:"
echo "   sudo journalctl -u love-notes-interfaces.service -f"
echo "   sudo journalctl -u love-notes-display.service -f"
echo "   # or: sudo tail -f /var/log/love_notes_display.log"
echo ""
echo "5. To stop the services:"
echo "   sudo systemctl stop love-notes-display.service"
echo "   sudo systemctl stop love-notes-interfaces.service"
echo ""
echo "Security notes:"
echo "- Interface setup service runs as root (required for raspi-config)"
echo "- Display service runs as dedicated 'love-notes' system user"
echo "- Inky library installed in official Pimoroni virtual environment"
echo "- Config file has restricted permissions (600)"
echo "- Application files are owned by love-notes user"
echo ""
echo "The services will automatically start on boot in the correct order."
echo "Make sure your Inky Impression display is connected before starting!"
echo ""
echo "📚 For manual testing, switch to kevin user and activate the pimoroni virtual environment:"
echo "   su - kevin"
echo "   source ~/.virtualenvs/pimoroni/bin/activate" 