import { app, globalConfig } from "../index.js"
import { queryLastfm } from "../liberals/libnowplaying.js"

var timeSinceLastLastfmQuery = Date.now()-5000
var cachedLastfmResult = {}

app.get("/api/nowplaying", (rreq,rres) => {

    if (Date.now() < timeSinceLastLastfmQuery+5000) {
        rres.send(cachedLastfmResult[rreq.query.format] ?? cachedLastfmResult.json)
    } else {
        timeSinceLastLastfmQuery = Date.now()
        queryLastfm().then(response => {
            if (response == {}) {
                cachedLastfmResult = notPlayingAnythingPlaceholder
            } else {
                cachedLastfmResult = response
            }

            rres.send(cachedLastfmResult[rreq.query.format] ?? cachedLastfmResult.json)
        })
    }

})

export {app}