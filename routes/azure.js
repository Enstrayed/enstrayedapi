const { app, db, globalConfig } = require("../index.js") // Get globals from index
const { EmailClient } = require("@azure/communication-email");
const azureEmail = new EmailClient(globalConfig.azure.connectionString)



app.post("/sendemail", (rreq,rres) => {

    db.get(globalConfig.azure.authKeyInDb).then(dbres => {
        if (dbres == null) {
            console.log("ERROR: Configured key containing azure authkeys is null")
            rres.sendStatus(500)
        } else {
            let validKeys = dbres.split(',')
            if (validKeys.includes(rreq.get("Authorization"))) {

                let message = {
                    senderAddress: globalConfig.azure.senderAddress,
                    content: {
                        subject: rreq.body.message.subject,
                        plainText: rreq.body.message.content,
                    },
                    recipients: {
                        to: [
                            {
                                address: rreq.body.recipient.emailAddr,
                                displayName: rreq.body.recipient.emailName,
                            },
                        ],
                    },
                }

                azureEmail.beginSend(message).then(ares => {
                    rres.sendStatus(200)
                }).catch(err => {
                    rres.sendStatus(500)
                    console.log(err)
                })

            } else {
                console.log(`${rreq.ip} POST /sendemail returned 401`)
                rres.sendStatus(401)
            }
        }
    })

})


module.exports = {app} // export routes to be imported by index for execution