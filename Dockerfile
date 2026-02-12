# Use Node.js 20 Alpine for small footprint
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies (ignoring scripts initially to speed up)
# Add build tools for native modules (sqlite3, bcrypt etc)
RUN apk add --no-cache python3 make g++
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose FTP Control and Passive Ports
# Control Port (Default 2121)
EXPOSE 2121
# Passive Ports Range (Default 7000-7010)
EXPOSE 7000-7010

# Start the server
CMD ["npm", "start"]
