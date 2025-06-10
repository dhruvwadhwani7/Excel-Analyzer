# Use official Node 18 image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose port (optional)
EXPOSE 3000

# Run your app
CMD ["npm", "start"]
