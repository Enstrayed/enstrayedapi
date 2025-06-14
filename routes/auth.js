import { app, db, globalConfig } from "../index.js" // Get globals from index
import { checkTokenNew } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"
import { randomStringBase62, getHumanReadableUserAgent } from "../liberals/misc.js"

app.get("/api/auth/whoami", (rreq,rres) => {
    if (!rreq.cookies["APIToken"] && !rreq.get("Authorization")) {
        rres.send({ "loggedIn": false, "username": "", "scopes": "" })
    } else {
        db`select s.scopes, u.username from sessions s join users u on s.owner = u.id where s.token = ${rreq.cookies["APIToken"] ?? rreq.get("Authorization")}`.then(dbRes => {
            if (dbRes.length > 0 && dbRes.length < 2) {
                rres.send({ "loggedIn": true, "username": dbRes[0]?.username, "scopes": dbRes[0]?.scopes.split(",") })
            } else {
                rres.send({ "loggedIn": false, "username": "", "scopes": "" })
            }
        }).catch(dbErr => {
            logRequest(rres,rreq,500,dbErr)
            rres.status(500).send({ "loggedIn": false, "username": "", "scopes": "" })
        })
    }
})

app.get("/api/auth/login", (rreq,rres) => {

    if (rreq.query.state === "redirect") {
        if (!rreq.query.destination) {
            rres.redirect(`${globalConfig.oidc.authorizeUrl}?client_id=${globalConfig.oidc.clientId}&response_type=code&scope=openid enstrayedapi&redirect_uri=${rreq.protocol}://${rreq.get("Host")}/api/auth/callback&state=none`)
        } else {
            let newState = `redirect_${btoa(rreq.query.destination).replace("/","-")}`
            rres.redirect(`${globalConfig.oidc.authorizeUrl}?client_id=${globalConfig.oidc.clientId}&response_type=code&scope=openid enstrayedapi&redirect_uri=${rreq.protocol}://${rreq.get("Host")}/api/auth/callback&state=${newState}`)
        }
    } else if (rreq.query.state === "display" || rreq.query.state === "close") {
        rres.redirect(`${globalConfig.oidc.authorizeUrl}?client_id=${globalConfig.oidc.clientId}&response_type=code&scope=openid enstrayedapi&redirect_uri=${rreq.protocol}://${rreq.get("Host")}/api/auth/callback&state=${rreq.query.state}`)
    } else {
        rres.redirect(`${globalConfig.oidc.authorizeUrl}?client_id=${globalConfig.oidc.clientId}&response_type=code&scope=openid enstrayedapi&redirect_uri=${rreq.protocol}://${rreq.get("Host")}/api/auth/callback&state=none`)
    }

})

app.get("/api/auth/logout", (rreq,rres) => {
    if (rreq.cookies["APIToken"] || rreq.get("Authorization")) {
        db`delete from sessions where token = ${rreq.cookies["APIToken"] ?? rreq.get("Authorization")}`.then(dbRes => {
            if (dbRes.count > 0) {
                rres.send("Success")
            } else {
                rres.status(400).send("Token does not exist.")
            }
        }).catch(dbErr => {
            logRequest(rres,rreq,500,dbErr)
            rres.status(500).send("Exception occured while invalidating token, details: "+dbErr)
        })
    } else {
        rres.status(400).send("Missing token or authorization header, you may not be logged in.")
    }
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

                            db`insert into sessions (token,owner,scopes,expires,comment) values (${newToken},(select id from users where oidc_username = ${fetchRes2.username}),${fetchRes2.enstrayedapi_scopes},${newExpiration},${newComment});`.then(dbRes1 => {
                                if (rreq.query.state.split("_")[0] === "redirect") {
                                    let newDestination = atob(rreq.query.state.split("_")[1].replace("-","/"))
                                    rres.setHeader("Set-Cookie", `APIToken=${newToken}; Domain=${rreq.hostname}; Expires=${new Date(newExpiration).toUTCString()}; Path=/`).redirect(newDestination)
                                } else if (rreq.query.state === "display") {
                                    // Change this to not write the token to a cookie
                                    rres.setHeader("Set-Cookie", `APIToken=${newToken}; Domain=${rreq.hostname}; Expires=${new Date(newExpiration).toUTCString()}; Path=/`).send(`Success! Your token is <code>${newToken}</code>`)
                                } else if (rreq.query.state === "close") {
                                    rres.setHeader("Set-Cookie", `APIToken=${newToken}; Domain=${rreq.hostname}; Expires=${new Date(newExpiration).toUTCString()}; Path=/`).send(`<script>document.addEventListener("DOMContentLoaded", () => {window.close();});</script> Success! You may now close this window.`)
                                } else {
                                    rres.setHeader("Set-Cookie", `APIToken=${newToken}; Domain=${rreq.hostname}; Expires=${new Date(newExpiration).toUTCString()}; Path=/`).send(`Success! No state was provided, so you can close this window.`)
                                }
                            }).catch(dbErr => {
                                localError500(`Callback-Write-${dbErr}`)
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

app.get("/api/auth/tokenlist", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

app.get("/api/auth/nuke", (rreq,rres) => {
    rres.send("Non functional endpoint")
})

export { app }