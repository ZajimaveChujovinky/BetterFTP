#!/bin/sh
set -e

# Default paths
: "${JSON_PATH:=/app/data/users.json}"
: "${AUTH_DRIVER:=json}"

echo "BetterFTP Container Starting..."

# Ensure data directory exists
mkdir -p "$(dirname "$JSON_PATH")"
mkdir -p /app/data

# Check if we are using JSON driver and if the file is missing
if [ "$AUTH_DRIVER" = "json" ]; then
    if [ ! -f "$JSON_PATH" ]; then
        echo "No users.json found at $JSON_PATH"
        echo "Generating default admin user..."
        
        # Create default users.json with admin/admin123
        # admin123 hash: $2b$10$eJ6uRb5Z0722RAKwqmCkDulzhhkAwAF9HDSLPn/EFtbQ6WuBFS8IG
        cat <<EOF > "$JSON_PATH"
[
  {
    "username": "admin",
    "passwordHash": "\$2b\$10\$eJ6uRb5Z0722RAKwqmCkDulzhhkAwAF9HDSLPn/EFtbQ6WuBFS8IG",
    "homeDir": "/app/data/admin"
  }
]
EOF
        # Ensure admin home dir exists
        mkdir -p /app/data/admin
        
        echo "=================================================================="
        echo "DEFAULT USER CREATED"
        echo "Username: admin"
        echo "Password: admin123"
        echo "Home Dir: /app/data/admin"
        echo "=================================================================="
    else
        echo "Found existing users configuration at $JSON_PATH"
    fi
fi

# Pass control to the CMD instruction (npm start)
exec "$@"
