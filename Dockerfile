# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dropshare -u 1001

# Change ownership of app directory
RUN chown -R dropshare:nodejs /app

# Switch to non-root user
USER dropshare

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start application
CMD ["node", "index.js"]