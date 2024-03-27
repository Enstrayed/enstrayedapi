const fs = require('fs');         // Filesystem Access
const express = require('express'); 
const app = express();            // Init Express

const globalConfig = JSON.parse(fs.readFileSync('config.json', 'utf-8')) // Read config file

module.exports = { app, globalConfig, fs } // Export express app and fs objects and globalconfig

app.use(express.json()) // Allows receiving JSON bodies
// see important note: https://expressjs.com/en/api.html#express.json

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
    rres.redirect(globalConfig.startup.documentationUrl)
})

console.log(`Started on ${globalConfig.startup.apiPort}`)
app.listen(globalConfig.startup.apiPort)