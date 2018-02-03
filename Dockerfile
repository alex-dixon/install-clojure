FROM node:8.9


WORKDIR /usr/src/app/lib/node-jre

COPY lib/node-jre/package*.json ./

RUN npm install

COPY lib/node-jre .


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src src

RUN mkdir tmp

VOLUME /usr/java