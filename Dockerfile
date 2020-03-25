FROM node:10-stretch
RUN apt-get update && apt-get install -y zip unzip libxml2-dev
RUN mkdir -p /app
WORKDIR /app

COPY ./package* /app/
RUN npm install

COPY . /app

CMD node src/index.js
