FROM node:21

COPY . /app
WORKDIR /app

RUN npm install

ENTRYPOINT ["node", "index.js"]
