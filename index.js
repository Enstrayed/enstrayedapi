import * as fs from 'fs'
import { execSync } from 'child_process'
import postgres from 'postgres'
import express, { json } from 'express'
import cookieParser from 'cookie-parser'

const app = express()

if (!process.env.DATABASE_URL) {
    console.log("FATAL: DATABASE_URI must be set")
    process.exit(1)
}

const db = postgres(process.env.DATABASE_URL)

const globalConfig = await db`select content from config where id = ${process.env.CONFIG_OVERRIDE ?? 'production'}`.then(response => {return response[0]["content"]}).catch(error => {
    console.log(`FATAL: Error occured in downloading configuration: ${error}`)
    process.exit(1)
})

const globalVersion = execSync(`git show --oneline -s`).toString().split(" ")[0]
// Returns ISO 8601 Date & 24hr time for UTC-7/PDT
const startTime = new Date(new Date().getTime() - 25200000).toISOString().slice(0,19).replace('T',' ')

export { app, fs, db, globalConfig, globalVersion }

app.use(json()) // Allows receiving JSON bodies
// see important note: https://expressjs.com/en/api.html#express.json
app.use(cookieParser()) // Allows receiving cookies

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

// app.use(function(req,res,next) {
//     res.status(404).send("miau")
// })

process.stdout.write(`>>> EnstrayedAPI ${globalVersion} | Started ${startTime} on ${process.env.API_PORT ?? 8081}`)
app.listen(process.env.API_PORT ?? 8081)