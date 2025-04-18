import { app, globalConfig } from "../index.js" // Get globals from index
import { checkTokenNew } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"
import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: globalConfig.email.host,
    port: 587,
    secure: false,
    auth: {
        user: globalConfig.email.username,
        pass: globalConfig.email.password
    }
})

app.post("/api/sendemail", (rreq,rres) => {
    checkTokenNew(rreq.get("Authorization"),"email").then(authRes => {
        if (authRes.result === false) {
            rres.sendStatus(401)
        } else if (authRes.result === true) { 
            if (rreq.body == undefined || rreq.body.recipient == undefined) { // 2024-05-11: Turbo bodge check to make sure request JSON is valid, probably wont work but whatever
                rres.sendStatus(400)
            } else {
                
                transporter.sendMail({
                    from: "Enstrayed API <enstrayedapi@enstrayed.com>",
                    to: rreq.body.recipient,
                    subject: rreq.body.subject ?? "Subject Not Set",
                    text: rreq.body.message ?? "Message Not Set"
                }).then(transportResponse => {
                    if (transportResponse.response.slice(0,1) === "2") {
                        logRequest(rres,rreq,200,transportResponse.response,authRes)
                        rres.status(200).send(transportResponse.response)
                    } else {
                        logRequest(rres,rreq,400,transportResponse.response,authRes)
                        rres.status(400).send(transportResponse.response)
                    }
                }).catch(transportError => {
                    logRequest(rres,rreq,500,transportError,authRes)
                    rres.sendStatus(500)
                })

            }
        }
    })
})

export {app}