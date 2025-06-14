## Note for Visitors
* This README mainly contains information for operation but not usage. API documentation is available [here](https://enstrayed.com/posts/20240409-API-Documentation.html).
* Have feedback or experiencing a problem with an endpoint? Please [open a GitHub issue](https://github.com/Enstrayed/enstrayedapi/issues/new).
* Security problem? [Open a ticket here](https://helpdesk.enstrayed.com/open.php) with the topic set as 'Responsible Disclosure'.
* This code is unlicensed but I don't really care if you use parts of it (I don't know why you would though). 

## Configuration

<details> <summary>Configuration</summary>

```json
{
    "oidc": {
        "clientId": "nowaybuddy",
        "tokenUrl": "https://login.enstrayed.com/application/o/token/",
        "userinfoUrl": "https://login.enstrayed.com/application/o/userinfo/",
        "authorizeUrl": "https://login.enstrayed.com/application/o/authorize/",
        "clientSecret": "nowaybuddy"
    },
    "email": {
        "host": "orenco.enstrayed.com",
        "password": "nowaybuddy",
        "username": "nowaybuddy"
    },
    "nowplaying": {
        "cider": {
            "hosts": [],
            "apiKeys": []
        },
        "lastfm": {
            "apiKey": "nowaybuddy",
            "target": "enstrayed"
        },
        "jellyfin": {
            "host": "http://hawthorne.pizzly-catfish.ts.net:8096",
            "apiKey": "nowaybuddy",
            "target": "nathan",
            "hostPublic": "https://jellyfin.enstrayed.com"
        }
    }
}
```

</details>

<details> <summary>Komodo Files</summary>


```toml
[[build]]
name = "enstrayedapi"
[build.config]
builder = "local"
repo = "Enstrayed/enstrayedapi"
webhook_secret = "nowaybuddy"
```
```toml
[[deployment]]
name = "enstrayedapi"
[deployment.config]
server = "hawthorne"
image.type = "Build"
image.params.build = "enstrayedapi"
network = "caddy"
restart = "unless-stopped"
extra_args = ["--network=postgres"]
environment = """
DATABASE_URI=postgres://nowaybuddy:nowaybuddy@postgres:5432/api
"""
```

</details>