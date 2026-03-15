#!/usr/bin/env bash
# ------------------------------------------------------------------
# Nucleo – Codespace / Devcontainer post-create bootstrap
# Runs ONCE when the container is first created or rebuilt.
# ------------------------------------------------------------------
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
GRAY='\033[0;90m'
NC='\033[0m'

echo -e "${CYAN}🔧  Setting up Nucleo development environment…${NC}"
echo ""

# ── 1. pnpm via corepack ─────────────────────────────────────────
echo -e "${YELLOW}📦  Enabling corepack & activating pnpm 10.28.1…${NC}"
corepack enable
corepack prepare pnpm@10.28.1 --activate
echo -e "${GREEN}   ✓ pnpm $(pnpm --version)${NC}"

# ── 2. uv (Python package manager used by ai-service) ────────────
echo -e "${YELLOW}🐍  Installing uv…${NC}"
curl -LsSf https://astral.sh/uv/install.sh | sh
# Make uv available in this script and future shells
export PATH="$HOME/.local/bin:$PATH"
# Persist for login shells (the installer adds to ~/.bashrc already,
# but also add it for zsh which is the default in devcontainers).
grep -qxF 'export PATH="$HOME/.local/bin:$PATH"' ~/.zshrc 2>/dev/null \
  || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
echo -e "${GREEN}   ✓ uv $(uv --version)${NC}"

# ── 3. docker-compose compatibility shim ──────────────────────────
# The start/stop scripts use the hyphenated `docker-compose` command.
# Docker Compose v2 is installed as a CLI plugin (`docker compose`).
# Create a wrapper so both forms work.
if ! command -v docker-compose &>/dev/null; then
  echo -e "${YELLOW}🐳  Creating docker-compose compatibility wrapper…${NC}"
  sudo tee /usr/local/bin/docker-compose > /dev/null << 'WRAPPER'
#!/bin/sh
exec docker compose "$@"
WRAPPER
  sudo chmod +x /usr/local/bin/docker-compose
  echo -e "${GREEN}   ✓ docker-compose → docker compose${NC}"
fi

# ── 4. Gradle wrapper ────────────────────────────────────────────
echo -e "${YELLOW}☕  Making Gradle wrapper executable…${NC}"
chmod +x gradlew
echo -e "${GREEN}   ✓ gradlew${NC}"

# ── 5. Node.js workspace dependencies ────────────────────────────
echo -e "${YELLOW}📦  Installing Node.js workspace dependencies (pnpm)…${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo -e "${GREEN}   ✓ node_modules${NC}"

# ── 6. Pre-download Gradle wrapper & base dependencies ───────────
echo -e "${YELLOW}☕  Pre-downloading Gradle distribution & dependencies…${NC}"
./gradlew --no-daemon help > /dev/null 2>&1 || true
echo -e "${GREEN}   ✓ Gradle $(./gradlew --version 2>/dev/null | grep -oP 'Gradle \K[\d.]+' || echo 'ready')${NC}"

# ── 7. Make start/stop scripts executable ────────────────────────
chmod +x start-all-services.sh stop-all-services.sh 2>/dev/null || true

# ── Summary ──────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅  Nucleo development environment is ready!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GRAY}  Runtimes installed:${NC}"
echo -e "${GRAY}    • Java       $(java -version 2>&1 | head -1)${NC}"
echo -e "${GRAY}    • Node.js    $(node --version)${NC}"
echo -e "${GRAY}    • Python     $(python3 --version)${NC}"
echo -e "${GRAY}    • pnpm       $(pnpm --version)${NC}"
echo -e "${GRAY}    • uv         $(uv --version)${NC}"
echo -e "${GRAY}    • Docker     $(docker --version)${NC}"
echo -e "${GRAY}    • Compose    $(docker compose version)${NC}"
echo ""
echo -e "${CYAN}  Quick start:${NC}"
echo -e "${GRAY}    ./start-all-services.sh   → Start all services${NC}"
echo -e "${GRAY}    ./stop-all-services.sh    → Stop all services${NC}"
echo ""
