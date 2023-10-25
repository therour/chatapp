FROM node:18.18.2-alpine3.18 as base

ARG VITE_WS_URI=http://localhost:3000
ARG VITE_API_URL=http://localhost:3000

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

# Webserver (nginx)

FROM nginx:1.23.4-alpine AS runner
COPY --from=builder /code/dist/ /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
