FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY master-data-service/package.json ./master-data-service/

RUN pnpm install --frozen-lockfile

COPY master-data-service/tsconfig.json ./master-data-service/
COPY master-data-service/src ./master-data-service/src

WORKDIR /app/master-data-service

EXPOSE 3040

CMD ["pnpm", "start"]
