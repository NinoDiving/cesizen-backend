# Base image
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

RUN apk add --no-cache python3 make g++

FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS development
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
CMD ["pnpm", "run", "start:dev"]

FROM dependencies AS build
COPY . .
RUN npx prisma generate
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY prisma ./prisma/
RUN npx prisma generate
EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]
