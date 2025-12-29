#!/data/data/com.termux/files/usr/bin/bash
#
# Sim Studio - Termux Installer
#
# One-liner install:
# curl -fsSL https://raw.githubusercontent.com/levidehaan/sim-moddex/main/scripts/termux/install.sh | bash
#
# Or with wget:
# wget -qO- https://raw.githubusercontent.com/levidehaan/sim-moddex/main/scripts/termux/install.sh | bash
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
SIM_DIR="$HOME/sim-studio"
SIM_REPO="https://github.com/levidehaan/sim-moddex.git"
SIM_BRANCH="main"
DB_NAME="sim"
DB_USER="sim"
DB_PASS=$(openssl rand -hex 16 2>/dev/null || echo "sim_secure_password_$(date +%s)")
PORT=3000

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo '  ____  _             ____  _             _ _       '
    echo ' / ___|(_)_ __ ___   / ___|| |_ _   _  __| (_) ___  '
    echo ' \___ \| | '\''_ ` _ \  \___ \| __| | | |/ _` | |/ _ \ '
    echo '  ___) | | | | | | |  ___) | |_| |_| | (_| | | (_) |'
    echo ' |____/|_|_| |_| |_| |____/ \__|\__,_|\__,_|_|\___/ '
    echo -e "${NC}"
    echo -e "${CYAN}Android/Termux Installer${NC}"
    echo ""
}

# Print step
print_step() {
    echo -e "${BLUE}==>${NC} ${BOLD}$1${NC}"
}

# Print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running in Termux
check_termux() {
    if [ -z "$TERMUX_VERSION" ] && [ ! -d "/data/data/com.termux" ]; then
        print_error "This script must be run in Termux on Android"
        echo "Please install Termux from F-Droid: https://f-droid.org/packages/com.termux/"
        exit 1
    fi
    print_success "Running in Termux environment"
}

# Update packages
update_packages() {
    print_step "Updating package repository..."
    pkg update -y
    pkg upgrade -y
    print_success "Packages updated"
}

# Install required packages
install_packages() {
    print_step "Installing required packages..."

    # Core packages
    pkg install -y \
        git \
        nodejs \
        postgresql \
        openssl \
        curl \
        wget \
        jq \
        termux-api \
        termux-tools \
        which \
        procps

    print_success "Core packages installed"

    # Install pnpm/bun for faster package management
    print_step "Installing bun..."
    if ! command -v bun &> /dev/null; then
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        # Add to profile
        echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
        echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
    fi
    print_success "Bun installed"
}

# Setup PostgreSQL
setup_postgresql() {
    print_step "Setting up PostgreSQL..."

    # Initialize PostgreSQL if not already done
    if [ ! -d "$PREFIX/var/lib/postgresql" ]; then
        mkdir -p "$PREFIX/var/lib/postgresql"
        initdb -D "$PREFIX/var/lib/postgresql"
    fi

    # Start PostgreSQL
    pg_ctl -D "$PREFIX/var/lib/postgresql" -l "$PREFIX/var/lib/postgresql/logfile" start 2>/dev/null || true
    sleep 2

    # Create database and user
    createdb $DB_NAME 2>/dev/null || print_warning "Database '$DB_NAME' already exists"

    psql -d $DB_NAME -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || \
        print_warning "User '$DB_USER' already exists"

    psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
    psql -d $DB_NAME -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null || true

    # Install pgvector extension if available
    psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || \
        print_warning "pgvector extension not available (optional)"

    print_success "PostgreSQL configured"
}

# Clone repository
clone_repo() {
    print_step "Cloning Sim Studio repository..."

    if [ -d "$SIM_DIR" ]; then
        print_warning "Directory $SIM_DIR already exists"
        read -p "Do you want to update it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$SIM_DIR"
            git fetch origin
            git reset --hard origin/$SIM_BRANCH
            print_success "Repository updated"
        fi
    else
        git clone --depth 1 -b $SIM_BRANCH $SIM_REPO "$SIM_DIR"
        print_success "Repository cloned"
    fi
}

# Create environment file
create_env_file() {
    print_step "Creating environment configuration..."

    # Generate secrets
    AUTH_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    API_SECRET=$(openssl rand -hex 32)

    # Get device IP
    DEVICE_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}' || echo "localhost")

    cat > "$SIM_DIR/apps/sim/.env.local" << EOF
# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME

# Authentication
BETTER_AUTH_SECRET=$AUTH_SECRET
BETTER_AUTH_URL=http://$DEVICE_IP:$PORT
NEXT_PUBLIC_APP_URL=http://$DEVICE_IP:$PORT

# Encryption
ENCRYPTION_KEY=$ENCRYPTION_KEY
INTERNAL_API_SECRET=$API_SECRET
API_ENCRYPTION_KEY=$ENCRYPTION_KEY

# Server
PORT=$PORT
NODE_ENV=production

# Termux/Android specific
TERMUX_VERSION=$TERMUX_VERSION
IS_ANDROID=true
EOF

    print_success "Environment file created"
}

# Install dependencies
install_dependencies() {
    print_step "Installing project dependencies..."
    cd "$SIM_DIR"

    # Use bun if available, otherwise npm
    if command -v bun &> /dev/null; then
        bun install
    else
        npm install
    fi

    print_success "Dependencies installed"
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."
    cd "$SIM_DIR"

    if command -v bun &> /dev/null; then
        bun run db:push 2>/dev/null || bun run --filter @sim/db push
    else
        npm run db:push 2>/dev/null || npm run --workspace packages/db push
    fi

    print_success "Database migrations complete"
}

# Create control script
create_control_script() {
    print_step "Creating control script..."

    cat > "$SIM_DIR/sim-control.sh" << 'CONTROL_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

# Sim Studio Control Menu
SIM_DIR="$HOME/sim-studio"
PID_FILE="$SIM_DIR/.sim.pid"
LOG_FILE="$SIM_DIR/sim.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Get device IP
get_ip() {
    ip route get 1 2>/dev/null | awk '{print $7; exit}' || echo "localhost"
}

# Check if server is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Start server
start_server() {
    if is_running; then
        echo -e "${YELLOW}Server is already running${NC}"
        return
    fi

    echo -e "${BLUE}Starting Sim Studio...${NC}"

    # Start PostgreSQL if not running
    pg_ctl -D "$PREFIX/var/lib/postgresql" status > /dev/null 2>&1 || \
        pg_ctl -D "$PREFIX/var/lib/postgresql" -l "$PREFIX/var/lib/postgresql/logfile" start

    cd "$SIM_DIR"

    # Start the server
    if command -v bun &> /dev/null; then
        nohup bun run --filter sim start > "$LOG_FILE" 2>&1 &
    else
        nohup npm run --workspace apps/sim start > "$LOG_FILE" 2>&1 &
    fi

    echo $! > "$PID_FILE"
    sleep 3

    if is_running; then
        IP=$(get_ip)
        PORT=$(grep PORT "$SIM_DIR/apps/sim/.env.local" | cut -d= -f2 || echo "3000")
        echo -e "${GREEN}✓ Server started successfully!${NC}"
        echo ""
        echo -e "${BOLD}Access Sim Studio at:${NC}"
        echo -e "${CYAN}  http://$IP:$PORT${NC}"
        echo ""
        echo -e "Or open in browser:"
        termux-open-url "http://$IP:$PORT" 2>/dev/null || \
            echo -e "${YELLOW}Run: termux-open-url http://$IP:$PORT${NC}"
    else
        echo -e "${RED}Failed to start server. Check logs: tail -f $LOG_FILE${NC}"
    fi
}

# Stop server
stop_server() {
    if ! is_running; then
        echo -e "${YELLOW}Server is not running${NC}"
        return
    fi

    echo -e "${BLUE}Stopping Sim Studio...${NC}"
    PID=$(cat "$PID_FILE")
    kill $PID 2>/dev/null
    rm -f "$PID_FILE"
    echo -e "${GREEN}✓ Server stopped${NC}"
}

# Restart server
restart_server() {
    stop_server
    sleep 2
    start_server
}

# Show status
show_status() {
    echo ""
    if is_running; then
        PID=$(cat "$PID_FILE")
        IP=$(get_ip)
        PORT=$(grep PORT "$SIM_DIR/apps/sim/.env.local" 2>/dev/null | cut -d= -f2 || echo "3000")
        echo -e "${GREEN}● Sim Studio is running${NC} (PID: $PID)"
        echo -e "  URL: ${CYAN}http://$IP:$PORT${NC}"
    else
        echo -e "${RED}● Sim Studio is not running${NC}"
    fi

    # PostgreSQL status
    if pg_ctl -D "$PREFIX/var/lib/postgresql" status > /dev/null 2>&1; then
        echo -e "${GREEN}● PostgreSQL is running${NC}"
    else
        echo -e "${RED}● PostgreSQL is not running${NC}"
    fi
    echo ""
}

# Show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        echo -e "${YELLOW}No log file found${NC}"
    fi
}

# Open in browser
open_browser() {
    IP=$(get_ip)
    PORT=$(grep PORT "$SIM_DIR/apps/sim/.env.local" 2>/dev/null | cut -d= -f2 || echo "3000")
    URL="http://$IP:$PORT"

    echo -e "${BLUE}Opening $URL in browser...${NC}"
    termux-open-url "$URL" 2>/dev/null || \
        echo -e "${YELLOW}Could not open browser. Visit: $URL${NC}"
}

# Print menu
print_menu() {
    clear
    echo -e "${PURPLE}"
    echo '  ____  _             ____  _             _ _       '
    echo ' / ___|(_)_ __ ___   / ___|| |_ _   _  __| (_) ___  '
    echo ' \___ \| | '\''_ ` _ \  \___ \| __| | | |/ _` | |/ _ \ '
    echo '  ___) | | | | | | |  ___) | |_| |_| | (_| | | (_) |'
    echo ' |____/|_|_| |_| |_| |____/ \__|\__,_|\__,_|_|\___/ '
    echo -e "${NC}"
    echo -e "${CYAN}Termux Control Panel${NC}"

    show_status

    echo -e "${BOLD}Commands:${NC}"
    echo -e "  ${GREEN}1)${NC} Start server"
    echo -e "  ${RED}2)${NC} Stop server"
    echo -e "  ${YELLOW}3)${NC} Restart server"
    echo -e "  ${BLUE}4)${NC} View logs"
    echo -e "  ${CYAN}5)${NC} Open in browser"
    echo -e "  ${PURPLE}6)${NC} Show connection info"
    echo -e "  ${NC}7)${NC} Update Sim Studio"
    echo -e "  ${NC}q)${NC} Quit"
    echo ""
}

# Update application
update_app() {
    echo -e "${BLUE}Updating Sim Studio...${NC}"

    # Stop server if running
    if is_running; then
        stop_server
    fi

    cd "$SIM_DIR"
    git fetch origin
    git reset --hard origin/main

    if command -v bun &> /dev/null; then
        bun install
    else
        npm install
    fi

    echo -e "${GREEN}✓ Update complete!${NC}"
    echo "Press Enter to continue..."
    read
}

# Show connection info
show_connection_info() {
    IP=$(get_ip)
    PORT=$(grep PORT "$SIM_DIR/apps/sim/.env.local" 2>/dev/null | cut -d= -f2 || echo "3000")

    echo ""
    echo -e "${BOLD}Connection Information${NC}"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${CYAN}Local URL:${NC}"
    echo -e "  http://localhost:$PORT"
    echo ""
    echo -e "${CYAN}Network URL:${NC}"
    echo -e "  http://$IP:$PORT"
    echo ""
    echo -e "${CYAN}QR Code (scan with another device):${NC}"

    # Generate QR code if qrencode is available
    if command -v qrencode &> /dev/null; then
        echo ""
        qrencode -t ANSI "http://$IP:$PORT"
    else
        echo -e "  ${YELLOW}Install qrencode for QR: pkg install qrencode${NC}"
    fi

    echo ""
    echo "Press Enter to continue..."
    read
}

# Main menu loop
main() {
    while true; do
        print_menu
        read -p "Select option: " choice

        case $choice in
            1) start_server; sleep 2 ;;
            2) stop_server; sleep 2 ;;
            3) restart_server; sleep 2 ;;
            4) show_logs ;;
            5) open_browser; sleep 2 ;;
            6) show_connection_info ;;
            7) update_app ;;
            q|Q)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                sleep 1
                ;;
        esac
    done
}

# Handle command line arguments
case "${1:-}" in
    start) start_server ;;
    stop) stop_server ;;
    restart) restart_server ;;
    status) show_status ;;
    logs) show_logs ;;
    open) open_browser ;;
    *) main ;;
esac
CONTROL_SCRIPT

    chmod +x "$SIM_DIR/sim-control.sh"

    # Create symlink in bin
    ln -sf "$SIM_DIR/sim-control.sh" "$PREFIX/bin/sim" 2>/dev/null || true

    print_success "Control script created"
}

# Setup Termux:API permissions
setup_termux_api() {
    print_step "Setting up Termux:API..."

    # Request storage permission
    termux-setup-storage 2>/dev/null || print_warning "Storage permission may need manual setup"

    # Test API access
    termux-battery-status > /dev/null 2>&1 && \
        print_success "Termux:API is working" || \
        print_warning "Termux:API may need permissions. Check Termux:API app settings."
}

# Create boot script
create_boot_script() {
    print_step "Creating boot script..."

    mkdir -p "$HOME/.termux/boot"

    cat > "$HOME/.termux/boot/start-sim.sh" << 'BOOT_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

# Wait for Termux to fully initialize
sleep 5

# Start PostgreSQL
pg_ctl -D "$PREFIX/var/lib/postgresql" -l "$PREFIX/var/lib/postgresql/logfile" start

# Start Sim Studio
cd "$HOME/sim-studio"
./sim-control.sh start
BOOT_SCRIPT

    chmod +x "$HOME/.termux/boot/start-sim.sh"

    print_success "Boot script created (requires Termux:Boot app)"
}

# Print completion message
print_completion() {
    IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}' || echo "localhost")

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Installation Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BOLD}Quick Start:${NC}"
    echo -e "  ${CYAN}sim${NC}              - Open control menu"
    echo -e "  ${CYAN}sim start${NC}        - Start server"
    echo -e "  ${CYAN}sim stop${NC}         - Stop server"
    echo -e "  ${CYAN}sim logs${NC}         - View logs"
    echo -e "  ${CYAN}sim open${NC}         - Open in browser"
    echo ""
    echo -e "${BOLD}Access URL:${NC}"
    echo -e "  ${CYAN}http://$IP:$PORT${NC}"
    echo ""
    echo -e "${YELLOW}Note:${NC} Make sure Termux:API app is installed from F-Droid"
    echo -e "      for Android sensor and device integration."
    echo ""
    echo -e "${BOLD}Start now? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        "$SIM_DIR/sim-control.sh" start
    else
        echo -e "Run ${CYAN}sim${NC} to open the control menu later."
    fi
}

# Main installation flow
main() {
    print_banner

    echo -e "${BOLD}This will install Sim Studio and all dependencies.${NC}"
    echo -e "Installation directory: ${CYAN}$SIM_DIR${NC}"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi

    echo ""

    check_termux
    update_packages
    install_packages
    setup_postgresql
    clone_repo
    create_env_file
    install_dependencies
    run_migrations
    create_control_script
    setup_termux_api
    create_boot_script

    print_completion
}

# Run main
main "$@"
