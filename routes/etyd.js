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
                            
//                         }


//                     case "delete":
//                         db.get(rreq.body.target).then(dbres => {
//                             if (dbres == null) { //if key doesnt exist then log and return 400
//                                 console.log(`${rreq.get("cf-connecting-ip")} POST /etydwrite ACTION delete returned 400 KEY:${rreq.get("Authorization")}`)
//                                 rres.set("Access-Control-Allow-Origin","*")
//                                 rres.sendStatus(400)
//                             } else {

//                             }
//                         })
                        

//                     default:
//                         rres.set("Access-Control-Allow-Origin","*")
//                         rres.sendStatus(400) // request json didnt include a valid action
//                 }

//             } else { // if it doesnt then its a unauthorized request
//                 console.log(`${rreq.get("cf-connecting-ip")} POST /etydwrite returned 401`)
//                 rres.set("Access-Control-Allow-Origin","*")
//                 rres.sendStatus(401)
//             }
//         }
//     })
// })

module.exports = {app} // export routes to be imported by index for execution