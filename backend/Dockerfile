FROM node:18.18.2-alpine3.18 as base

# Builder

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /code

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runner

FROM base AS runner
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app
COPY --from=builder /code/dist/ ./dist
COPY --from=builder /code/node_modules/ ./node_modules
COPY --from=builder /code/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["npm", "run", "start"]
