#!/bin/bash

# 🚨 Emergency Android Backup Setup Script
# This script will install ADB and run the emergency backup

echo "🚨 Emergency Android Backup Setup"
echo "================================="
echo ""

# Check if running on macOS, Linux, or Windows (Git Bash)
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo "🔍 Detected OS: $OS"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if ADB is already installed
if command_exists adb; then
    echo "✅ ADB is already installed"
    ADB_VERSION=$(adb version | head -1)
    echo "   $ADB_VERSION"
else
    echo "📦 Installing ADB..."
    
    case $OS in
        "mac")
            if command_exists brew; then
                echo "   Using Homebrew to install ADB..."
                brew install android-platform-tools
            else
                echo "❌ Homebrew not found. Please install Homebrew first:"
                echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            ;;
        "linux")
            if command_exists apt; then
                echo "   Using apt to install ADB..."
                sudo apt update
                sudo apt install -y android-tools-adb
            elif command_exists dnf; then
                echo "   Using dnf to install ADB..."
                sudo dnf install -y android-tools
            elif command_exists yum; then
                echo "   Using yum to install ADB..."
                sudo yum install -y android-tools
            else
                echo "❌ No supported package manager found (apt, dnf, yum)"
                echo "Please install ADB manually"
                exit 1
            fi
            ;;
        "windows")
            echo "❌ Windows detected. Please install ADB manually:"
            echo "   1. Download Android SDK Platform Tools"
            echo "   2. Extract to a folder (e.g., C:\\adb)"
            echo "   3. Add to PATH environment variable"
            echo "   4. Or use chocolatey: choco install adb"
            exit 1
            ;;
    esac
fi

echo ""

# Check if Node.js is installed
if command_exists node; then
    echo "✅ Node.js is installed"
    NODE_VERSION=$(node --version)
    echo "   $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   https://nodejs.org/en/download/"
    exit 1
fi

echo ""

# Check if the backup script exists
if [ ! -f "android_emergency_backup.js" ]; then
    echo "❌ Emergency backup script not found!"
    echo "Please make sure android_emergency_backup.js is in the current directory"
    exit 1
fi

echo "✅ Emergency backup script found"
echo ""

# Check device connection
echo "🔍 Checking device connection..."
if adb devices | grep -q "device$"; then
    echo "✅ Android device detected and ready"
    DEVICE_INFO=$(adb shell getprop ro.product.model)
    echo "   Device: $DEVICE_INFO"
else
    echo "❌ No Android device detected"
    echo ""
    echo "📱 Please make sure:"
    echo "   1. Your phone is connected via USB"
    echo "   2. USB debugging is enabled"
    echo "   3. You've authorized this computer"
    echo ""
    echo "🔧 To enable USB debugging:"
    echo "   Settings → About Phone → Tap Build Number 7 times"
    echo "   Settings → Developer Options → Enable USB Debugging"
    echo ""
    read -p "Press Enter after connecting your device..."
    
    # Check again
    if adb devices | grep -q "device$"; then
        echo "✅ Device connected successfully!"
    else
        echo "❌ Device still not detected. Please check connection."
        exit 1
    fi
fi

echo ""

# Final confirmation
echo "🚨 EMERGENCY BACKUP READY"
echo "========================="
echo ""
echo "⚠️  IMPORTANT WARNINGS:"
echo "   • Keep your phone connected throughout the process"
echo "   • Don't use your phone during backup"
echo "   • This will create a backup folder with your data"
echo "   • The process may take 10-30 minutes depending on data"
echo ""
echo "📱 Your crashing phone will be backed up safely"
echo "💾 Critical data will be saved first (photos, videos, documents)"
echo ""

read -p "Are you ready to start the emergency backup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting Emergency Backup..."
    echo "==============================="
    
    # Run the backup
    node android_emergency_backup.js
    
    # Check if backup was successful
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 BACKUP COMPLETED SUCCESSFULLY!"
        echo "================================="
        echo ""
        echo "📁 Your backup is ready in the emergency_backup_* folder"
        echo "💡 Next steps:"
        echo "   1. Verify your important files are in the backup"
        echo "   2. Copy the backup to cloud storage"
        echo "   3. Factory reset your phone"
        echo "   4. Restore from backup after reset"
        echo ""
        echo "🔄 You can now safely factory reset your phone!"
    else
        echo ""
        echo "❌ Backup failed or was interrupted"
        echo "Please check the error messages above and try again"
    fi
else
    echo ""
    echo "❌ Backup cancelled"
    echo "Run this script again when you're ready"
fi

echo ""
echo "📧 Need help? Check the emergency_backup_setup.md file"
echo "🆘 For urgent issues, contact your device manufacturer" 