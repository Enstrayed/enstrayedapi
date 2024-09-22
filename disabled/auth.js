import { globalConfig, app } from "../index.js"
import { logRequest } from "../liberals/logging.js"

app.delete("/api/token", (rreq,rres) => {
    fetch(`${globalConfig.couchdbHost}/auth/sessions`).then(res => res.json()).then(fetchRes => {
        if (fetchRes.sessions[rreq.get("Authorization")]) {
            delete fetchRes.sessions[rreq.get("Authorization")]
            fetch(`${globalConfig.couchdbHost}/auth/sessions`, {
                method: "PUT",
                headers: {
                    "If-Match": fetchRes._rev
                },
                body: JSON.stringify({
                    sessions: fetchRes.sessions
                })
                
            }).then(res => {
                if (res.status == 201) {
                    rres.sendStatus(200)
                } else {
                    logRequest(rres,rreq,500,`Token invalidation may have failed: ${res.status} ${res.statusText}`)
                    rres.sendStatus(500)
                }
            }).catch(fetchError => {
                logRequest(rres,rreq,500,fetchError)
                rres.sendStatus(500)
            })
        } else {
            rres.sendStatus(400)
        }
    })
})

export default {app}