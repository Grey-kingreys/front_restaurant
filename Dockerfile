# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Frontend Next.js — image de production multi-stage
# Stack : Next.js 16 (output: "standalone") / React 19 / Node 24
# ─────────────────────────────────────────────────────────────

# ---- 1. Dépendances -----------------------------------------
FROM node:24-alpine AS deps
# libc6-compat : requis par certaines dépendances natives sous Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installe uniquement à partir du lockfile pour un build reproductible.
# --legacy-peer-deps : le lockfile a été résolu avec React 19 alors que
# @testing-library/react@14 (devDep) déclare un peer React 18. C'est le même
# mode que l'install locale ; à retirer quand testing-library passera en v16+.
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ---- 2. Build -----------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables NEXT_PUBLIC_* : les valeurs de Next sont figées au BUILD. Pour permettre une
# config au RUNTIME (variable d'env Dokploy classique, sans rebuild), on compile avec des
# SENTINELLES que l'entrypoint remplace au démarrage du conteneur par les vraies valeurs.
# (On peut toujours court-circuiter en passant --build-arg : la valeur est alors figée.)
ARG NEXT_PUBLIC_API_URL=http://RUNTIME_API_URL_PLACEHOLDER
ARG NEXT_PUBLIC_MAPBOX_TOKEN=RUNTIME_MAPBOX_TOKEN_PLACEHOLDER
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 3. Runner (image finale) -------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Exécution sans privilèges root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Sortie standalone : server.js + node_modules minimal
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Entrypoint : remplace les sentinelles NEXT_PUBLIC_* par les valeurs runtime, puis démarre.
COPY --chmod=555 docker/entrypoint.sh /entrypoint.sh

USER nextjs

EXPOSE 3000

# L'entrypoint injecte la config runtime puis lance `node server.js`.
ENTRYPOINT ["/entrypoint.sh"]
