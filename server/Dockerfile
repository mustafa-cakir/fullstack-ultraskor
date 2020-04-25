FROM node:12
# Create app directory
WORKDIR /appServer
# Install app dependencies
COPY package.json ./

RUN yarn install
# Copy app source code
COPY . .

#Expose port and start application
#EXPOSE 8080
CMD [ "yarn", "prod-server" ]
