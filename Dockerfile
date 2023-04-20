FROM node:16.20.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --f
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .
RUN export HOST=0.0.0.0 \
    && export PORT=433 

EXPOSE 443

CMD [ "npm", "start" ]
