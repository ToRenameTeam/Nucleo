#!/usr/bin/env bash
# Script per fermare tutti i servizi Nucleo

# Colori per output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Nucleo - Arresto di tutti i servizi${NC}"
echo -e "${RED}=======================================${NC}"
echo ""

# Definizione dei servizi
services=(
    "appointments-service"
    "users-service"
    "master-data-service"
    "frontend-service"
    "documents-service"
)

failed_services=()

for service_name in "${services[@]}"; do
    echo -e "${YELLOW}🔧 Arresto ${service_name}...${NC}"
    
    docker_compose_path="${service_name}/docker-compose.yml"
    
    if [ -f "$docker_compose_path" ]; then
        pushd "$service_name" > /dev/null || exit
        
        echo -e "  ${GRAY}→ docker-compose down${NC}"
        if docker-compose down; then
            echo -e "  ${GREEN}✓ ${service_name} fermato con successo!${NC}"
        else
            echo -e "  ${RED}✗ Errore nell'arresto di ${service_name}${NC}"
            failed_services+=("$service_name")
        fi
        
        popd > /dev/null || exit
    else
        echo -e "  ${YELLOW}⚠️  File docker-compose.yml non trovato in ${service_name}${NC}"
    fi
    
    echo ""
done

# Riepilogo finale
echo -e "${RED}=====================================${NC}"
echo -e "${RED}📊 RIEPILOGO ARRESTO SERVIZI${NC}"
echo -e "${RED}=====================================${NC}"
echo ""

if [ ${#failed_services[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Tutti i servizi sono stati fermati correttamente!${NC}"
else
    echo -e "${YELLOW}⚠️  Alcuni servizi hanno avuto problemi durante l'arresto:${NC}"
    for failed in "${failed_services[@]}"; do
        echo -e "  ${RED}✗ ${failed}${NC}"
    done
fi

echo ""
echo -e "${CYAN}💡 Per riavviare i servizi, usa: ./start-all-services.sh${NC}"
