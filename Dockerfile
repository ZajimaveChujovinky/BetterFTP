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

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Set sane environment defaults so the container runs without config
ENV PORT=2121 \
    PASV_MIN=7000 \
    PASV_MAX=7010 \
    PASV_URL=0.0.0.0 \
    MAX_CONNECTIONS=100 \
    IDLE_TIMEOUT=30000 \
    LOG_LEVEL=info \
    AUTH_DRIVER=json \
    JSON_PATH=/app/data/users.json

# Expose FTP Control and Passive Ports
# Control Port (Default 2121)
EXPOSE 2121
# Passive Ports Range (Default 7000-7010)
EXPOSE 7000-7010

# Use custom entrypoint to handle defaults/setup
ENTRYPOINT ["./entrypoint.sh"]

# Start the server
CMD ["npm", "start"]
