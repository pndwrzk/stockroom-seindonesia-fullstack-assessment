FROM node:24-bookworm-slim AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN if [ ! -f .env ]; then cp env.example .env; fi \
    && npm run build

FROM node:24-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3001

CMD ["npm", "start", "--", "--hostname", "0.0.0.0"]
