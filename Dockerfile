FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
