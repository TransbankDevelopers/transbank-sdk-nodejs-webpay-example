FROM node:10.17.0-stretch
RUN apt-get update && apt-get install -y zip unzip libxml2-dev
RUN mkdir -p /app
WORKDIR /app
COPY . /app
COPY ./package.json /app/
RUN npm install

COPY . /app
