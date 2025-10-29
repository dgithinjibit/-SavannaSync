#!/bin/bash

# SavannaSync Cloud Deployment Script with NGINX
# Usage: ./deploy-cloud.sh [VM_IP_ADDRESS]

set -e  # Exit on any error

# Configuration
PROJECT_DIR="/home/ubuntu/SavannaSync"
NGINX_SITE_NAME="syncsenta"
JAVA_SERVICE_NAME="syncsenta-backend"
JAVA_JAR_PATH="/opt/syncsenta/syncsenta-ai-service-1.0.0.jar"

# Get VM IP address
VM_IP=${1:-$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')}

echo "========================================"
echo "  SavannaSync Cloud Deployment Script  "
echo "========================================"
echo "VM IP Address: ${VM_IP}"
echo

# Function to print status
print_status() {
    echo "[INFO] $1"
}

print_warning() {
    echo "[WARNING] $1"
}

print_error() {
    echo "[ERROR] $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "Please run this script as a regular user, not root"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory $PROJECT_DIR not found!"
    print_warning "Please clone the repository first:"
    echo "git clone https://github.com/Muturi-002/SavannaSync.git $PROJECT_DIR"
    exit 1
fi

print_status "Starting deployment configuration process..."

# 1. Configure NGINX
print_status "Configuring NGINX..."

# Create NGINX configuration
sudo tee /etc/nginx/sites-available/$NGINX_SITE_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $VM_IP localhost;
    
    # Frontend - Serve React build files
    root $PROJECT_DIR/frontend/dist;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Handle React Router - SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache control for HTML files
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    
    # API proxy to Java backend
    location /api/ {
        proxy_pass http://localhost:8081;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        # Handle preflight OPTIONS requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site and disable default
sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
sudo nginx -t

print_status "NGINX configuration completed"

# 2. Create Java Backend Systemd Service
print_status "Creating Java backend service..."

sudo tee /etc/systemd/system/$JAVA_SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=SyncSenta AI Service
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/syncsenta
ExecStart=/usr/bin/java -jar $JAVA_JAR_PATH
Restart=always
RestartSec=10

# Environment variables
Environment=SPRING_PROFILES_ACTIVE=production
Environment=SERVER_PORT=8081

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/syncsenta

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=syncsenta-backend

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable $JAVA_SERVICE_NAME

print_status "Java backend service created"

# 3. Start Services
print_status "Starting services..."

# Start Java backend
sudo systemctl start $JAVA_SERVICE_NAME
sleep 5

# Check if Java service is running
if sudo systemctl is-active --quiet $JAVA_SERVICE_NAME; then
    print_status "Java backend service started successfully"
else
    print_error "Java backend service failed to start"
    print_warning "Check logs with: sudo journalctl -u $JAVA_SERVICE_NAME -f"
fi

# Start NGINX
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check if NGINX is running
if sudo systemctl is-active --quiet nginx; then
    print_status "NGINX started successfully"
else
    print_error "NGINX failed to start"
    exit 1
fi

# 4. Create management scripts
print_status "Creating management scripts..."

# Create restart script
cat > "$PROJECT_DIR/restart-services.sh" << 'EOF'
#!/bin/bash
echo "Restarting SavannaSync services..."
sudo systemctl restart syncsenta-backend
sudo systemctl restart nginx
echo "Services restarted!"
EOF

# Create logs script
cat > "$PROJECT_DIR/view-logs.sh" << 'EOF'
#!/bin/bash
echo "Choose which logs to view:"
echo "1) Java Backend Logs"
echo "2) NGINX Access Logs"
echo "3) NGINX Error Logs"
echo "4) System Logs"
read -p "Enter choice (1-4): " choice

case $choice in
    1) sudo journalctl -u syncsenta-backend -f ;;
    2) sudo tail -f /var/log/nginx/access.log ;;
    3) sudo tail -f /var/log/nginx/error.log ;;
    4) sudo journalctl -f ;;
    *) echo "Invalid choice" ;;
esac
EOF

# Create update script
cat > "$PROJECT_DIR/update-app.sh" << 'EOF'
#!/bin/bash
cd /home/ubuntu/SavannaSync

echo "Note: This script is for manual updates only."
echo "Normally, updates are handled by the CI/CD pipeline."
echo ""
echo "If you need to manually update:"
echo "1. Pull latest code: git pull origin main"
echo "2. Trigger CI/CD pipeline or run builds manually"
echo "3. Run deployment script: ./deploy-cloud.sh"
echo ""
read -p "Do you want to restart services only? (y/n): " restart_only

if [ "$restart_only" = "y" ]; then
    echo "Restarting services..."
    sudo systemctl restart syncsenta-backend
    sudo systemctl restart nginx
    echo "Services restarted!"
else
    echo "Update cancelled. Use CI/CD pipeline for full updates."
fi
EOF

# Make scripts executable
chmod +x "$PROJECT_DIR"/*.sh

print_status "Management scripts created"

# 5. Final status check
print_status "Performing final status check..."

# Check services status
if sudo systemctl is-active --quiet nginx; then
    echo "NGINX: Running"
else
    echo "NGINX: Failed"
fi

if sudo systemctl is-active --quiet $JAVA_SERVICE_NAME; then
    echo "Java Backend: Running"
else
    echo "Java Backend: Failed"
fi

# Test HTTP response
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "Frontend: Accessible"
else
    echo "Frontend: Check manually"
fi

echo
echo "Application URLs:"
echo "Frontend: http://${VM_IP}"
echo "Backend API: http://${VM_IP}/api"
echo "Health Check: http://${VM_IP}/health"

echo
echo "Management Commands:"
echo "View logs: ./view-logs.sh"
echo "Restart services: ./restart-services.sh"
echo "Update application: ./update-app.sh"

echo
echo "Deployment completed successfully!"
echo "Visit http://${VM_IP} to access your application"