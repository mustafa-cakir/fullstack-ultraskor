FROM node:10-alpine
# Create app directory
WORKDIR /appServer

# Install pm2 globally
RUN npm install pm2 -g

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

#Expose port and start application
EXPOSE 5001 5002

CMD [ "pm2-runtime", "pm2.config.js" ]
