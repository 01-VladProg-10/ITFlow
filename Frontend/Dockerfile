# Dockerfile dla frontendu
FROM node:20

WORKDIR /app

# Kopiujemy tylko package.json i package-lock.json
COPY package*.json ./

# Instalacja wszystkich zależności (prod + dev)
RUN npm install --legacy-peer-deps

# Kopiujemy resztę kodu frontendu
COPY . .

# Otwieramy port Vite
EXPOSE 5173

# Uruchamiamy dev server
CMD ["npx", "vite", "dev"]