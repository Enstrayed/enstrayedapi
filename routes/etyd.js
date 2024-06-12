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

app.delete("/etyd*", (rreq,rres) => {
    
    fetch(`http://${globalConfig.couchdb.host}/apiauthkeys/${globalConfig.etyd.authKeysDoc}`, {
        headers: {
            "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
        }
    }).then(dbRes => dbRes.json()).then(dbRes => {

        if (dbRes.status == 404) { // If document containing cider auth keys does not exist
            console.log(`ERROR: Could not find apiauthkeys/${globalConfig.etyd.authKeysDoc}`)
            rres.sendStatus(500) // Refuse request
        } else {
            if (rreq.get("Authorization") == null) { // If authorization header is not supplied
                rres.sendStatus(400) // then return bad request (would return 500 otherwise)
            } else {
                if (dbRes["content"][rreq.get("Authorization").split("_")[0]] === rreq.get("Authorization").split("_")[1]) {

                    fetch(`http://${globalConfig.couchdb.host}/etyd${rreq.path.replace("/etyd", "")}`, {
                        headers: {
                            "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
                        }
                    }).then(dbRes => {
    
                        if (dbRes.status == 404) {
                            rres.sendStatus(404)
                        } else {
                            dbRes.json().then(dbRes => {
                                
                                fetch(`http://${globalConfig.couchdb.host}/etyd${rreq.path.replace("/etyd", "")}`, {
                                    method: "DELETE",
                                    headers: {
                                        "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`,
                                        "If-Match": dbRes["_rev"]
                                    }
                                }).then(fetchRes => {
                                    if (fetchRes.status == 200) {
                                        console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 200 KEY: ${rreq.get("Authorization")}`)
                                        rres.sendStatus(200)
                                    }
                                }).catch(fetchError => {
                                    rres.sendStatus(500)
                                    console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
                                })
    
                            })
                        }
    
                    }).catch(fetchError => {
                        rres.sendStatus(500)
                        console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
                    })
    
                } else {
                    console.log(`${rreq.get("cf-connecting-ip")} DELETE ${rreq.path} returned 401`) // log ip of unauthorized requests
                    rres.sendStatus(401) // received auth key was not in database
                }
            }
        }
    }).catch(fetchError => {
        rres.sendStatus(500)
        console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
    })

})

// app.post("/etyd*", (rreq,rres) => {
    
//     fetch(`http://${globalConfig.couchdb.host}/apiauthkeys/${globalConfig.etyd.authKeysDoc}`, {
//         headers: {
//             "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
//         }
//     }).then(dbRes => dbRes.json()).then(dbRes => {

//         if (dbRes.status == 404) { // If document containing cider auth keys does not exist
//             console.log(`ERROR: Could not find apiauthkeys/${globalConfig.etyd.authKeysDoc}`)
//             rres.sendStatus(500) // Refuse request
//         } else {
//             if (rreq.get("Authorization") == null) { // If authorization header is not supplied
//                 rres.sendStatus(400) // then return bad request (would return 500 otherwise)
//             } else {
//                 if (dbRes["content"][rreq.get("Authorization").split("_")[0]] === rreq.get("Authorization").split("_")[1]) {

//                     fetch(`http://${globalConfig.couchdb.host}/etyd${rreq.path.replace("/etyd", "")}`, {
//                         headers: {
//                             "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
//                         }
//                     }).then(dbRes => {
    
//                         if (dbRes.status !== 404) {
//                             console.log(`${rres.get("cf-connecting-ip")} POST ${rreq.path} returned 409 KEY: ${rreq.get("Authorization")}`)
//                             rres.sendStatus(409)
//                         } else {
                            


//                         }
    
//                     }).catch(fetchError => {
//                         rres.sendStatus(500)
//                         console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
//                     })
    
//                 } else {
//                     console.log(`${rreq.get("cf-connecting-ip")} DELETE ${rreq.path} returned 401`) // log ip of unauthorized requests
//                     rres.sendStatus(401) // received auth key was not in database
//                 }
//             }
//         }
//     }).catch(fetchError => {
//         rres.sendStatus(500)
//         console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
//     })

// })


module.exports = {app} // export routes to be imported by index for execution