# Multi-stage build for Interactive Letter Application
# Based on pema_backend Docker configuration

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY client/ ./

# Build the React application
RUN npm run build

# Stage 2: Setup Node.js Backend with Frontend
FROM node:20-alpine AS backend

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Set working directory
WORKDIR /app

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/client/build ./public

# Create necessary directories
RUN mkdir -p data services routes

# Set permissions
RUN chmod +x index.js

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Run the application
CMD ["npm", "start"]

