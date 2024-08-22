const { app, globalConfig } = require("../index.js") // Get globals from index
const { checkToken } = require("../liberals/auth.js")
const { logRequest } = require("../liberals/logging.js")

app.post("/api/sendemail", (rreq,rres) => {
    checkToken(rreq.get("Authorization"),"mailjet").then(authRes => {
        if (authRes === false) {
            rres.sendStatus(401)
        } else if (authRes === true) { 
            if (rreq.body == undefined || rreq.body.recipient == undefined) { // 2024-05-11: Turbo bodge check to make sure request JSON is valid, probably wont work but whatever
                rres.sendStatus(400)
            } else {
                let message = {
                    "Messages": [{
                            "From": { "Email": globalConfig.mailjet.senderAddress },
                            "To": [{ "Email": rreq.body.recipient, }],
                            "Subject": rreq.body.subject || "Request did not include a subject.",
                            "TextPart": rreq.body.message || "Request did not include a message.",
                        }]
                }

                fetch("https://api.mailjet.com/v3.1/send", {
                    method: "POST",
                    headers: {
                        "Authorization": `Basic ${btoa(globalConfig.mailjet.apiKey)}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(message)
                }).then(fetchRes => {
                    if (fetchRes.status == 200) {
                        logRequest(rres,rreq,200)
                        rres.sendStatus(200)
                    } else {
                        logRequest(rres,rreq,500,`Mailjet fetch did not return OK: ${fetchRes.status} ${fetchRes.statusText}`)
                        rres.sendStatus(500)
                    }
                })
            }
        }
    })
})

module.exports = {app}