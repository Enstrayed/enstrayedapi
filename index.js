import * as fs from 'fs'
import { execSync } from 'child_process'
import express, { json } from 'express'
const app = express()

if (!process.env.API_DBHOST || !process.env.API_DBCRED) {
    console.log("FATAL: API_DBHOST and API_DBCRED must be set")
    process.exit(1)
}

const globalConfig = await fetch(`${process.env.API_DBHOST}/config/${process.env.API_DBCRED.split(":")[0]}`,{
    headers: { "Authorization": `Basic ${btoa(process.env.API_DBCRED)}`}
}).then(response => {
    if (response.status !== 200) {
        console.log(`FATAL: Failed to download configuration: ${response.status} ${response.statusText}`)
        process.exit(1)
    } else {
        return response.json()
    }
})
var globalVersion = execSync(`git show --oneline -s`).toString().split(" ")[0]
// Returns ISO 8601 Date & 24hr time for UTC-7/PDT
const startTime = new Date(new Date().getTime() - 25200000).toISOString().slice(0,19).replace('T',' ')

export { app, fs, globalConfig, globalVersion }

app.use(json()) // Allows receiving JSON bodies
// see important note: https://expressjs.com/en/api.html#express.json

process.on('SIGTERM', function() {
    console.log("Received SIGTERM, exiting...")
    process.exit(0)
})

fs.readdir("./routes", (err, files) => {
    if (err) {
        console.log(`FATAL: Unable to import routes: ${err}`)
        process.exit(1)
    } else {
        let importedRoutes = []
        files.forEach(file => {
            import(`./routes/${file}`)
            importedRoutes.push(file.slice(0,-3))
        })
        process.stdout.write(` | Imported ${importedRoutes} \n`)
    }
})

process.stdout.write(`>>> EnstrayedAPI ${globalVersion} | Started ${startTime} on ${process.env.API_PORT ?? 8081}`)
app.listen(process.env.API_PORT ?? 8081)