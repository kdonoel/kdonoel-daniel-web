FROM node:26.12.1-trixie-slim AS builder

# Yarn is no longer bundled with the official Node.js images since Node.js 25
ARG YARN_VERSION=1.22.22
RUN npm install --global yarn@${YARN_VERSION}

# Git hooks are useless in the image
ENV HUSKY=0

WORKDIR /home/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./ ./
RUN yarn run build

FROM nginx:1.31.8-alpine

WORKDIR /home/www
COPY --from=0 /home/app/dist/browser .
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
