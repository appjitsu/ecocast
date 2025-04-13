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
# If using shared packages, copy their package.json too
# COPY --from=builder /usr/src/app/packages/common/package.json ./packages/common/

# Reinstall ONLY production dependencies based on lockfile
RUN pnpm install --prod --ignore-scripts

# Copy build artifacts from builder stage AFTER reinstalling deps
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
# If using shared packages, copy their dist too
# COPY --from=builder /usr/src/app/packages/common/dist ./packages/common/dist

# Expose the port the app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV production

# Command to run the application
CMD ["node", "apps/api/dist/main.js"]
