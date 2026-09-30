# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for optimal caching
COPY package.json package-lock.json* ./

# Clean install dependencies
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build client production bundle
RUN npm run build

# Runtime image (minimal footprint)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node dependencies and build artifacts from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Health check endpoint probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

# Start server using local dependencies (no external network required)
CMD ["npx", "tsx", "server.ts"]
