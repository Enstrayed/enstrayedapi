import { app, globalConfig, fs, globalVersion } from "../index.js" // Get globals from index
import { execSync } from 'child_process'
import { checkToken } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"
import { marked } from "marked"

var timeSinceLastQuery = Date.now()-10000
var cachedResult = ""

app.get("/", (rreq, rres) => {
    if (Date.now() < timeSinceLastQuery+10000) {
        rres.send(cachedResult)
    } else {
        let indexFile = fs.readFileSync(process.cwd()+"/website/templates/indextemplate.html","utf-8")
        cachedResult = indexFile.replace("<!--SSR_BLOGPOSTS-->",parseFiles()).replace("<!--SSR_APIVERSION-->",`<sup>API Version ${globalVersion}</sup>`)
        rres.send(cachedResult)
    }
})

app.get("/static/*", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/static/"+rreq.url.replace("/static/",""))
})

app.get("/favicon.ico", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/static/bs.ico")
})

app.get("/posts/*", (rreq,rres) => {

    if (rreq.url.endsWith(".md")) {
        let file = fs.readFileSync(process.cwd()+"/website/templates/markdownposttemplate.html","utf-8")
        file = file.replace("<!--SSR_REPLACE_URL-->",`https://enstrayed.com${rreq.url}`)
        file = file.replaceAll("<!--SSR_REPLACE_TITLE-->",rreq.url.replace("/posts/","").slice(9).replace(/-/g," ").replace(".md",""))
        file = file.replace("<!--SSR_REPLACE_BODY-->",marked.parse(fs.readFileSync(process.cwd()+"/website/posts/"+rreq.url.replace("/posts/",""),"utf-8")))
        rres.send(file)
    } else {
        rres.sendFile(process.cwd()+"/website/posts/"+rreq.url.replace("/posts/",""))
    }
    
})

app.get("/urltoolbox", (rreq,rres) => {
    rres.send("Under construction")
})

app.post("/api/sync", (rreq,rres) => {
    checkToken(rreq.query.auth,"fpupdate").then(checkResponse => {
        if (checkResponse === true) {
            if (rreq.headers["x-github-event"] == "ping") {
                rres.sendStatus(200)
            } else if (rreq.headers["x-github-event"] == "push") {
                execSync("git pull")
                logRequest(rres,rreq,200,"Ran git pull, exiting to restart...")
                rres.sendStatus(200)
                process.exit(0)
            } else {
                logRequest(rres,rreq,400)
                rres.sendStatus(400)
            }
        } else {
            rres.sendStatus(401)
        }
    })
})

function parseFiles() {
    let files = fs.readdirSync(process.cwd()+"/website/posts")
    let result = ""

    for (let x in files) {
        if (files[x].endsWith(".html") === false && files[x].endsWith(".md") === false ) { break } // If file/dir is not .html or .md then ignore

        let date = files[x].split("-")[0]
        if (date < 10000000 || date > 99999999) { break } // If date does not fit ISO8601 format then ignore

        date = date.replace(/.{2}/g,"$&-").replace("-","").slice(0,-1) // Insert a dash every 2 characters, remove the first dash, remove the last character

        let name = files[x].slice(9).replace(/-/g," ").replace(".html","").replace(".md","") // Strip Date, replace seperator with space & remove file extension

        result = `<li>${date} <a href="/posts/${files[x]}">${name}</a></li>`+result
    }

    return result
}

export {app} 