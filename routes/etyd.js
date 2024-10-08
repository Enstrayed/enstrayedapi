import { app, globalConfig } from "../index.js" // Get globals from index
import { checkToken } from "../liberals/auth.js"
import { logRequest } from "../liberals/logging.js"

app.get("/api/etyd*", (rreq,rres) => {
    fetch(`${process.env.API_DBHOST}/etyd${rreq.path.replace("/api/etyd","")}`,{
        headers: { "Authorization": `Basic ${btoa(process.env.API_DBCRED)}`}
    }).then(dbRes => {
        if (dbRes.status == 404) {
            rres.sendStatus(404)
        } else {
            dbRes.json().then(dbRes => {
                try { 
                    rres.redirect(dbRes.content.url) // Node will crash if the Database entry is malformed
                } catch (responseError) {
                    logRequest(rres,rreq,500,responseError)
                    rres.sendStatus(500)
                }
            })
        }
    }).catch(fetchError => {
        logRequest(rres,rreq,500,fetchError)
        rres.sendStatus(500)
    })
})

// app.delete("/api/etyd*", (rreq,rres) => {

//     if (rreq.get("Authorization") === undefined) {
//         rres.sendStatus(400)
//     } else {
//         checkToken(rreq.get("Authorization"),"etyd").then(authRes => {
//             if (authRes === false) {
//                 rres.sendStatus(401)
//             } else if (authRes === true) { // Authorization successful

//                 fetch(`${process.env.API_DBHOST}/etyd${rreq.path.replace("/api/etyd", "")}`,{
//                     headers: { "Authorization": `Basic ${btoa(process.env.API_DBCRED)}`}
//                 }).then(dbRes => {

//                     if (dbRes.status == 404) {
//                         rres.sendStatus(404) // Entry does not exist
//                     } else {
//                         dbRes.json().then(dbRes => {
                            
//                             fetch(`${process.env.API_DBHOST}/etyd${rreq.path.replace("/api/etyd", ""),{
//                                 headers: { "Authorization": `Basic ${btoa(process.env.API_DBCRED)}`}
//                             }}`, {
//                                 method: "DELETE",
//                                 headers: {
//                                     "If-Match": dbRes["_rev"] // Using the If-Match header is easiest for deleting entries in couchdb
//                                 }
//                             }).then(fetchRes => {
//                                 if (fetchRes.status == 200) {
//                                     // console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 200 KEY: ${rreq.get("Authorization")}`)
//                                     logRequest(rres,rreq,200)
//                                     rres.sendStatus(200)
//                                 }
//                             }).catch(fetchError => {
//                                 // console.log(`${rres.get("cf-connecting-ip")} DELETE ${rreq.path} returned 500: ${fetchError}`)
//                                 logRequest(rres,rreq,500,fetchError)
//                                 rres.sendStatus(500)
//                             })

//                         })
//                     }

//                 }).catch(fetchError => {
//                     logRequest(rres,rreq,500,fetchError)
//                     rres.sendStatus(500)
//                 })

//             }
//         })
//     }

// })

// app.post("/api/etyd*", (rreq,rres) => {

//     if (rreq.get("Authorization") === undefined) {
//         rres.sendStatus(400)
//     } else {
//         checkToken(rreq.get("Authorization"),"etyd").then(authRes => {
//             if (authRes === false) {
//                 rres.sendStatus(401)
//             } else if (authRes === true) { // Authorization successful

//                 if (rreq.body["url"] == undefined) {
//                     rres.sendStatus(400)
//                 } else {
//                     fetch(`${process.env.API_DBHOST}/etyd${rreq.path.replace("/api/etyd", ""),{
//                         headers: { "Authorization": `Basic ${btoa(process.env.API_DBCRED)}`}
//                     }}`, { 
//                         method: "PUT",
//                         body: JSON.stringify({
//                             "content": {
//                                 "url": rreq.body["url"]
//                             }
//                         })
//                     }).then(dbRes => {
    
//                         switch(dbRes.status) {
//                             case 409:
//                                 rres.sendStatus(409)
//                                 break;

//                             case 201:
//                                 rres.status(200).send(rreq.path.replace("/api/etyd", ""))
//                                 break;

//                             default:
//                                 logRequest(rres,rreq,500,`CouchDB PUT did not return expected code: ${dbRes.status} ${dbRes.statusText}`)
//                                 rres.sendStatus(500)
//                                 break;
//                         }
    
//                     }).catch(fetchError => {
//                         logRequest(rres,rreq,500,fetchError)
//                         rres.sendStatus(500)
//                     })
//                 }

//             }
//         })
//     }

// })

export {app} // export routes to be imported by index for execution