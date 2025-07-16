import { app, fs } from "../index.js"

app.get("/dynamic/icon/*", (rreq, rres) => {
    try {
        let file = fs.readFileSync(process.cwd()+`/website/dynamic/icons/${rreq.path.split("/")[3]}.svg`,"utf-8")
        file = file.replace("<!--DYN_REPLACECOLOR-->", "#"+rreq.path.split("/")[4].slice(0,6))
        rres.setHeader("Content-Type","image/svg+xml").send(file)
    } catch {
        rres.sendStatus(404)
    }
})