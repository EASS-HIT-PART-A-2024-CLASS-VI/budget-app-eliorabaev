# Use the official lightweight Node.js image from the Docker Hub
FROM node:19.5.0-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 to the outside world
EXPOSE 3000

# Serve the application
CMD ["npx", "serve", "-s", "build"]
