# Stage 1: Build the Angular app using Node.js
FROM node:22-slim AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Angular app in production mode
RUN npm run build

# Stage 2: Serve the app with NGINX
FROM nginx:alpine

# Copy the built Angular app from the build stage
COPY --from=build /app/dist/swm2-2-at-kammerer-frontend/browser /usr/share/nginx/html

# Expose port 80 for the NGINX web server
EXPOSE 80

# Start the NGINX server
CMD ["nginx", "-g", "daemon off;"]
