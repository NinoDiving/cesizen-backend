# Base image
FROM node:20-alpine AS base

RUN npm install -g pnpm

# Installation des dépendances pour la compilation de modules natifs (bcrypt)
RUN apk add --no-cache python3 make g++

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# On autorise la compilation des modules natifs
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate
RUN pnpm run build

FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma/

RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
