# Docker Instructions for Interactive Letter Application

This document provides comprehensive instructions for building and running the Interactive Letter Application using Docker. The application has been integrated with Google Sheets connectivity and follows the pema_backend Docker configuration patterns.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: [Install Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Google Cloud Service Account**: Access to Google Sheets API

## Project Structure

The integrated project structure follows this layout:

```
interactive-letter/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # React components (LetterFront, LetterBack, etc.)
│   │   ├── services/           # API service layer
│   │   └── hooks/              # Custom React hooks
│   ├── package.json
│   └── Dockerfile.frontend     # Legacy frontend-only Dockerfile
├── server/                     # Node.js Express backend
│   ├── routes/                 # API routes (questions, content)
│   ├── services/               # Google Sheets service
│   ├── data/                   # Local data storage (fallback)
│   ├── service_account.json    # Google Cloud service account (you need to add this)
│   └── package.json
├── Dockerfile                  # Unified multi-stage Dockerfile (recommended)
├── docker-compose.yml          # Docker Compose configuration
├── .dockerignore              # Docker ignore patterns
├── .env.example               # Environment variables template
└── README.md                  # Project documentation
```

## Google Sheets Setup

### 1. Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a service account with "Editor" role
5. Generate and download the JSON key file
6. Rename it to `service_account.json` and place it in the `server/` directory

### 2. Create Google Sheets

Create a Google Spreadsheet with the following sheets:

#### Sheet 1: "Questions"
| id | language | title | question | options | hasLetter | letterContent | content |
|---|---|---|---|---|---|---|---|
| home | en | Welcome to Our Interactive Experience | What would you like to explore today? | `[{"id":"option1","text":"Learn About Our Services","nextQuestion":"services"}]` | FALSE | | |
| services | en | Our Services | Which service interests you most? | `[{"id":"web","text":"Web Development","nextQuestion":"web-details"}]` | TRUE | Thank you for your interest... | We provide comprehensive... |

#### Sheet 2: "Letter_Content"
| questionId | language | letterContent | hasLetter |
|---|---|---|---|
| services | en | Thank you for your interest in our services. We would love to discuss how we can help your business grow. | TRUE |
| contact | en | We look forward to hearing from you and discussing how we can work together. | TRUE |

### 3. Share the Spreadsheet

Share your Google Spreadsheet with the service account email address (found in your `service_account.json` file) and give it "Editor" permissions.

## Environment Configuration

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your actual values:

```env
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Actual-Private-Key-Here\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your-actual-spreadsheet-id

# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

**Important Notes:**
- Replace `your-service-account@your-project.iam.gserviceaccount.com` with the actual email from your service account JSON
- Replace `Your-Actual-Private-Key-Here` with the private key from your service account JSON (keep the `\n` characters)
- Replace `your-actual-spreadsheet-id` with your Google Spreadsheet ID (found in the URL)

## Building and Running with Docker

### Option 1: Using Docker Compose (Recommended)

This is the easiest method and follows the pema_backend approach:

```bash
# Build and start the application
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 2: Using Docker Build Directly

If you prefer to build and run manually:

```bash
# Build the Docker image
docker build -t interactive-letter .

# Run the container
docker run -d \
  --name interactive-letter-container \
  -p 5000:5000 \
  -v $(pwd)/server/service_account.json:/app/service_account.json:ro \
  -e GOOGLE_SERVICE_ACCOUNT_EMAIL="your-email@project.iam.gserviceaccount.com" \
  -e GOOGLE_PRIVATE_KEY="your-private-key" \
  interactive-letter
```

## Accessing the Application

Once the containers are running:

- **Full Application**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health
- **API Documentation**: 
  - Questions API: http://localhost:5000/api/questions/home/en
  - Content API: http://localhost:5000/api/content/languages

## Application Features

### Frontend Features
- **3D Letter Animation**: Smooth flip animation when transitioning from phone input to language selection
- **Multi-Language Support**: English, Arabic, and Persian languages
- **Lazy Loading**: Optimized performance with Intersection Observer API
- **Responsive Design**: Mobile-first design that works on all devices
- **SVG Graphics**: Beautiful letter graphics with animations

### Backend Features
- **Google Sheets Integration**: Dynamic content loading from Google Sheets
- **RESTful API**: Clean API endpoints for questions and content
- **Multi-Language Content**: Automatic language detection and content serving
- **Fallback Mechanisms**: Local JSON fallback when Google Sheets is unavailable
- **Phone Number Storage**: Capture and store user phone numbers

### Docker Features
- **Multi-Stage Build**: Optimized Docker image with separate frontend and backend stages
- **Health Checks**: Automatic health monitoring
- **Volume Mounting**: Persistent data storage
- **Environment Configuration**: Flexible environment variable management
- **Network Isolation**: Secure container networking

## Troubleshooting

### Common Issues

#### 1. Google Sheets Connection Failed
```
Error: Failed to initialize Google Sheets service
```
**Solution**: 
- Verify your `service_account.json` file is in the correct location
- Check that environment variables are properly set
- Ensure the spreadsheet is shared with the service account email

#### 2. Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**: 
- Stop other services using port 5000: `sudo lsof -ti:5000 | xargs kill -9`
- Or change the port in `docker-compose.yml`

#### 3. Permission Denied for service_account.json
```
Error: EACCES: permission denied, open '/app/service_account.json'
```
**Solution**: 
- Check file permissions: `chmod 644 server/service_account.json`
- Ensure the file is properly mounted in the container

#### 4. React Build Fails
```
Error: npm run build failed
```
**Solution**: 
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf client/node_modules && cd client && npm install`

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs interactive-letter

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

### Container Management

```bash
# List running containers
docker ps

# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Restart specific service
docker-compose restart interactive-letter
```

## Production Deployment

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Service Account**: Keep `service_account.json` secure and never expose it publicly
3. **HTTPS**: Use HTTPS in production with proper SSL certificates
4. **Firewall**: Configure firewall rules to restrict access to necessary ports only

### Performance Optimization

1. **Image Size**: The multi-stage build reduces final image size
2. **Caching**: Docker layer caching speeds up subsequent builds
3. **Health Checks**: Automatic container health monitoring
4. **Resource Limits**: Configure memory and CPU limits in production

### Monitoring

```bash
# Monitor container resource usage
docker stats

# Check container health
docker inspect --format='{{.State.Health.Status}}' interactive-letter-system

# View container processes
docker exec -it interactive-letter-system ps aux
```

This comprehensive Docker setup provides a robust, scalable, and maintainable deployment solution for the Interactive Letter Application with Google Sheets integration.

