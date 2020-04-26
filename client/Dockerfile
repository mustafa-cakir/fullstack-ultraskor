FROM node:10-alpine as build

WORKDIR /appClient
# ENV PATH /appClient/node_modules/.bin:$PATH
COPY package.json /appClient/package.json
COPY yarn.lock /appClient/yarn.lock

RUN yarn install

COPY . /appClient

RUN yarn build

FROM nginx:1.16.0-alpine
COPY --from=build /appClient/build /var/www
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 3000

CMD ["nginx", "-g", "daemon off;"]
