const fs = require('fs');         // Filesystem Access
const express = require('express'); 
const app = express();            // Init Express

function criticalFileLoader(file) {
    try {
        return fs.readFileSync(file, 'utf-8')
    } catch {
        console.error(`FATAL: Failed to load ${file}`)
        process.exit(1)
    }
}

const globalConfig = JSON.parse(criticalFileLoader('config.json'))
const globalVersion = criticalFileLoader('GITVERSION').split(" ")[0]

module.exports = { app, globalConfig, fs } // Export express app and fs objects and globalconfig

app.use(express.json()) // Allows receiving JSON bodies
// see important note: https://expressjs.com/en/api.html#express.json

process.on('SIGTERM', function() {
    console.log("Received SIGTERM, exiting...")
    process.exit(0)
})

// Import Routes
fs.readdir(globalConfig.startup.routesDir, (err, files) => {
    if (err) {
        console.log(`FATAL: Unable to read ${globalConfig.startup.routesDir}`)
        process.exit(1)
    } else {
        let importedRoutes = []
        files.forEach(file => {
            require(`${globalConfig.startup.routesDir}/${file}`)
            importedRoutes.push(file.slice(0,-3))
        })
        console.log(`Imported Routes: ${importedRoutes}`)
    }
})

app.get("/", (rreq,rres) => {
    rres.send(`Enstrayed API | Version: ${globalVersion} | Documentation: <a href="https://etyd.cc/apidocs">etyd.cc/apidocs</a>`)
})

console.log(`Enstrayed API | Version: ${globalVersion} | Port: ${globalConfig.startup.apiPort}`)
app.listen(globalConfig.startup.apiPort)