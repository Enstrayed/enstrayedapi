## Note for Visitors
* This README mainly contains information for operation but not usage. API documentation is available [here](https://enstrayed.com/posts/20240409-API-Documentation.html).
* Have feedback or experiencing a problem with an endpoint? Please [open a GitHub issue](https://github.com/Enstrayed/enstrayedapi/issues/new).
* Security problem? [Open a ticket here](https://helpdesk.enstrayed.com/open.php) with the topic set as 'Responsible Disclosure'.
* This code is unlicensed but I don't really care if you use parts of it (I don't know why you would though). 

## Configuration
TODO: Rewrite

<details> <summary>Configuration Template</summary>

```json

```

</details>

## Docker
TODO: Rewrite & add Komodo TOML files

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