const { app, db, globalConfig } = require("../index.js")

const date = new Date();
timeSinceLastCiderQuery = Date.now()-2000;

currentListening = {}

app.get("/cider", (rreq,rres) => {

    if (Date.now() < timeSinceLastCiderQuery+2000) {
        rres.send(currentListening);
        // console.log(`Sent cached response`);
    } else {
        getCurrentListening().then(res => {
            if (res == "unreachable") {
                rres.sendStatus(503)
            } else {
                currentListening = {
                    "songName": res.info.name,
                    "artistName": res.info.artistName,
                    "albumName": res.info.albumName,
                    "artworkUrl": res.info.artwork.url,
                    "songLinkUrl": res.info.url.songLink
                };
    
                rres.send(currentListening)
            }

        })
        // console.log(`Sent uncached response`);
    }

})

app.post("/cider", (rreq,rres) => {
    db.get(globalConfig.cider.authKeyInDb).then(dbres => {
        if (dbres == null) {
            console.log("ERROR: Configured key containing cider authkeys is null")
        } else {
            let validKeys = dbres.split(',');
            if (validKeys.includes(rreq.get("Authorization"))) {
                
                fetch(`http://${globalConfig.cider.targetHost}:${globalConfig.cider.targetPort}/stop`).then(fres => {
                    if (fres.status == 204) {
                        rres.sendStatus(200)
                    } else {
                        rres.sendStatus(500)
                    }
                }).catch(ferror => {
                    rres.sendStatus(503)
                })

            } else {
                console.log(`${rreq.ip} POST /cider returned 401`)
                rres.sendStatus(401)
            }
        }
    })
})

async function getCurrentListening() {
    timeSinceLastCiderQuery = Date.now();
    return await fetch(`http://${globalConfig.cider.targetHost}:${globalConfig.cider.targetPort}/currentPlayingSong`).then(res => res.json()).catch(err => {
        return "unreachable"
    })

}

module.exports = {app}