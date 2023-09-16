FROM node:18

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./
COPY .env ./

RUN npm run build

# If you are building your code for production
# RUN npm ci --omit=dev
# Bundle app source

COPY . .
EXPOSE 5000
EXPOSE 80
EXPOSE 443
EXPOSE 5222 
ENV NODE_ENV=production
CMD [ "npm", "run", "start-prod-server" ]