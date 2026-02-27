
# Stage 1: Base
FROM --platform=linux/amd64 docker.m.daocloud.io/library/node:20-alpine AS base
RUN corepack enable

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /workspace

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy all packages package.json
COPY packages/agent-lib/package.json ./packages/agent-lib/
COPY packages/ai-chat/package.json ./packages/ai-chat/
COPY packages/artifact-ui/package.json ./packages/artifact-ui/
COPY packages/auth/package.json ./packages/auth/
COPY packages/finance/package.json ./packages/finance/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/iteration-lib/package.json ./packages/iteration-lib/
COPY packages/projects/package.json ./packages/projects/
COPY packages/recruitment/package.json ./packages/recruitment/
COPY packages/requirement-lib/package.json ./packages/requirement-lib/
COPY packages/shared-employee/package.json ./packages/shared-employee/
COPY packages/skill/package.json ./packages/skill/
COPY packages/square/package.json ./packages/square/
COPY packages/tasks/package.json ./packages/tasks/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/utils/package.json ./packages/utils/
COPY packages/worker-service/package.json ./packages/worker-service/
COPY packages/mcp/package.json ./packages/mcp/
# Copy apps package.json
COPY apps/mcp/package.json ./apps/mcp/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Stage 3: Builder
FROM base AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages ./packages
COPY --from=deps /workspace/apps/mcp/node_modules ./apps/mcp/node_modules
COPY . .

# Build packages and then the mcp
# Note: MCP server is run with tsx in dev/prod usually, but if we want to build:
RUN pnpm build --filter @uxin/mcp-server || true

# Prune dev dependencies
RUN pnpm install --prod --frozen-lockfile

# Stage 4: Runner
FROM --platform=linux/amd64 docker.m.daocloud.io/library/node:20-alpine AS runner
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production

# Copy EVERYTHING from builder to maintain pnpm workspace structure and symlinks
COPY --from=builder /workspace ./

# Set working directory to the app we want to run
WORKDIR /app/apps/mcp

# Run the app using tsx
CMD ["./node_modules/.bin/tsx", "--loader=esbuild-wasm", "src/index.ts"]
