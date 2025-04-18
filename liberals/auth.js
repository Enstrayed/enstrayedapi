import { globalConfig, db } from "../index.js"

/**
 * (DEPRECATED) Checks if a token exists in the sessions file (authentication) and if it has the correct permissions (authorization)
 * @param {string} token Token as received by client
 * @param {string} scope Scope the token will need to have in order to succeed
 * @returns {boolean} True for successful authentication and authorization, false if either fail
 */
async function checkToken(token,scope) {
    return await db`select s.token, s.scopes, s.expires, u.username from sessions s join users u on s.owner = u.id where s.token = ${token}`.then(response => {
        if (response.length === 0) {
            return false
        } else if (response[0]?.scopes.split(",").includes(scope)) {
            return true
        } else {
            return false
        }
    })
}

/**
 * New function to check if a token exists in the sessions table (authentication) and if it has the desired scope (authorization)
 * @param {string} token Token as received by client
 * @param {string} scope Desired scope for action
 * @typedef {Object} Object containing the result and the username of the token owner
 * @property {boolean} result Boolean result of if the check passed
 * @property {string} owner Username of the token owner
 */

async function checkTokenNew(token,scope) {
    return await db`select s.token, s.scopes, s.expires, u.username from sessions s join users u on s.owner = u.id where s.token = ${token}`.then(response => {
        if (response.length === 0) {
            return { result: false, owner: response[0]?.username}
        } else if (response[0]?.scopes.split(",").includes(scope)) {
            return { result: true, owner: response[0]?.username}
        } else {
            return { result: false, owner: response[0]?.username}
        }
    })
}

export {checkToken, checkTokenNew}