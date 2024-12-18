FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY .env .env

RUN npm install

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

EXPOSE 8000

RUN chown -R node /usr/src/app
USER node

CMD ["node", "dist/main"]
