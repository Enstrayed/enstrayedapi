const { app, globalConfig } = require("../index.js")
const { queryLastfm } = require("../liberals/nowplaying.js")

var timeSinceLastLastfmQuery = Date.now()-5000
var cachedLastfmResult = {}

const notPlayingAnythingPlaceholder = {
    "json": {
        "playing": false
    },
    "html": `<span>I'm not currently listening to anything.</span>`
}

app.get("/nowplaying", (rreq,rres) => {

    if (Date.now() < timeSinceLastLastfmQuery+5000) {
        rres.send(cachedLastfmResult[rreq.query.format] ?? cachedLastfmResult.json)
    } else {
        timeSinceLastLastfmQuery = Date.now()
        queryLastfm().then(response => {
            if (response == 1) {
                cachedLastfmResult = notPlayingAnythingPlaceholder
            } else {
                cachedLastfmResult = response
            }

            rres.send(cachedLastfmResult[rreq.query.format] ?? cachedLastfmResult.json)
        })
    }

})

module.exports = {app}