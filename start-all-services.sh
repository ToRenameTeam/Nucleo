#!/usr/bin/env bash
# Script to start all Nucleo services
# Creates .env files from .env.example templates and starts all docker-compose

# Output colors
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
WHITE='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Nucleo - Starting all services${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Service definitions
declare -a service_names=("appointments-service" "users-service" "master-data-service" "frontend-service" "documents-service")
declare -a service_paths=("appointments-service" "users-service" "master-data-service" "frontend-service" "documents-service")

# Function to handle .env files interactively
setup_env_file() {
    local service_path=$1
    local service_name=$2
    local env_content=$3
    
    local env_example_path="${service_path}/.env.example"
    local env_path="${service_path}/.env"
    
    echo -e "${CYAN}📦 Configuring ${service_name}${NC}"

    if [ -f "$env_example_path" ]; then
        if [ -f "$env_path" ]; then
            echo -e "  ${GREEN}✓ .env file already exists${NC}"
        else
            echo -e "  ${YELLOW}📝 .env file not found. Creating it...${NC}"
            echo "$env_content" > "$env_path"

        fi
    else
        echo -e "  ${GRAY}ℹ️  No .env.example found (not required)${NC}"
    fi
    
    echo ""
}

# Step 1: Setup .env files
echo -e "${MAGENTA}📋 Step 1: Configuring .env files${NC}"
echo -e "${MAGENTA}=====================================${NC}"
echo ""
echo -e "${YELLOW}We will configure .env files one by one.${NC}"
echo -e "${YELLOW}For each service, you can manually modify the configuration.${NC}"
echo ""

setup_env_file "users-service" "users-service" "
PORT=3030
MONGO_URI=mongodb://admin:password123@mongodb:27017/users_db?authSource=admin
MONGODB_PORT=27017

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
"
setup_env_file "appointments-service" "appointments-service" "
# Database Configuration
POSTGRES_DB=appointments
POSTGRES_USER=appointments_user
POSTGRES_PASSWORD=appointments_pass
POSTGRES_PORT=5432

# Application Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=appointments
DB_USER=appointments_user
DB_PASSWORD=appointments_pass
DATABASE_URL=jdbc:postgresql://postgres:5432/appointments
DATABASE_USER=appointments_user
DATABASE_PASSWORD=appointments_pass

# Application Port
APP_PORT=8080
"
setup_env_file "master-data-service" "master-data-service" "
PORT=3040
MONGO_URI=mongodb://admin:password@mongodb:27017/master_data_db?authSource=admin
MONGODB_PORT=27027
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
"
setup_env_file "frontend-service" "frontend-service" "
VITE_APPOINTMENTS_API_URL=http://localhost:8080
VITE_DOCUMENTS_API_URL=http://localhost:8090
VITE_MASTER_DATA_API_URL=http://localhost:3040
VITE_USERS_API_URL=http://localhost:3030
VITE_DELEGATIONS_API_URL=http://localhost:3030
"

setup_env_file "documents-service" "documents-service" "GROQ_API_KEY="

echo -e "${GREEN}✅ .env configuration completed for all services${NC}"
echo ""
echo -e "${YELLOW}Press ENTER to proceed with starting services, or CTRL+C to cancel...${NC}"
read -r

# Step 2: Start Docker services
echo ""
echo -e "${MAGENTA}🐳 Step 2: Starting Docker Compose for all services${NC}"
echo -e "${MAGENTA}====================================================${NC}"
echo ""

failed_services=()

for i in "${!service_names[@]}"; do
    service_name="${service_names[$i]}"
    service_path="${service_paths[$i]}"
    
    echo -e "${CYAN}🔧 Starting ${service_name}...${NC}"

    docker_compose_path="${service_path}/docker-compose.yml"
    
    if [ -f "$docker_compose_path" ]; then
        pushd "$service_path" > /dev/null || exit
        
        echo -e "  ${GRAY}→ docker-compose up -d${NC}"
        if docker-compose up -d; then
            echo -e "  ${GREEN}✓ ${service_name} started successfully!${NC}"
        else
            echo -e "  ${RED}✗ Error starting ${service_name}${NC}"
            failed_services+=("$service_name")
        fi
        
        popd > /dev/null || exit
    else
        echo -e "  ${RED}✗ docker-compose.yml file not found in ${service_path}${NC}"
        failed_services+=("$service_name")
    fi
    
    echo ""
done

# Final summary
echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}📊 SERVICES STARTUP SUMMARY${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

if [ ${#failed_services[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All services started successfully!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Services available at:${NC}"
    echo -e "${WHITE}  • Frontend Service:        http://localhost:3000${NC}"
    echo -e "${WHITE}  • Users Service:           http://localhost:3030${NC}"
    echo -e "${WHITE}  • Master Data Service:     http://localhost:3040${NC}"
    echo -e "${WHITE}  • Appointments Service:    http://localhost:8080${NC}"
    echo -e "${WHITE}  • Documents Service:       http://localhost:8090${NC}"
else
    echo -e "${YELLOW}⚠️  Some services encountered problems during startup:${NC}"
    for failed in "${failed_services[@]}"; do
        echo -e "  ${RED}✗ ${failed}${NC}"
    done
    echo ""
    echo -e "${YELLOW}Check logs with: docker-compose logs -f${NC}"
fi

echo ""
echo -e "${CYAN}📝 Useful commands:${NC}"
echo -e "${GRAY}  • View logs:                docker-compose logs -f${NC}"
echo -e "${GRAY}  • Stop all services:        docker-compose down (in each service folder)${NC}"
echo -e "${GRAY}  • Check status:             docker-compose ps${NC}"
echo ""
echo -e "${YELLOW}🛑 To stop all services, use the script: ./stop-all-services.sh${NC}"
