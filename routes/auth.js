import { app, db, globalConfig } from "../index.js" // Get globals from index
import { checkTokenNew } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"

app.get("/api/auth/whoami", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.get("/api/auth/login", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.get("/api/auth/callback", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.post("/api/auth/token", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.delete("/api/auth/token", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

export { app }