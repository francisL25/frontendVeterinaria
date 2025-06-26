# Etapa 1: build de la app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

# Etapa 2: servir la app con Nginx
FROM nginx:stable-alpine

# Copiar archivos estáticos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Remover configuración default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
