const { app, globalConfig } = require("../index.js") // Get globals from index
const { checkToken } = require("../liberals/auth.js")

app.get("/etyd*", (rreq,rres) => {
    fetch(`${globalConfig.couchdbHost}/etyd${rreq.path.replace("/etyd","")}`).then(dbRes => {
        if (dbRes.status == 404) {
            rres.sendStatus(404)
        } else {
            dbRes.json().then(dbRes => {
                try { 
                    rres.redirect(dbRes.content.url) // Node will crash if the Database entry is malformed
                } catch (responseError) {
                    rres.sendStatus(500)
                    console.log(`${rres.get("cf-connecting-ip")} GET ${rreq.path} returned 500: ${responseError}`)
                }
            })
        }
    }).catch(fetchError => {
        rres.sendStatus(500)
        console.log(`${rres.get("cf-connecting-ip")} GET ${rreq.path} returned 500: ${fetchError}`)
    })
})

app.delete("/etyd*", (rreq,rres) => {

    if (rreq.get("Authorization") === undefined) {
        rres.sendStatus(400)
    } else {
        checkToken(rreq.get("Authorization"),"etyd").then(authRes => {
            if (authRes === false) {
                rres.sendStatus(401)
            } else if (authRes === true) { // Authorization successful

                fetch(`${globalConfig.couchdbHost}/etyd${rreq.path.replace("/etyd", "")}`).then(dbRes => {

                    if (dbRes.status == 404) {
                        rres.sendStatus(404)
                    } else {
                        dbRes.json().then(dbRes => {
                            
                            fetch(`${globalConfig.couchdbHost}/etyd${rreq.path.replace("/etyd", "")}`, {
                                method: "DELETE",
                                headers: {
                                    "If-Match": dbRes["_rev"] // Using the If-Match header is easiest for deleting entries in couchdb
                                }
                            }).then(fetchRes => {
                                if (fetchRes.status == 200) {
                                    console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 200 KEY: ${rreq.get("Authorization")}`)
                                    rres.sendStatus(200)
                                }
                            }).catch(fetchError => {
                                console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
                                rres.sendStatus(500)
                            })

                        })
                    }

                }).catch(fetchError => {
                    console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
                    rres.sendStatus(500)
                })

            }
        })
    }

})

app.post("/etyd*", (rreq,rres) => {

    if (rreq.get("Authorization") === undefined) {
        rres.sendStatus(400)
    } else {
        checkToken(rreq.get("Authorization"),"etyd").then(authRes => {
            if (authRes === false) {
                rres.sendStatus(401)
            } else if (authRes === true) { // Authorization successful

                if (rreq.body["url"] == undefined) {
                    rres.sendStatus(400)
                } else {
                    fetch(`${globalConfig.couchdbHost}/etyd${rreq.path.replace("/etyd", "")}`, { 
                        method: "PUT",
                        body: JSON.stringify({
                            "content": {
                                "url": rreq.body["url"]
                            }
                        })
                    }).then(dbRes => {
    
                        switch(dbRes.status) {
                            case 409:
                                rres.sendStatus(409)
                                break;

                            case 201:
                                rres.status(200).send(rreq.path.replace("/etyd", ""))
                                break;

                            default:
                                console.log(`ERROR: CouchDB PUT did not return expected code: ${dbRes.status}`)
                                break;
                        }
    
                    }).catch(fetchError => {
                        console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
                        rres.sendStatus(500)
                    })
                }

            }
        })
    }

})

module.exports = {app} // export routes to be imported by index for execution