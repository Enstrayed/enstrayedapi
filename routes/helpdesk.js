import { app } from "../index.js"

app.get("/helpdesk", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/templates/landing.html")
})

app.get("/helpdesk/articles/*", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/kbas/"+rreq.url.replace("/helpdesk/articles/",""))
})

export { app }