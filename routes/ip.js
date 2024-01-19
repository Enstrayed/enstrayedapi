const { app } = require("../index.js")

app.get("/ip", (rreq,rres) => {
    let jsonResponse = {
      "IP": rreq.get("cf-connecting-ip") || "you_did",
      "Country": rreq.get("cf-ipcountry") || "not_connect",
      "CfRay": rreq.get("cf-ray") || "via_cloudflare"
    }

    rres.send(jsonResponse);
})

module.exports = {app}