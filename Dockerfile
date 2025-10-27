# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
