# Server Setup Commands for Ubuntu 188.121.105.115

This document provides the exact commands you need to run on your Ubuntu server to deploy the Interactive Letter Application.

## Prerequisites

Make sure you have SSH access to your server:
```bash
ssh ubuntu@188.121.105.115
```

## Method 1: Quick Deployment (Recommended)

### Step 1: Transfer Files to Server

On your local machine, transfer the project files:
```bash
scp -r interactive-letter ubuntu@188.121.105.115:/home/ubuntu/
```

### Step 2: Run Quick Deploy Script

SSH into your server and run:
```bash
ssh ubuntu@188.121.105.115
cd /home/ubuntu/interactive-letter
./QUICK_DEPLOY.sh docker
```

### Step 3: Configure Google Sheets

Create the environment file:
```bash
cp .env.example .env
nano .env
```

Add your Google Sheets credentials to the `.env` file:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

Upload your `service_account.json` file:
```bash
scp service_account.json ubuntu@188.121.105.115:/home/ubuntu/interactive-letter/server/
```

### Step 4: Restart Application

```bash
docker-compose down
docker-compose up -d
```

## Method 2: Manual Docker Setup

### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Docker
```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

### Step 3: Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 5000/tcp
sudo ufw --force enable
```

### Step 4: Deploy Application
```bash
cd /home/ubuntu/interactive-letter
docker-compose up --build -d
```

## Method 3: Manual Node.js Setup

### Step 1: Install Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### Step 2: Install PM2 and Nginx
```bash
npm install -g pm2
sudo apt install -y nginx
```

### Step 3: Build Application
```bash
cd /home/ubuntu/interactive-letter/server
npm install --production
cd ../client
npm install
npm run build
```

### Step 4: Start Backend
```bash
cd /home/ubuntu/interactive-letter/server
pm2 start index.js --name interactive-letter-backend
pm2 save
pm2 startup
```

### Step 5: Configure Nginx
```bash
sudo tee /etc/nginx/sites-available/interactive-letter > /dev/null <<'EOF'
server {
    listen 80;
    server_name 188.121.105.115;
    
    root /home/ubuntu/interactive-letter/client/build;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/interactive-letter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Verification Commands

Check if services are running:
```bash
# For Docker deployment
docker-compose ps
docker-compose logs

# For Node.js deployment
pm2 status
sudo systemctl status nginx

# Test the application
curl http://localhost:5000/api/health
curl http://188.121.105.115/api/health
```

## Troubleshooting Commands

View logs:
```bash
# Docker logs
docker-compose logs -f

# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

Check ports:
```bash
sudo netstat -tulnp | grep :5000
sudo netstat -tulnp | grep :80
```

## Security Hardening (Optional but Recommended)

### Disable Password Authentication
```bash
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh
```

### Install Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Check Firewall Status
```bash
sudo ufw status verbose
```

## Access Your Application

After successful deployment, your application will be available at:
- **Docker deployment**: http://188.121.105.115:5000
- **Node.js deployment**: http://188.121.105.115

The API health check endpoint: http://188.121.105.115:5000/api/health (or :80 for Node.js deployment)

