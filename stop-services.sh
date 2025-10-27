#!/bin/bash

# SavannaSync - Manual Service Stop Script
# This script stops the Java backend and NGINX services manually

echo "==================================="
echo "SavannaSync Service Stop Script"
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

# Stop Java Backend Service
stop_backend() {
    print_status "Stopping Java backend service..."
    
    if sudo systemctl stop syncsenta-backend; then
        print_status "Java backend service stopped successfully"
    else
        print_status "Failed to stop Java backend service"
        return 1
    fi
}

# Stop NGINX Service (optional - NGINX might be used by other applications)
stop_nginx() {
    print_status "Do you want to stop NGINX? (y/n): "
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Stopping NGINX service..."
        
        if sudo systemctl stop nginx; then
            print_status "NGINX stopped successfully"
        else
            print_status "Failed to stop NGINX"
            return 1
        fi
    else
        print_status "NGINX left running (it may serve other applications)"
    fi
}

# Show current status
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
    print_status "=== Service Management Commands ==="
    echo "Start services: ./start-services.sh"
    echo "Stop services: ./stop-services.sh"
    echo "Check backend status: sudo systemctl status syncsenta-backend"
    echo "Check NGINX status: sudo systemctl status nginx"
}

# Main execution
main() {
    check_sudo
    
    # Stop services
    stop_backend
    stop_nginx
    show_status
    
    print_status "Service stop script completed!"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi