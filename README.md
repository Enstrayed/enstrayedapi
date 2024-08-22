# Enstrayed API
This repository contains the code for my personal web API written in JavaScript using the Express framework. 

## Documentation
This file contains documentation relevant for development and deployment, but not necessarily usage. Information for all endpoints is available [on my website](https://enstrayed.com/posts/20240409-API-Documentation.html).

## Issues
If you would like to report a bug or security issue, please open a GitHub issue. If you are the operator of a service this application accesses, use the contact information provided during registration with your service to contact me directly.

## Configuration
On startup, this application will look for two files. If either cannot be read, it will exit with an error code.
1. `config.json` contains settings required for operation and API keys used for calling external services.
2. `GITVERSION` contains the commit that was cloned when the container was built. 

<details> <summary>Configuration Example</summary>

* `couchdbHhost`: URL of CouchDB server.
* `mailjet.apiKey`: Mailjet API Key.
* `mailjet.senderAddress`: Email address that emails will be received from, must be verified in Mailjet admin panel.
* `frontpage.frontpageDir`: Directory of frontpage, will be served at root with modifications.
* `nowplaying.*.apiKey`: API key of respective service.
* `nowplaying.*.target`: User that should be queried to retrieve playback information.

```json
{
    "startup": {
        "apiPort": 8081,
        "routesDir": "./routes"
    },

    "couchdbHost": "",

    "mailjet": {
        "apiKey": "",
        "senderAddress": ""
    },

    "frontpage": {
        "frontpageDir": ""
    },

    "nowplaying": {
        "lastfm": {
            "apiKey": "",
            "target": ""
        },
        "jellyfin": {
            "apiKey": "",
            "host": "",
            "target": ""
        },
        "cider": {
            "apiKeys": [],
            "hosts": []
        }
    }

}
```

</details>

## Docker
In production, this application is designed to be run in Docker, and the container built by pulling the latest commit from the main branch. As such, deploying this application is just a matter of creating a directory and copying the Dockerfile:

> [!IMPORTANT]
> Please review the Configuration section of this document for important information. By default, the `config.json` file is expected to be mounted into the container at `/app/config.json`. 

```dockerfile
FROM node:20
WORKDIR /app

RUN git clone https://github.com/enstrayed/enstrayedapi .
RUN git config --global --add safe.directory /app 
RUN git show --oneline -s >> GITVERSION
RUN npm install

ENTRYPOINT [ "node", "index.js" ]
```

<details> <summary>Docker Compose File</summary>

```yaml
---
services:
  enstrayedapi:
    build:
      context: .
    image: enstrayedapi
    container_name: enstrayedapi
    restart: unless-stopped
    volumes:
      - ./config.json:/app/config.json
```

</details>

## License
If for whatever reason you want to, you are free to adapt this code for your own projects or as reference. However, this software is provided as-is with no warranty or agreement to support it. 