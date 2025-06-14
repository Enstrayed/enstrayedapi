import { app } from "../index.js"

app.get("/helpdesk", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/templates/landing.html")
})

app.get("/helpdesk/articles/*", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/kbas/"+rreq.url.replace("/helpdesk/articles/",""))
})

app.get("/helpdesk/ticket/new", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/templates/newticket.html")
})

app.get("/api/helpdesk/forms/*", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/forms/"+rreq.url.replace("/api/helpdesk/forms/",""))
})

export { app }