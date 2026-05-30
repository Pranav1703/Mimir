FROM node:22-alpine AS builder
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
