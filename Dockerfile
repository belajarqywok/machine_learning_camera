FROM node:18-alpine

WORKDIR /etc/docpet_camera

RUN npm install -g http-server

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080
CMD [ "http-server", "dist" ]