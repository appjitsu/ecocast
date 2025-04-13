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
# Copy necessary shared packages if they exist and are dependencies
COPY packages packages/

# Install ALL workspace dependencies (including dev deps like turbo)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the specific api application using Turbo
RUN pnpm exec turbo run build --filter=@repo/api...

# --- Pruning removed, will reinstall prod deps in final stage ---
# RUN pnpm prune --prod

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Install pnpm in production stage
RUN npm install -g pnpm@8.15.4

# Copy necessary package configuration files from builder
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./
COPY --from=builder /usr/src/app/apps/api/package.json ./apps/api/
# Copy package.json for workspace dependencies needed to resolve workspace:* protocol
COPY --from=builder /usr/src/app/packages/types/package.json ./packages/types/
COPY --from=builder /usr/src/app/packages/utils/package.json ./packages/utils/
# Add copies for any other workspace packages referenced by api

# Reinstall ONLY production dependencies based on lockfile
# This will correctly link workspace dependencies like @repo/types, @repo/utils
RUN pnpm install --prod --ignore-scripts

# Copy build artifacts from builder stage AFTER reinstalling deps
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
# Copy dist folders for linked workspace packages
COPY --from=builder /usr/src/app/packages/types/dist ./packages/types/dist
COPY --from=builder /usr/src/app/packages/utils/dist ./packages/utils/dist
# Add copies for any other workspace packages referenced by api

# Expose the port the app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV production

# Command to run the application
CMD ["node", "apps/api/dist/main.js"]
