const { app, db, globalConfig } = require("../index.js") // Get globals from index

app.post("/sendemail", (rreq,rres) => {

    db.get(globalConfig.mailjet.authKeyInDb).then(dbres => {
        if (dbres == null) {
            console.log("ERROR: Configured key containing mailjet authkeys is null")
            rres.sendStatus(500)
        } else {
            let validKeys = dbres.split(',')
            if (validKeys.includes(rreq.get("Authorization"))) {

                let message = {
                    "Messages": [
                        {
                            "From": {
                                "Email": globalConfig.mailjet.senderAddress,
                                "Name": globalConfig.mailjet.senderName,
                            },
                            "To": [
                                {
                                    "Email": rreq.body.recipient.emailAddr,
                                    "Name": rreq.body.recipient.emailName,
                                }
                            ],

                            "Subject": rreq.body.message.subject,
                            "TextPart": rreq.body.message.content,
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
                        db.incr(`${globalConfig.mailjet.usageKeyPrefix}${rreq.get("Authorization")}`)
                        console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 200 KEY:${rreq.get("Authorization")}`)
                        rres.sendStatus(200)
                    } else {
                        console.log(`Mailjet Fetch returned result other than OK: ${fetchRes.status} ${fetchRes.statusText}`)
                        rres.sendStatus(500)
                    }
                })

            } else {
                console.log(`${rreq.get("cf-connecting-ip")} POST /sendemail returned 401`)
                rres.sendStatus(401)
            }
        }
    })

})

module.exports = {app} // export routes to be imported by index for execution