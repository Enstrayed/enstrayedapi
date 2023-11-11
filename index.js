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

app.use(express.json()) // Allows receiving JSON bodies
// see important note: https://expressjs.com/en/api.html#express.json

fs.readdir(globalConfig.routesDirectory, (err, files) => {
    if (err) {
        console.log("FATAL: Unable to read ./routes")
    } else {
        let importedRoutes = []
        files.forEach(file => {
            importedRoutes.push(file)
            require(`${globalConfig.routesDirectory}/${file}`)
        })
        console.log(`Imported Routes: ${importedRoutes}`)
    }
})

console.log(`Started on ${globalConfig.apiPort}`)
app.listen(globalConfig.apiPort);``