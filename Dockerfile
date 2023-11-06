FROM node:20
WORKDIR /app
EXPOSE 8127
CMD [ "bash", "init.sh" ] 

# This is just copied from urlshortener cause both apps have similar architecture
