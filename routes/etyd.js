import { app, db, globalConfig } from "../index.js" // Get globals from index
import { checkToken, checkTokenNew } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"

app.get("/api/etyd*", (rreq,rres) => {
    let userRequest = rreq.path.replace("/api/etyd/","")
    db`select content from etyd where url = ${userRequest}`.then(response => {
        if (response.length == 0) {
            rres.status(404).send(`etyd.cc: URL "${userRequest}" was not found`)
        } else {
            rres.redirect(response[0].content)
        }
    }).catch(dbError => {
        logRequest(rres,rreq,500,dbError)
        rres.status(500).send(`etyd.cc: An internal error occured`)
    })
})

app.delete("/api/etyd*", (rreq,rres) => {

    checkTokenNew(rreq,"etyd").then(authRes => {
        if (authRes.result === false) {
            rres.sendStatus(401) // Token not provided or invalid for this action
        } else {
            db`delete from etyd where url = ${rreq.path.replace("/api/etyd/","")} and owner = ${authRes.ownerId}`.then(dbRes => {
                if (dbRes.count === 1) {
                    rres.sendStatus(200)
                } else if (dbRes.count === 0) {
                    rres.sendStatus(400)
                } else {
                    logRequest(rres, rreq, 500, `Something bad happened during delete from database`)
                    rres.sendStatus(500)
                }
            }).catch(dbErr => {
                logRequest(rres, rreq, 500, dbErr)
                rres.sendStatus(500)
            })
        }
    })

})

app.post("/api/etyd*", (rreq,rres) => {

    checkTokenNew(rreq,"etyd").then(authRes => {
        if (authRes.result === false) {
            rres.sendStatus(401) // Token not provided or invalid for this action
        } else {
            if (!rreq.body["url"]) { // Assumption that if the url key isnt present in the body then the request is malformed
                rres.sendStatus(400)
            } else {
                db`insert into etyd (url,content,owner) values (${rreq.path.replace("/api/etyd/","")},${rreq.body["url"]},${authRes.ownerId})`.then(dbRes => {
                    if (dbRes.count === 1) {
                        rres.sendStatus(201)
                    } else {
                        logRequest(rres,rreq,500,`Database insert did not return expected count but did not error out`)
                        rres.sendStatus(500)
                    }
                }).catch(dbErr => {
                    if (dbErr.code == "23505") { // Unique constraint violation, entry already exists
                        rres.sendStatus(409)
                    } else {
                        logRequest(rres,rreq,500,dbErr)
                        rres.sendStatus(500)
                    }
                })
            }
        }
    })

})

export {app} // export routes to be imported by index for execution