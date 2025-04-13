# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm@8.15.4

# Install turbo globally (optional fallback, pnpm install should handle it)
# RUN npm install -g turbo

# Copy root configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy ALL source code needed for the build first
COPY apps/api apps/api/
# If api depends on other workspace packages (e.g., packages/common), copy their source too:
# COPY packages/common packages/common/

# Install dependencies for the root, api workspace, and its dependencies
# Filter should now correctly find the packages because source code is present
RUN pnpm install --filter={./,api...} --frozen-lockfile --ignore-scripts

# Build the specific api application using Turbo
RUN pnpm exec turbo run build --filter=api...

# Prune development dependencies after build
RUN pnpm prune --prod --filter=api...

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Install pnpm in production stage to support migrations
RUN npm install -g pnpm@8.15.4

# Copy necessary node_modules (adjust if shared packages are used)
COPY --from=builder /usr/src/app/apps/api/node_modules ./apps/api/node_modules
# COPY --from=builder /usr/src/app/packages/common/node_modules ./packages/common/node_modules # Example for shared package

# Copy build artifacts
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
# COPY --from=builder /usr/src/app/packages/common/dist ./packages/common/dist # Example for shared package

# Copy necessary package.json files
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/
# COPY --from=builder /usr/src/app/packages/common/package.json ./packages/common/ # Example for shared package

# Copy root package files needed for pnpm run in production image
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./

# Expose the port the app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV production

# Command to run the application
# Assumes your entrypoint is dist/main.js within the api package
CMD ["node", "apps/api/dist/main.js"]
