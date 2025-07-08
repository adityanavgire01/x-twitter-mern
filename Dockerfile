# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --only=production
RUN cd server && npm install --only=production
RUN cd client && npm install

# Copy source code
COPY . .

# Build the client
RUN cd client && npm run build

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 