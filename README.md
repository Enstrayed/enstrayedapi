# Enstrayed API
This repository contains the code for my personal web API written in JavaScript using the Express framework. 

## Documentation
This file contains documentation relevant for development and deployment, but not necessarily usage. Information for all endpoints is available [on my website](https://enstrayed.com/posts/20240409-API-Documentation.html).

## Issues
If you would like to report a bug or security issue, please open a GitHub issue. If you are the operator of a service this application accesses, use the contact information provided during registration with your service to contact me directly.

## Configuration


<details> <summary>Configuration Template</summary>

```json

```

</details>

## Docker
In production, this application is designed to be run in Docker, and the container built by pulling the latest commit from the main branch. As such, deploying this application is just a matter of creating a directory and copying the Dockerfile:

```dockerfile
FROM node:22
WORKDIR /app

RUN git clone https://github.com/enstrayed/enstrayedapi .
RUN npm install

USER node
ENTRYPOINT [ "node", "index.js" ]
```

<details> <summary>Docker Compose File</summary>

```yaml

```

</details>

## License
If for whatever reason you want to, you are free to adapt this code for your own projects or as reference. However, this software is provided as-is with no warranty or agreement to support it. 