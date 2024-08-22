const { app } = require("../index.js")

app.get("/api/ip", (rreq,rres) => {
    let jsonResponse = {
      "IP": rreq.get("cf-connecting-ip") || rreq.ip,
      "Country": rreq.get("cf-ipcountry") || "not_cloudflare",
      "CfRay": rreq.get("cf-ray") || "not_cloudflare"
    }

    rres.send(jsonResponse)
})

app.get("/api/headers", (rreq,rres) => {
  rres.send(rreq.headers)
})

module.exports = {app}