const { globalConfig } = require("../index.js")

async function checkAuthorization(documentToUse,keyToCheck) {
    return await fetch(`http://${globalConfig.couchdb.host}/apiauthkeys/${documentToUse}`, {
        headers: {
            "Authorization": `Basic ${btoa(globalConfig.couchdb.authorization)}`
        }
    }).then(fetchRes => {

        if (fetchRes.status === 404) { // If document doesnt exist fail gracefully

            console.log("ERROR: Failed to check authorization: Requested document returned 404")
            return false

        } else if (fetchRes.status === 401) { // If couchdb is reporting unauthorized fail gracefully

            console.log("ERROR: Failed to check authorization: Database authorization is incorrect")
            return false

        } else {
            return fetchRes.json().then(dbRes => { // Get response json and check it

                if (dbRes["content"][keyToCheck.split("_")[0]] === keyToCheck.split("_")[1]) {
                    return true
                } else {
                    return false
                }

            })
        }

    }).catch(error => {
        console.log("ERROR: Failed to check authorization: " + error)
        return false
    })
}

module.exports = {checkAuthorization}