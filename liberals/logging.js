/**
 * Logs various details about the request (IP, Token, Method, Path, etc) to the console for later review
 * @param {object} response Parent response object
 * @param {object} request Parent request object
 * @param {number} code Status code to log, should be same as sent to client
 * @param {string} extra Optional extra details to add to log, ideal for caught errors
 */
function logRequest(response,request,code,extra) {
    console.log(`${request.get("cf-connecting-ip") ?? request.ip} ${request.get("Authorization") ?? ""} ${request.method} ${request.path} returned ${code} ${extra ?? ""}`)
}

export { logRequest }