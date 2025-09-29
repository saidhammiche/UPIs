# Étape 1 : Build du projet React
FROM node:18 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur nginx
FROM nginx:alpine

# Supprimer la conf par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier le build React
COPY --from=build /app/build /usr/share/nginx/html

# Copier notre conf nginx
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 3005
CMD ["nginx", "-g", "daemon off;"]
