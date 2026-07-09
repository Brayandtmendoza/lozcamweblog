FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
# Copiamos la carpeta prisma en la etapa de dependencias para asegurar que 'npm ci' o los hooks corran bien
COPY prisma ./prisma/ 
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para compilar (Mantenemos las tuyas por si tu Front todavía las usa)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

# 1. ¡CLAVE PARA PRISMA! Generamos el cliente antes de compilar la app
RUN npx prisma generate

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 2. Copiamos la carpeta prisma al entorno de ejecución para que Prisma Engine no falle
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
