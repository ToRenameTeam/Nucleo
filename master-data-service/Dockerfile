FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

# Copia i file di configurazione del workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY master-data-service/package.json ./master-data-service/

# Installa tutte le dipendenze (compreso tsx dalla root)
RUN pnpm install --frozen-lockfile

# Copia il codice sorgente
COPY master-data-service/tsconfig.json ./master-data-service/
COPY master-data-service/src ./master-data-service/src

WORKDIR /app/master-data-service

EXPOSE 3040

CMD ["pnpm", "start"]
