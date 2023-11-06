const fs = require('fs');         // Filesystem Access
const express = require('express'); 
const app = express();            // Init Express
const Redis = require('ioredis'); // Init Redis

const globalConfig = JSON.parse(fs.readFileSync('config.json', 'utf-8')) // Read config file

const db = new Redis({
    host: globalConfig.redisServer,    
    port: globalConfig.redisPort
})
module.exports = { app, db, globalConfig } // Export database connection for other files

fs.readdir("./routes", (err, files) => {
    if (err) {
        console.log("FATAL: Unable to read ./routes")
    } else {
        let importedRoutes = []
        files.forEach(file => {
            importedRoutes.push(file)
            require(`./routes/${file}`)
        })
        console.log(`Imported Routes: ${importedRoutes}`)
    }
})

console.log(`Started on ${globalConfig.apiPort}`)
app.listen(globalConfig.apiPort);``