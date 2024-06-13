const { app, globalConfig } = require("../index.js") // Get globals from index
const { checkAuthorization } = require("../liberals/authorization.js")

app.post("/sendemail", (rreq,rres) => {

    checkAuthorization(globalConfig.mailjet.authKeysDoc,rreq.get("Authorization")).then(authRes => {
        if (authRes === false) { // If the supplied authorization is invalid or an error occured

            console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 401`) // Log the request
            rres.sendStatus(401) // Return 401 Unauthorized

        } else if (authRes === true) { // If the authorization was valid, continue function

            // 2024-05-11: Turbo bodge check to make sure request JSON is valid, probably wont work but whatever
            if (rreq.body == undefined || rreq.body.recipient == undefined) {
                console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 400 KEY:${rreq.get("Authorization").split("_")[0]}`)
                rres.sendStatus(400)
            } else {
                
                let message = {
                    "Messages": [
                        {
                            "From": {
                                "Email": globalConfig.mailjet.senderAddress,
                                "Name": globalConfig.mailjet.senderName,
                            },
                            "To": [
                                {
                                    "Email": rreq.body.recipient,
                                }
                            ],

                            "Subject": rreq.body.subject || "Request did not include a subject.",
                            "TextPart": rreq.body.message || "Request did not include a message.",
                        }
                    ]
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
                        console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 200 KEY:${rreq.get("Authorization").split("_")[1]}`)
                        rres.sendStatus(200)
                    } else {
                        console.log(`Mailjet Fetch returned result other than OK: ${fetchRes.status} ${fetchRes.statusText}`)
                        rres.sendStatus(500)
                    }
                })
            }
        }
    })

})

module.exports = {app} // export routes to be imported by index for execution