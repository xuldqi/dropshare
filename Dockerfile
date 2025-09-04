# Use Node.js official image as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup -g 1001 -S dropshare && \
    adduser -S dropshare -u 1001

# Change ownership of app directory
RUN chown -R dropshare:dropshare /app

# Switch to non-root user
USER dropshare

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
