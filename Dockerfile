# --- Stage 1: Build Phase ---
FROM node:22-alpine AS builder

WORKDIR /app

# Enable npm lockfile caching
COPY package*.json ./
RUN npm ci

# Copy full repository
COPY . .

# Build Vite client assets & server bundle (ESBuild to dist/server.cjs)
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Runtime Execution (Production) ---
FROM node:22-alpine AS runner

WORKDIR /app

# Set security contexts to reduce attack surface
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built deliverables
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Install ONLY production dependencies (reduces container size)
RUN npm ci --only=production

# Expose port 3000 (standard ingress routing for AI Studio, Cloud Run, and Nginx)
EXPOSE 3000

USER nodejs

# Exec start container
CMD ["npm", "run", "start"]
