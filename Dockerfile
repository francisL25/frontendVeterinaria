# Dockerfile para el frontend
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app/frontend

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]