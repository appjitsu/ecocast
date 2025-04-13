# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm@8.15.4

# Install turbo globally to ensure availability during build
RUN npm install -g turbo

# Copy root package.json and pnpm workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy turbo.json
COPY turbo.json ./

# Copy necessary package sources for building the API
COPY apps/api/package.json apps/api/
# Uncomment and adjust if api depends on shared packages
# COPY packages/common/package.json packages/common/
# COPY packages/common/src packages/common/src
# COPY packages/common/tsconfig.json packages/common/

# Install dependencies for the api workspace and its dependencies, PLUS root dev deps
# This leverages pnpm's filtering capabilities
# Ignore scripts to prevent husky prepare hooks from running in build
RUN pnpm install --filter={./,api...} --frozen-lockfile --ignore-scripts

# Copy only necessary source code
COPY apps/api apps/api/
# If api depends on other workspace packages (e.g., packages/common), copy their source too:
# COPY packages/common packages/common/

# Build the specific api application using Turbo (use pnpm exec)
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
