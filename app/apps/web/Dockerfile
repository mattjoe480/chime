FROM node:20.15-bookworm-slim AS base

FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
#RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS installer
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi
# Runner copies everything from the installer, then runs the app as a locked
# down nonroot user
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app

# Copy in the built files. Automatically leverage output traces to reduce image
# size: https://nextjs.org/docs/advanced-features/output-file-tracing
#COPY --chown=nonroot:nonroot --from=installer /app/.env.production .
COPY --chown=nonroot:nonroot --from=installer /app/next.config.ts .
COPY --chown=nonroot:nonroot --from=installer /app/package.json .
COPY --chown=nonroot:nonroot --from=installer /app/.next/standalone ./
COPY --chown=nonroot:nonroot --from=installer /app/.next/static ./.next/static
COPY --chown=nonroot:nonroot --from=installer /app/public ./public

USER nonroot

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD [ "server.js" ]