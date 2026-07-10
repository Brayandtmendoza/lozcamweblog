FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
# Instalamos las dependencias normales
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_STANDALONE=true

# Ejecuta prisma generate SOLO si el archivo realmente existe en el repositorio
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; else echo "Omitiendo npx prisma generate porque schema.prisma no existe"; fi

# Compila Next.js saltándose verificaciones estrictas de base de datos en build time
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copia la carpeta prisma para producción solo si existe
RUN if [ -d "./prisma" ]; then cp -r ./prisma ./.next/standalone/prisma || true; fi

USER nextjs
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
