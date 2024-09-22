import { globalConfig } from "../index.js"

/**
 * Checks if a token exists in the sessions file (authentication) and if it has the correct permissions (authorization)
 * @param {string} token Token as received by client
 * @param {string} scope Scope the token will need to have in order to succeed
 * @returns True for successful authentication and authorization, false if either fail
 */
async function checkToken(token,scope) {
    return await fetch(`${globalConfig.couchdbHost}/auth/sessions`).then(fetchRes => {

        return fetchRes.json().then(dbRes => { 

            if (dbRes.sessions[token] == undefined) { // If the token is not on the sessions list then reject
                return false
            } else if (dbRes.sessions[token].scopes.includes(scope)) { // If the token is on the seesions list and includes the scope then accept
                return true
            } else { // Otherwise reject
                return false
            }

        })

    }).catch(error => {
        console.log(`ERROR: auth.js: Fetch failed: ${error}`)
        return false
    })
}

export {checkToken}