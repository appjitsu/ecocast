# Base image for building the application
FROM node:18 AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install all dependencies for build
RUN pnpm install

# Copy only necessary source code for the API
COPY apps/api/ ./apps/api/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/typescript-config/ ./packages/typescript-config/

# Build the API
RUN pnpm exec turbo run build --filter=@repo/api

# Stage 2: Production image
FROM node:18-slim

WORKDIR /usr/src/app

# Install pnpm as root
RUN npm install -g pnpm@latest

# Copy package configuration
COPY --from=builder --chown=root:root /usr/src/app/package.json ./
COPY --from=builder --chown=root:root /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder --chown=root:root /usr/src/app/pnpm-workspace.yaml ./
COPY --from=builder --chown=root:root /usr/src/app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=root:root /usr/src/app/packages/types/package.json ./packages/types/
COPY --from=builder --chown=root:root /usr/src/app/packages/utils/package.json ./packages/utils/

# Install jq and remove prepare script safely
RUN apt-get update && apt-get install -y --no-install-recommends jq \
    && jq 'del(.scripts.prepare)' package.json > temp.json && mv temp.json package.json \
    && jq 'del(.scripts.prepare)' apps/api/package.json > temp.json && mv temp.json apps/api/package.json || true \
    && apt-get purge -y --auto-remove jq \
    && rm -rf /var/lib/apt/lists/*

# Install production dependencies and rebuild native modules (as root)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && pnpm install --prod --filter=@repo/api... \
    && pnpm rebuild \
    && pnpm prune --prod \
    && apt-get purge -y --auto-remove python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security (after apt-get operations)
RUN chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Set NODE_ENV
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder --chown=node:node /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /usr/src/app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=node:node /usr/src/app/packages/utils/dist ./packages/utils/dist

# Expose port
EXPOSE 3000

# Healthcheck (adjust endpoint to your API's health route)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Run the application
CMD ["node", "apps/api/dist/main.js"]
