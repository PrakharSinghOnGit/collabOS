FROM node:10
RUN npm install -g nodemon
WORKDIR /usr/src/osjs
COPY entrypoint.sh .
CMD ./entrypoint.sh
