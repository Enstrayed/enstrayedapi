const { app, db, globalConfig } = require("../index.js") // Get globals from index

var timeSinceLastCiderQuery = Date.now()-2000;
var currentListening = {} // GET cache storage

app.get("/cider", (rreq,rres) => { // GET current listening from target

    if (Date.now() < timeSinceLastCiderQuery+2000) { // if it has been <2 seconds since last request
        rres.send(currentListening); // send cached json
        // console.log(`Sent cached response`);
    } else { 
        getCurrentListening().then(res => { // fetch JSON from target
            if (res == "unreachable") { // if fetch returned unreachable
                rres.sendStatus(503) // send service unavailable to requestee
            } else {
                currentListening = { // format source JSON and store to cache
                    "songName": res.info.name,
                    "artistName": res.info.artistName,
                    "albumName": res.info.albumName,
                    "songLinkUrl": res.info.url.songLink,
                    "endtimeEpochInMs": res.info.endTime
                };

                // Formats info.artwork.url from upstream Cider Endpoint
                let workingArtworkUrl = res.info.artwork.url
                workingArtworkUrl = workingArtworkUrl.replace("{w}",res.info.artwork.width)
                workingArtworkUrl = workingArtworkUrl.replace("{h}",res.info.artwork.height)
                currentListening.artworkUrl = workingArtworkUrl
    
                rres.set("Access-Control-Allow-Origin","*")
                rres.send(currentListening) // send freshly cached json
            }

        })
        // console.log(`Sent uncached response`);
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

async function getCurrentListening() { // async function to actually get and return the json (this is just adapted from the original gist)
    timeSinceLastCiderQuery = Date.now(); // update last query time
    return await fetch(`http://${globalConfig.cider.targetHosts[0]}/currentPlayingSong`).then(res => res.json()).catch(err => { // fetch, format and return JSON
        return "unreachable"
    })

}

module.exports = {app} // export routes to be imported by index for execution