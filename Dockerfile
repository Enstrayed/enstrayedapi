FROM node:22

USER node
WORKDIR /app

RUN git clone https://github.com/enstrayed/enstrayedapi .
RUN npm install

ENTRYPOINT [ "node", "index.js" ]
