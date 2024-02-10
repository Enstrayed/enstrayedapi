const { app, db, globalConfig } = require("../index.js") // Get globals from index

function makeRandomHex() {
    const characters = "1234567890abcdef"
    let counter = 0
    let result = ""
    while (counter < globalConfig.etyd.randomHexLength) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
        counter += 1
    }
    return result
}

app.options("/etydwrite", (rreq,rres) => {
    rres.set("Access-Control-Allow-Headers","Authorization")
    rres.set("Access-Control-Allow-Origin","*")
    rres.sendStatus(204)
})

// app.post("/etydwrite", (rreq,rres) => {
//     db.get(globalConfig.etyd.authKeyInDb).then(dbres => {

//         if (dbres == null) { // If authkey key doesnt exist in redis then error out
//             console.log("ERROR: Configured key containing etyd authkeys is null")
//             rres.sendStatus(500)
//         } else { // if it does exist
//             let validKeys = dbres.split(",") // split the string into an array
//             if (validKeys.includes(rreq.get("Authorization"))) { // check if authorization header key exists in that array

//                 console.log(rreq.body)

//                 switch(rreq.body.action) {
//                     case "set": // Write to db

//                         if (rreq.body.random == true) {

//                             let workingTarget = makeRandomHex()

//                             db.get(`/${workingTarget}`).then(dbres => {
//                                 if (dbres != null) {
//                                     let workingTarget = makeRandomHex()

//                                     db.get(`/${workingTarget}`).then(dbres => {
//                                         if (dbres != null) {
//                                             // well fuck
//                                             rres.sendStatus(409)

//                                         }
//                                     })

//                                 } else {
//                                     db.set(`/${workingTarget}`,rreq.body.value)
//                                     rres.send(`https://etyd.cc/${workingTarget}`)
//                                 }
//                             })

//                         } else {

//                             db.get(rreq.body.target).then(dbres => { // check if key already exists
//                                 if (dbres != null) { // if it does then send 409 conflict
//                                     console.log(`${rreq.get("cf-connecting-ip")} POST /etydwrite ACTION set returned 409 KEY:${rreq.get("Authorization")}`)
//                                     rres.sendStatus(409)
//                                 } else { 
//                                     db.set(`/${rreq.body.target}`,rreq.body.value)
//                                     rres.send(`https://etyd.cc/${rreq.body.target}`)
//                                 }
//                             })

//                         }
//                         break;


//                     case "delete":
//                         db.get(`/${rreq.body.target}`).then(dbres => {
//                             if (dbres == null) { //if key doesnt exist then log and return 400
//                                 console.log(`${rreq.get("cf-connecting-ip")} POST /etydwrite ACTION delete returned 400 KEY:${rreq.get("Authorization")}`)
//                                 rres.sendStatus(400)
//                             } else {
//                                 db.del(`/${rreq.body.target}`)
//                                 rres.sendStatus(200)
//                             }
//                         })
//                         break;
                        

//                     default:
//                         rres.sendStatus(400) // request json didnt include a valid action
//                         break;
//                 }

//             } else { // if it doesnt then its a unauthorized request
//                 console.log(`${rreq.get("cf-connecting-ip")} POST /etydwrite returned 401`)
//                 rres.sendStatus(401)
//             }
//         }
//     })
// })

module.exports = {app} // export routes to be imported by index for execution