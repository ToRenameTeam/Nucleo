FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY frontend-service/package.json ./frontend-service/
COPY frontend-service ./frontend-service

RUN pnpm install --frozen-lockfile --filter ./frontend-service...

WORKDIR /app/frontend-service

RUN pnpm build

EXPOSE 4173

CMD ["pnpm", "preview", "--host", "0.0.0.0"]