FROM node:20.17-alpine3.20

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx next telemetry disable
RUN npm run build
RUN npm install jwt-decode

CMD ["npm", "run", "start"]

