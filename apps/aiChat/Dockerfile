# Stage 1: Base
FROM docker.m.daocloud.io/library/node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy all package.json files to allow pnpm to install dependencies correctly
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
COPY apps/aiChat/package.json ./apps/aiChat/

RUN pnpm install --frozen-lockfile

# Stage 3: Builder
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages ./packages
COPY --from=deps /workspace/apps/aiChat/node_modules ./apps/aiChat/node_modules
COPY . .

# Set environment variables for build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the app and its dependencies
RUN NODE_OPTIONS="--max-old-space-size=2048" SKIP_MIGRATION_ERROR=true pnpm build --filter aiChat

# Stage 4: Runner
FROM docker.m.daocloud.io/library/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build and public files
COPY --from=builder /workspace/apps/aiChat/public ./apps/aiChat/public
COPY --from=builder /workspace/apps/aiChat/.next/standalone ./
COPY --from=builder /workspace/apps/aiChat/.next/static ./apps/aiChat/.next/static

EXPOSE 3000

# The standalone output includes its own server.js
CMD ["node", "apps/aiChat/server.js"]
