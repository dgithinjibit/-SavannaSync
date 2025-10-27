#!/bin/bash

# SavannaSync - Manual Service Startup Script
# This script starts the Java backend and NGINX services manually

echo "==================================="
echo "SavannaSync Service Startup Script"
echo "==================================="

# Function to print status messages
print_status() {
    local message=$1
    echo "$message"
}

# Check if running as root for systemctl commands
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        print_status "This script requires sudo privileges for service management."
        print_status "You may be prompted for your password."
    fi
}

# Start Java Backend Service
start_backend() {
    print_status "Starting Java backend service..."
    
    if sudo systemctl start syncsenta-backend; then
        print_status "Java backend service started successfully"
        
        # Wait a moment for service to initialize
        sleep 3
        
        # Check service status
        if sudo systemctl is-active --quiet syncsenta-backend; then
            print_status "Backend service is running"
        else
            print_status "Backend service failed to start properly"
            print_status "Checking service logs..."
            sudo journalctl -u syncsenta-backend --no-pager -n 10
        fi
    else
        print_status "Failed to start Java backend service"
        return 1
    fi
}

# Start NGINX Service
start_nginx() {
    print_status "Starting NGINX service..."
    
    if sudo systemctl restart nginx; then
        print_status "NGINX restarted successfully"
        
        # Check NGINX status
        if sudo systemctl is-active --quiet nginx; then
            print_status "NGINX is running"
        else
            print_status "NGINX failed to start properly"
            sudo nginx -t
        fi
    else
        print_status "Failed to restart NGINX"
        return 1
    fi
}

# Test application accessibility
test_services() {
    print_status "Testing application accessibility..."
    
    # Wait for services to be fully ready
    sleep 5
    
    # Test frontend (served by NGINX)
    print_status "Testing frontend accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        print_status "Frontend is accessible via NGINX"
    else
        print_status "Frontend accessibility test failed"
    fi
    
    # Test backend health endpoints
    print_status "Testing backend health endpoints..."
    
    # Test Spring Boot Actuator health endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/actuator/health 2>/dev/null | grep -q "200"; then
        print_status "Backend actuator health check passed"
    else
        print_status "Backend actuator health endpoint not available"
    fi
    
    # Test if backend is responding on port 8081
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/ 2>/dev/null | grep -q -E "200|404|403"; then
        print_status "Backend is responding on port 8081"
    else
        print_status "Backend is not responding on port 8081"
        print_status "Checking if port 8081 is listening:"
        sudo netstat -tlnp | grep :8081 || print_status "Port 8081 not listening"
    fi
}

# Show service status
show_status() {
    echo ""
    print_status "=== Current Service Status ==="
    
    # Java Backend Status
    echo -n "Java Backend: "
    if sudo systemctl is-active --quiet syncsenta-backend; then
        print_status "RUNNING"
    else
        print_status "STOPPED"
    fi
    
    # NGINX Status
    echo -n "NGINX: "
    if sudo systemctl is-active --quiet nginx; then
        print_status "RUNNING"
    else
        print_status "STOPPED"
    fi
    
    echo ""
    print_status "=== Network Information ==="
    
    # Get server IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    print_status "Local Access: http://localhost"
    if [ ! -z "$SERVER_IP" ]; then
        print_status "Network Access: http://$SERVER_IP"
    fi
    
    echo ""
    print_status "=== Service Management Commands ==="
    echo "Start services: ./start-services.sh"
    echo "Stop backend: sudo systemctl stop syncsenta-backend"
    echo "Stop NGINX: sudo systemctl stop nginx"
    echo "Check backend logs: sudo journalctl -u syncsenta-backend -f"
    echo "Check NGINX logs: sudo tail -f /var/log/nginx/access.log"
}

# Main execution
main() {
    check_sudo
    
    # Start services
    start_backend
    if [ $? -eq 0 ]; then
        start_nginx
        if [ $? -eq 0 ]; then
            test_services
            show_status
            print_status "All services started successfully!"
            print_status "Access your application at: http://localhost"
        fi
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi