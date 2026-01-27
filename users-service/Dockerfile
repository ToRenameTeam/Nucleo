FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

# Copia i file di configurazione del workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY users-service/package.json ./users-service/

# Installa tutte le dipendenze (compreso tsx dalla root)
RUN pnpm install --frozen-lockfile

# Copia il codice sorgente
COPY users-service/tsconfig.json ./users-service/
COPY users-service/src ./users-service/src

WORKDIR /app/users-service

EXPOSE 3030

CMD ["pnpm", "start"]