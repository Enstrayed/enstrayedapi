import { app, db, globalConfig } from "../index.js" // Get globals from index
import { checkTokenNew } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"
import { randomStringBase62, getHumanReadableUserAgent } from "../liberals/misc.js"

app.get("/api/auth/whoami", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.get("/api/auth/login", (rreq,rres) => {
    rres.redirect(`${globalConfig.oidc.authorizeUrl}?client_id=${globalConfig.oidc.clientId}&response_type=code&scope=openid enstrayedapi&redirect_uri=${rreq.protocol}://${rreq.get("Host")}/api/auth/callback`)
})

app.get("/api/auth/callback", (rreq,rres) => {
    fetch(globalConfig.oidc.tokenUrl, { // Call token endpoint at IdP using code provdided during callback
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded"},
        body: `grant_type=authorization_code&code=${rreq.query.code}&redirect_uri=${rreq.protocol}://${rreq.get("Host")}/api/auth/callback&client_id=${globalConfig.oidc.clientId}&client_secret=${globalConfig.oidc.clientSecret}`
    }).then(fetchRes1 => {
        fetchRes1.json().then(fetchRes1 => { // Convert response to JSON then continue
            if (fetchRes1.error) { // Fetch to token endpoint succeded but resulted in error, usually because the provided code is invalid
                localError500(`Callback-Token-${fetchRes1.error}`)
            } else { // Assumed success
                fetch(globalConfig.oidc.userinfoUrl, { // Call userinfo endpoint at IdP using token provided during previous step
                    headers: { "Authorization": `Bearer ${fetchRes1.access_token}`}
                }).then(fetchRes2 => {
                    if (fetchRes2.ok === false) { // Fetch to userinfo endpoint succeded but resulted in error (usually 401)
                        localError500(`Callback-Userinfo-${fetchRes2.status}`)
                    } else {
                        fetchRes2.json().then(fetchRes2 => {
                            let newToken = randomStringBase62(64)
                            let newExpiration = Date.now() + 86400
                            let newComment = `Login token for ${getHumanReadableUserAgent(rreq.get("User-Agent"))} on ${rreq.get("cf-connecting-ip") ?? rreq.ip}`
                            db`select * from users where oidc_username = ${fetchRes2.username};`.then(dbRes1 => {
                                db`insert into sessions (token,owner,scopes,expires,comment) values (${newToken},${dbRes1[0]?.id},${fetchRes2.enstrayedapi_scopes},${newExpiration},${newComment})`.then(dbRes2 => {
                                    rres.send(dbRes2)
                                })
                            })
                        })
                    }
                }).catch(fetchErr2 => { // Fetch to userinfo endpoint failed for some other reason
                    localError500(`Callback-Fetch2-${fetchErr2}`)
                })
            }
        })
    }).catch(fetchErr1 => { // Fetch to token endpoint failed for some other reason
        localError500(`Callback-Fetch-${fetchErr1}`)
    })

    function localError500(code) {
        logRequest(rres,rreq,500,code)
        rres.status(500).send(`An error occured during login, a token was not created.<br><br><code>500 ${code}</code>`)
    }
})

app.post("/api/auth/token", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.delete("/api/auth/token", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

export { app }