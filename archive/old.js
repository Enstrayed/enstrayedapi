// This file contains old code not used anymore

app.post("/api/sync", (rreq,rres) => {
    checkToken(rreq.query.auth,"fpupdate").then(checkResponse => {
        if (checkResponse === true) {
            if (rreq.headers["x-github-event"] == "ping") {
                rres.sendStatus(200)
            } else if (rreq.headers["x-github-event"] == "push") {
                execSync("git pull")
                logRequest(rres,rreq,200,"Ran git pull, exiting to restart...")
                rres.sendStatus(200)
                process.exit(0)
            } else {
                logRequest(rres,rreq,400)
                rres.sendStatus(400)
            }
        } else {
            rres.sendStatus(401)
        }
    })
})