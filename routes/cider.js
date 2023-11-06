const { app, db, globalConfig } = require("../index.js") // Get globals from index

const date = new Date(); // Import Date for GET caching
timeSinceLastCiderQuery = Date.now()-2000;

currentListening = {} // GET cache storage

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
                    "artworkUrl": res.info.artwork.url,
                    "songLinkUrl": res.info.url.songLink
                };
    
                rres.send(currentListening) // send freshly cached json
            }

        })
        // console.log(`Sent uncached response`);
    }

})

app.post("/cider", (rreq,rres) => { // POST stop listening on cider target
    db.get(globalConfig.cider.authKeyInDb).then(dbres => { // get auth keys from database
        if (dbres == null) { // if key in db is null (non existant) then return 500 to requestee
            console.log("ERROR: Configured key containing cider authkeys is null")
            rres.sendStatus(500)
        } else {
            let validKeys = dbres.split(','); // format keys (stored as csv)
            if (validKeys.includes(rreq.get("Authorization"))) { // if Authorization header exists in formatted keys array
                
                fetch(`http://${globalConfig.cider.targetHost}:${globalConfig.cider.targetPort}/stop`).then(fres => { // send GET /stop to cider target
                    if (fres.status == 204) {
                        rres.sendStatus(200) // if that works then 200
                    } else {
                        rres.sendStatus(500) // otherwise lol
                    }
                }).catch(ferror => {
                    rres.sendStatus(503) // and if a problem happens its probably cause cider target is unavailable
                })

            } else {
                console.log(`${rreq.ip} POST /cider returned 401`) // TODO: get actual request IP from cloudflare header, this will just log the CF edge IP for now
                rres.sendStatus(401) // received auth key was not in database
            }
        }
    })
})

async function getCurrentListening() { // async function to actually get and return the json (this is just adapted from the original gist)
    timeSinceLastCiderQuery = Date.now(); // update last query time
    return await fetch(`http://${globalConfig.cider.targetHost}:${globalConfig.cider.targetPort}/currentPlayingSong`).then(res => res.json()).catch(err => { // fetch, format and return JSON
        return "unreachable"
    })

}

module.exports = {app} // export routes to be imported by index for execution