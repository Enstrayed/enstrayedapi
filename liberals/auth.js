const { globalConfig } = require("../index.js")

async function checkToken(token,scope) {
    return await fetch(`${globalConfig.couchdbHost}/auth/sessions`).then(fetchRes => {

        // CouchDB should only ever return 200/304 for success so this should work
        // https://docs.couchdb.org/en/stable/api/document/common.html#get--db-docid
        if (fetchRes.status !== 200 || fetchRes.status !== 304) { 
            console.log(`ERROR: auth.js: Database request returned ${fetchRes.status}`)
            return false
        } else {

            return fetchRes.json().then(dbRes => { 

                if (dbRes.sessions[token] == undefined) { // If the token is not on the sessions list then reject
                    return false
                } else if (dbRes.sessions[token].scopes.includes(scope)) { // If the token is on the seesions list and includes the scope then accept
                    return true
                } else { // Otherwise reject
                    return false
                }

            })
        }

    }).catch(error => {
        console.log("ERROR: auth.js: " + error)
        return false
    })
}

module.exports = {checkToken}