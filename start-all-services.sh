#!/usr/bin/env bash
# Script per avviare tutti i servizi Nucleo
# Crea i file .env dai template .env.example e avvia tutti i docker-compose

# Colori per output
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
WHITE='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Nucleo - Avvio di tutti i servizi${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Definizione dei servizi
declare -a service_names=("appointments-service" "users-service" "master-data-service" "frontend-service" "documents-service")
declare -a service_paths=("appointments-service" "users-service" "master-data-service" "frontend-service" "documents-service")

# Funzione per gestire i file .env interattivamente
setup_env_file() {
    local service_path=$1
    local service_name=$2
    local env_content=$3
    
    local env_example_path="${service_path}/.env.example"
    local env_path="${service_path}/.env"
    
    echo -e "${CYAN}📦 Configurazione ${service_name}${NC}"
    
    if [ -f "$env_example_path" ]; then
        if [ -f "$env_path" ]; then
            echo -e "  ${GREEN}✓ File .env già esistente${NC}"
        else
            echo -e "  ${YELLOW}📝 File .env non trovato. Lo creo...${NC}"
            echo "$env_content" > "$env_path"

        fi
    else
        echo -e "  ${GRAY}ℹ️  Nessun .env.example trovato (non necessario)${NC}"
    fi
    
    echo ""
}

# Step 1: Setup file .env
echo -e "${MAGENTA}📋 Step 1: Configurazione file .env${NC}"
echo -e "${MAGENTA}=====================================${NC}"
echo ""
echo -e "${YELLOW}Configureremo i file .env uno per uno.${NC}"
echo -e "${YELLOW}Per ogni servizio, potrai modificare manualmente la configurazione.${NC}"
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
MONGODB_PORT=27017
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
"
setup_env_file "frontend-service" "frontend-service" "
VITE_APPOINTMENTS_API_URL=http://localhost:8080
VITE_MASTER_DATA_API_URL=http://localhost:3040
VITE_USERS_API_URL=http://localhost:3030
VITE_DELEGATIONS_API_URL=http://localhost:3030
"

# setup_env_file "documents-service" "documents-service" """

echo -e "${GREEN}✅ Configurazione .env completata per tutti i servizi${NC}"
echo ""
echo -e "${YELLOW}Premi INVIO per procedere con l'avvio dei servizi, o CTRL+C per annullare...${NC}"
read -r

# Step 2: Avvio servizi Docker
echo ""
echo -e "${MAGENTA}🐳 Step 2: Avvio Docker Compose per tutti i servizi${NC}"
echo -e "${MAGENTA}====================================================${NC}"
echo ""

failed_services=()

for i in "${!service_names[@]}"; do
    service_name="${service_names[$i]}"
    service_path="${service_paths[$i]}"
    
    echo -e "${CYAN}🔧 Avvio ${service_name}...${NC}"
    
    docker_compose_path="${service_path}/docker-compose.yml"
    
    if [ -f "$docker_compose_path" ]; then
        pushd "$service_path" > /dev/null || exit
        
        echo -e "  ${GRAY}→ docker-compose up -d${NC}"
        if docker-compose up -d; then
            echo -e "  ${GREEN}✓ ${service_name} avviato con successo!${NC}"
        else
            echo -e "  ${RED}✗ Errore nell'avvio di ${service_name}${NC}"
            failed_services+=("$service_name")
        fi
        
        popd > /dev/null || exit
    else
        echo -e "  ${RED}✗ File docker-compose.yml non trovato in ${service_path}${NC}"
        failed_services+=("$service_name")
    fi
    
    echo ""
done

# Riepilogo finale
echo -e "${CYAN}=====================================${NC}"
echo -e "${CYAN}📊 RIEPILOGO AVVIO SERVIZI${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

if [ ${#failed_services[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Tutti i servizi sono stati avviati correttamente!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Servizi disponibili su:${NC}"
    echo -e "${WHITE}  • Frontend Service:        http://localhost:80${NC}"
    echo -e "${WHITE}  • Users Service:           http://localhost:3030${NC}"
    echo -e "${WHITE}  • Master Data Service:     http://localhost:3040${NC}"
    echo -e "${WHITE}  • Appointments Service:    http://localhost:8080${NC}"
else
    echo -e "${YELLOW}⚠️  Alcuni servizi hanno avuto problemi durante l'avvio:${NC}"
    for failed in "${failed_services[@]}"; do
        echo -e "  ${RED}✗ ${failed}${NC}"
    done
    echo ""
    echo -e "${YELLOW}Controlla i log con: docker-compose logs -f${NC}"
fi

echo ""
echo -e "${CYAN}📝 Comandi utili:${NC}"
echo -e "${GRAY}  • Visualizza log:           docker-compose logs -f${NC}"
echo -e "${GRAY}  • Ferma tutti i servizi:    docker-compose down (in ogni cartella servizio)${NC}"
echo -e "${GRAY}  • Controlla stato:          docker-compose ps${NC}"
echo ""
echo -e "${YELLOW}🛑 Per fermare tutti i servizi, usa lo script: ./stop-all-services.sh${NC}"
