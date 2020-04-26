FROM node:10-alpine
# Create app directory
WORKDIR /appServer
# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

#Expose port and start application
#EXPOSE 5001 5002

CMD [ "yarn", "prod-server" ]
