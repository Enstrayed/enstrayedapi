const { app, globalConfig, fs } = require("../index.js") // Get globals from index

var timeSinceLastQuery = Date.now()-10000
var cachedResult = {}

app.get("/blogposts", (rreq, rres) => {

    if (Date.now() < timeSinceLastQuery+10000) { // if it has been <10 seconds since last request
        rres.set("Access-Control-Allow-Origin","*")
        rres.send(cachedResult) // send cached json
    } else {
        timeSinceLastQuery = Date.now()
        cachedResult = parseFiles()
        rres.set("Access-Control-Allow-Origin","*")
        rres.send(cachedResult);
    }

})

function parseFiles() {
    let files = fs.readdirSync(globalConfig.blog.postsDirectory)
    let parsedFiles = []

    for (x in files) {
        if (files[x].endsWith(".html") === false) { break } // If file/dir is not .html then ignore

        let date = files[x].split("-")[0]
        if (date < 10000000 || date > 99999999) { break } // If date does not fit ISO8601 format then ignore

        date = date.replace(/.{2}/g,"$&-").replace("-","").slice(0,-1) // Insert a dash every 2 characters, remove the first dash, remove the last character

        let name = files[x].slice(9).replace(/÷/g," ").replace(".html","") // Strip Date, replace seperator with space & remove file extension

        parsedFiles.push({ "date": date, "name": name, "path": `${globalConfig.blog.postsDirUrl}/${files[x]}`}) // Add metadata as JSON to array
    }

    return parsedFiles.reverse()
}

module.exports = {app} 