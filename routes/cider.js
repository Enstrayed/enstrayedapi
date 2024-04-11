const { app, db, globalConfig } = require("../index.js") // Get globals from index

var timeSinceLastCiderQuery = Date.now()-2000;
var currentListening = {}

app.get("/cider", (rreq,rres) => { // GET current listening from target

    if (Date.now() < timeSinceLastCiderQuery+2000) { 
        rres.send(currentListening); // If it has been <2 seconds since the last request, return the cached result.
    } else { 
        getCurrentListening(globalConfig.cider.targetHosts[0]).then(funcRes => {
            if (funcRes == 1) {
                rres.sendStatus(503) // If there was a problem getting the upstream JSON, return 503 Service Unavailable.
            } else {
                rres.set("Access-Control-Allow-Origin","*") // Required (I think?) because of CORS.
                rres.send(funcRes)
            }
        })
    }

})


app.post("/cider", (rreq,rres) => { // POST stop listening on cider target

    fetch(`http://${globalConfig.couchdb.host}/apiauthkeys/${globalConfig.cider.authKeysDoc}`, {
        headers: {
            "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
        }
    }).then(dbRes => dbRes.json()).then(dbRes => {

        if (dbRes.status == 404) { // If document containing cider auth keys does not exist
            console.log(`ERROR: Could not find apiauthkeys/${globalConfig.mailjet.authKeysDoc}`)
            rres.sendStatus(500) // Refuse request
        } else {
            if (dbRes["content"][rreq.get("Authorization").split("_")[0]] === rreq.get("Authorization").split("_")[1]) {

                fetch(`http://${globalConfig.cider.targetHosts[0]}/stop`).then(fres => { // send GET /stop to cider target
                    if (fres.status == 204) {
                        console.log(`${rreq.get("cf-connecting-ip")} POST /cider returned 200 KEY:${rreq.get("Authorization")}`)
                        rres.sendStatus(200) // if that works then 200
                    } else {
                        rres.sendStatus(500) // otherwise lol
                    }
                }).catch(ferror => {
                    rres.sendStatus(503) // and if a problem happens its probably cause cider target is unavailable
                })

            } else {
                console.log(`${rreq.get("cf-connecting-ip")} POST /cider returned 401`) // log ip of unauthorized requests
                rres.sendStatus(401) // received auth key was not in database
            }
        }
    })

})

// 2024-04-10: Retrieves currentPlayingSong JSON from specified Cider host and
// returns JSON containing the useful bits if successful, returning 1 if not.
async function getCurrentListening(host) { // Host should be hostname/ip & port only.
    timeSinceLastCiderQuery = Date.now(); // Save last time function was run, used to indicate when the cache needs refreshed.
    return await fetch(`http://${host}/currentPlayingSong`).then(fetchRes => {
        if (fetchRes.status == 502) {
            return 1 // If the upstream server returns 502 (Bad Gateway) then internally return 1, indicating error.
        } else {
            return fetchRes.json().then(jsonRes => {
                if (jsonRes.info.name == undefined) {
                    return 1 // If Cider is running but not playing a song this check prevents an undefined variable error.
                } else {
                    return { 
                        "songName": jsonRes.info.name,
                        "artistName": jsonRes.info.artistName,
                        "albumName": jsonRes.info.albumName,
                        "songLinkUrl": jsonRes.info.url.songLink,
                        "endtimeEpochInMs": jsonRes.info.endTime,
                        "artworkUrl": jsonRes.info.artwork.url.replace("{w}", jsonRes.info.artwork.width).replace("{h}", jsonRes.info.artwork.height)
                    }
                }
            })
        }
    }).catch(fetchError => {
        console.error("Error fetch()ing upstream Cider host: "+fetchError)
        return 1 // If something else happens then log it and return 1, indicating error.
    })
}

module.exports = {app} // export routes to be imported by index for execution