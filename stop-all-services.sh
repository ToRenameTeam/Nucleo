#!/usr/bin/env bash
# Script to stop all Nucleo services

# Output colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Nucleo - Stopping all services${NC}"
echo -e "${RED}=======================================${NC}"
echo ""

# Service definitions
services=(
    "appointments-service"
    "users-service"
    "master-data-service"
    "frontend-service"
    "documents-service"
)

failed_services=()

for service_name in "${services[@]}"; do
    echo -e "${YELLOW}🔧 Stopping ${service_name}...${NC}"

    docker_compose_path="${service_name}/docker-compose.yml"
    
    if [ -f "$docker_compose_path" ]; then
        pushd "$service_name" > /dev/null || exit
        
        echo -e "  ${GRAY}→ docker-compose down${NC}"
        if docker-compose down; then
            echo -e "  ${GREEN}✓ ${service_name} stopped successfully!${NC}"
        else
            echo -e "  ${RED}✗ Error stopping ${service_name}${NC}"
            failed_services+=("$service_name")
        fi
        
        popd > /dev/null || exit
    else
        echo -e "  ${YELLOW}⚠️  docker-compose.yml file not found in ${service_name}${NC}"
    fi
    
    echo ""
done

# Final summary
echo -e "${RED}=====================================${NC}"
echo -e "${RED}📊 SERVICES STOP SUMMARY${NC}"
echo -e "${RED}=====================================${NC}"
echo ""

if [ ${#failed_services[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All services have been stopped successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services encountered problems during shutdown:${NC}"
    for failed in "${failed_services[@]}"; do
        echo -e "  ${RED}✗ ${failed}${NC}"
    done
fi

echo ""
echo -e "${CYAN}💡 To restart the services, use: ./start-all-services.sh${NC}"
