#!/bin/bash

# SSH Deployment Automation Script
# Usage: ./ssh_deploy.sh <host> <project_path>

HOST=${1:-localhost}
PROJECT_PATH=${2:-~/deployment}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment to $HOST"

# Create deployment directory
ssh "$HOST" "mkdir -p $PROJECT_PATH/releases/$TIMESTAMP"

# Upload project files (example)
echo "📦 Uploading files..."
scp -r ./*.js "$HOST:$PROJECT_PATH/releases/$TIMESTAMP/" 2>/dev/null || echo "⚠️ No JS files to upload"

# Create symlink to current
ssh "$HOST" "cd $PROJECT_PATH && rm -f current && ln -s releases/$TIMESTAMP current"

# Run deployment commands
echo "⚙️ Running deployment commands..."
ssh "$HOST" "cd $PROJECT_PATH/current && echo 'Deployment completed at $(date)' > deployment.log"

echo "✅ Deployment to $HOST completed!"
echo "📍 Deployed to: $PROJECT_PATH/current"
