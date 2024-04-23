FROM node:20
WORKDIR /app

RUN git clone https://github.com/enstrayed/enstrayedapi .
RUN git config --global --add safe.directory /app
RUN git show --oneline -s >> GITVERSION
RUN npm install

ENTRYPOINT [ "node", "index.js" ]