FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Clean install dependencies
RUN npm ci

# Copy rest of the application
COPY . .

# Rebuild esbuild to ensure binary compatibility
RUN npm rebuild esbuild

# Build the application
RUN npm run build

EXPOSE 4173

# Use node to serve the built files
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]