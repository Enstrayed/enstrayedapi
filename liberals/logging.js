/**
 * Logs various details about the request (IP, Token, Method, Path, etc) to the console for later review
 * @param {object} response Parent response object
 * @param {object} request Parent request object
 * @param {number} code Status code to log, should be same as sent to client
 * @param {string} extra Optional extra details to add to log, ideal for caught errors
 */
function logRequest(response,request,code,extra) {
    if (extra) {
        actualExtra = "; Extra: "+extra
    } else {
        actualExtra = ""
    }
    if (request.get("Authorization")) {
        actualAuth = `(${request.get("Authorization")})`
    } else {
        actualAuth = ""
    }
    //           Client IP if connecting over Cloudflare, else IP as received by Express
    //           |                                      /        Token used (if provided)
    //           |                                     /         |            Request Method    Request Path             Status code returned to client provided by function call   
    //           V                                    V          V            V                 V                        V      Extra information if provided by function call
    console.log(`${request.get("cf-connecting-ip") ?? request.ip}${actualAuth}${request.method} ${request.path} returned ${code}${actualExtra}`)
}

module.exports = { logRequest }