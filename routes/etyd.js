const { app, db, globalConfig } = require("../index.js") // Get globals from index

app.get("/etyd*", (rreq,rres) => {
    fetch(`http://${globalConfig.couchdb.host}/etyd${rreq.path.replace("/etyd","")}`, {
        headers: {
            "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
        }
    }).then(dbRes => {
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

module.exports = {app} // export routes to be imported by index for execution