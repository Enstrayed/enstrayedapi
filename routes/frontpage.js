import { app, globalConfig, fs, globalVersion } from "../index.js" // Get globals from index
import { parsePosts } from "../liberals/directoryparsing.js"
import { marked } from "marked"

var timeSinceLastQuery = Date.now()-10000
var cachedResult = ""

app.get("/", (rreq, rres) => {
    if (Date.now() < timeSinceLastQuery+10000) {
        rres.send(cachedResult)
    } else {
        let indexFile = fs.readFileSync(process.cwd()+"/website/templates/newindextemplate.html","utf-8")
        cachedResult = indexFile.replace("<!--SSR_BLOGPOSTS-->",parsePosts()).replace("<!--SSR_APIVERSION-->",`<sup>API Version ${globalVersion}</sup>`)
        rres.send(cachedResult)
    }
})

// app.get("/", (rreq, rres) => {
//     rres.sendFile(process.cwd()+"/website/templates/construction.html")
// })

app.get("/static/*", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/static/"+rreq.url.replace("/static/",""))
})

app.get("/favicon.ico", (rreq,rres) => {
    rres.sendFile(process.cwd()+"/website/static/snow-leopard.ico")
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

export {app} 