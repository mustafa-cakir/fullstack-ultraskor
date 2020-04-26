FROM node:12.2.0-alpine as build

WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN yarn install
COPY . /app
RUN yarn build

FROM nginx:1.16.0-alpine
COPY --from=build /app/build /var/www
COPY nginx/nginx.conf /etc/nginx/nginx.conf

#EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]