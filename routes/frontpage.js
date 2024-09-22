import { app, globalConfig, fs, globalVersion } from "../index.js" // Get globals from index

var timeSinceLastQuery = Date.now()-10000
var cachedResult = ""

app.get("/static/*", (rreq,rres) => {
    rres.sendFile(globalConfig.frontpage.directory+"static/"+rreq.url.replace("/static/",""))
})

app.get("/posts/*", (rreq,rres) => {
    rres.sendFile(globalConfig.frontpage.directory+"posts/"+rreq.url.replace("/posts/",""))
})

app.get("/", (rreq, rres) => {
    if (Date.now() < timeSinceLastQuery+10000) {
        rres.send(cachedResult)
    } else {
        let indexFile = fs.readFileSync(globalConfig.frontpage.directory+"index.html","utf-8")
        cachedResult = indexFile.replace("<!--SSR_BLOGPOSTS-->",parseFiles()).replace("<!--SSR_APIVERSION-->",`<sup>API Version ${globalVersion}</sup>`)
        rres.send(cachedResult)
    }
})

function parseFiles() {
    let files = fs.readdirSync(globalConfig.frontpage.directory+"posts/")
    let result = ""

    for (let x in files) {
        if (files[x].endsWith(".html") === false) { break } // If file/dir is not .html then ignore

        let date = files[x].split("-")[0]
        if (date < 10000000 || date > 99999999) { break } // If date does not fit ISO8601 format then ignore

        date = date.replace(/.{2}/g,"$&-").replace("-","").slice(0,-1) // Insert a dash every 2 characters, remove the first dash, remove the last character

        let name = files[x].slice(9).replace(/-/g," ").replace(".html","") // Strip Date, replace seperator with space & remove file extension

        result = `<span>${date} <a href="/posts/${files[x]}">${name}</a></span>`+result
    }

    return result
}

export {app} 