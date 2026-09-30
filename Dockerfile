# Stage 1 Dockerfile - Decision Memory AI & Dark Factory
# Contributors: Google AI Studio, BAND

FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Build production assets
RUN npm run build

# Runtime container
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Install tsx globally or as local runner for server.ts
RUN npm install -g tsx

EXPOSE 3000

CMD ["tsx", "server.ts"]
