# Usa Node.js como base
FROM node:21

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos necessários para instalar dependências
COPY package.json package-lock.json ./

# Instala dependências em modo produção
RUN npm install --only=production

# Copia o restante do código da aplicação
COPY . .

# Compila o TypeScript
RUN npm run build

# Expondo a porta
EXPOSE 3000

# Comando de inicialização usando seu script
CMD ["npm", "run", "start"]