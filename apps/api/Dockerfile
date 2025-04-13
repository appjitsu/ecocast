# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Copy root package.json and pnpm workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy turbo.json
COPY turbo.json ./

# Copy necessary package sources for building the API
# Copy api package.json
COPY apps/api/package.json apps/api/
# Copy shared packages source (adjust if you have dependencies in other packages/*)
# Example: If api depends on packages/common
# COPY packages/common/package.json packages/common/
# COPY packages/common/src packages/common/src
# COPY packages/common/tsconfig.json packages/common/

# Install only production dependencies for the api workspace and its dependencies
# This leverages pnpm's filtering capabilities
RUN pnpm install --filter=api... --prod --frozen-lockfile

# Copy the rest of the source code for the api and its dependencies
COPY . .

# Build the specific api application using Turbo
RUN turbo run build --filter=api...

# Prune development dependencies after build
RUN pnpm prune --prod --filter=api...

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy production node_modules and build output from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/
# Copy root package.json if needed by the runtime (e.g., for scripts)
# COPY --from=builder /usr/src/app/package.json ./

# Expose the port the app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV production

# Command to run the application
# Assumes your entrypoint is dist/main.js within the api package
CMD ["node", "apps/api/dist/main.js"]
