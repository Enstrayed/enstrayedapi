import { app, fs } from "../index.js"
import { marked } from "marked"

app.get("/helpdesk", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/templates/landing.html")
})

app.get("/helpdesk/articles", (rreq, rres) => {
    rres.send("miau")
})

app.get("/helpdesk/articles/*", (rreq, rres) => {
    if (rreq.url.endsWith(".md")) {
        let file = fs.readFileSync(process.cwd() + "/website/helpdesk/templates/article.html", "utf-8")
        file = file.replace("<!--SSR_REPLACE_URL-->", `https://enstrayed.com${rreq.url}`)
        file = file.replaceAll("<!--SSR_REPLACE_TITLE-->", rreq.url.replace("/helpdesk/articles/", "").replace(/(-|_)/g, " ").replace(".md", ""))
        file = file.replace("<!--SSR_REPLACE_BODY-->", marked.parse(fs.readFileSync(process.cwd() + "/website/helpdesk/kbas/" + rreq.url.replace("/helpdesk/articles/", ""), "utf-8")))
        rres.send(file)
    } else {
        rres.sendFile(process.cwd() + "/website/helpdesk/kbas" + rreq.url.replace("/helpdesk/articles/", ""))
    }
})

app.get("/helpdesk/ticket/new", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/templates/newticket.html")
})

app.get("/api/helpdesk/forms/*", (rreq, rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/forms/"+rreq.url.replace("/api/helpdesk/forms/",""))
})

app.get("/helpdesk/static/*", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/helpdesk/static/"+rreq.url.replace("/helpdesk/static/",""))
})

export { app }