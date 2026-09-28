FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_GUARDIAN_API_KEY
ARG VITE_NYT_API_KEY
ARG VITE_NEWSAPI_KEY

ENV VITE_GUARDIAN_API_KEY=$VITE_GUARDIAN_API_KEY
ENV VITE_NYT_API_KEY=$VITE_NYT_API_KEY
ENV VITE_NEWSAPI_KEY=$VITE_NEWSAPI_KEY

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
