#!/bin/bash

# Quick Deployment Script for Interactive Letter Application
# Usage: ./QUICK_DEPLOY.sh [docker|nodejs]

set -e

echo "🚀 Interactive Letter Application - Quick Deploy Script"
echo "=================================================="

# Check if deployment method is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [docker|nodejs]"
    echo "  docker  - Deploy using Docker Compose (recommended)"
    echo "  nodejs  - Deploy using direct Node.js with PM2 and Nginx"
    exit 1
fi

DEPLOY_METHOD=$1

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install common dependencies
echo "🔧 Installing common dependencies..."
sudo apt install -y curl wget git ufw fail2ban

# Configure basic firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# Configure Fail2Ban
echo "🛡️  Configuring Fail2Ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

if [ "$DEPLOY_METHOD" = "docker" ]; then
    echo "🐳 Setting up Docker deployment..."
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        sudo apt install -y ca-certificates curl gnupg lsb-release
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        sudo usermod -aG docker $USER
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "⚠️  Warning: .env file not found. Please create it from .env.example"
        echo "Make sure to configure Google Sheets credentials!"
    fi
    
    # Check if service_account.json exists
    if [ ! -f "server/service_account.json" ]; then
        echo "⚠️  Warning: server/service_account.json not found."
        echo "Please add your Google Cloud service account JSON file!"
    fi
    
    # Build and start with Docker Compose
    echo "🏗️  Building and starting application with Docker Compose..."
    docker-compose down 2>/dev/null || true
    docker-compose up --build -d
    
    echo "✅ Docker deployment completed!"
    echo "🌐 Application should be available at: http://$(curl -s ifconfig.me):5000"
    
elif [ "$DEPLOY_METHOD" = "nodejs" ]; then
    echo "⚡ Setting up Node.js deployment..."
    
    # Install Node.js via nvm
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install --lts
        nvm use --lts
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        sudo apt install -y nginx
    fi
    
    # Install dependencies and build
    echo "📦 Installing dependencies..."
    cd server && npm install --production && cd ..
    cd client && npm install && npm run build && cd ..
    
    # Start backend with PM2
    echo "🚀 Starting backend with PM2..."
    cd server
    pm2 delete interactive-letter-backend 2>/dev/null || true
    pm2 start index.js --name interactive-letter-backend
    pm2 save
    pm2 startup
    cd ..
    
    # Configure Nginx
    echo "🌐 Configuring Nginx..."
    sudo tee /etc/nginx/sites-available/interactive-letter > /dev/null <<EOF
server {
    listen 80;
    server_name $(curl -s ifconfig.me);
    
    root /home/ubuntu/interactive-letter/client/build;
    index index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/interactive-letter /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    
    echo "✅ Node.js deployment completed!"
    echo "🌐 Application should be available at: http://$(curl -s ifconfig.me)"
    
else
    echo "❌ Invalid deployment method. Use 'docker' or 'nodejs'"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your Google Sheets credentials in .env file"
echo "2. Add service_account.json file to server/ directory"
echo "3. Test the application by visiting the URL above"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "🐳 For Docker-specific help, see DOCKER_INSTRUCTIONS.md"

