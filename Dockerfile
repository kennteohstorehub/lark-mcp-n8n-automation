# Use the official Node.js 18 image as base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lark-mcp -u 1001 -G nodejs

# Create necessary directories and set permissions
RUN mkdir -p logs tmp backups && \
    chown -R lark-mcp:nodejs /app && \
    chmod -R 755 /app

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER lark-mcp

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

# Build metadata
LABEL maintainer="Lark MCP Team <your-email@example.com>"
LABEL version="1.0.0"
LABEL description="Lark MCP n8n Automation Server"
LABEL org.opencontainers.image.title="Lark MCP Server"
LABEL org.opencontainers.image.description="AI-powered automation server for Lark Suite with MCP and n8n integration"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Lark MCP Team"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/your-username/lark-mcp-n8n-automation" 