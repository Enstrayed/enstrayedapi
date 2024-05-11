const { app, db, globalConfig } = require("../index.js") // Get globals from index

app.post("/sendemail", (rreq,rres) => {

    fetch(`http://${globalConfig.couchdb.host}/apiauthkeys/${globalConfig.mailjet.authKeysDoc}`, {
        headers: {
            "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
        }
    }).then(dbRes => dbRes.json()).then(dbRes => {

        if (dbRes.status == 404) { // If document containing mailjet auth keys does not exist
            console.log(`ERROR: Could not find apiauthkeys/${globalConfig.mailjet.authKeysDoc}`)
            rres.sendStatus(500) // Refuse request
        } else {
            if (dbRes["content"][rreq.get("Authorization").split("_")[0]] === rreq.get("Authorization").split("_")[1]) {

                // 2024-05-11: Turbo bodge check to make sure request JSON is valid, probably wont work but whatever
                if (rreq.body == undefined || rreq.body.recipient == undefined) {
                    console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 400 KEY:${rreq.get("Authorization").split("_")[1]}`)
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

                

            } else {
                console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 401`) // log ip of unauthorized requests
                rres.sendStatus(401) // received auth key was not in database
            }
        }
    })

})

module.exports = {app} // export routes to be imported by index for execution