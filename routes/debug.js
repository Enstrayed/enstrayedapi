import { app, globalConfig } from "../index.js" // Get globals from index
import { checkToken } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"

app.get("/api/debugtokencheck", (rreq,rres) => {
    checkToken(rreq.get("Authorization"),"etyd").then(authRes => {
        if (authRes) {
            rres.sendStatus(200)
        } else {
            rres.sendStatus(401)
        }
    })
})

export { app }