const { app, globalConfig } = require("../index.js")

app.get("/nowplaying", (rreq,rres) => {
    if (rreq.query.format === "html") {
        rres.send("<span>The /nowplaying endpoint is currently under construction.</span>")
    } else {
        rres.send({"message":"The /nowplaying endpoint is currently under construction."})
    }
})

module.exports = {app}