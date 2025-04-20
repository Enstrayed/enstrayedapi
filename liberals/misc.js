function randomStringBase16(length) {
    let characters = "0123456789abcdef"
    let remaining = length
    let returnstring = ""
    while (remaining > 0) {
        returnstring = returnstring + characters.charAt(Math.floor(Math.random() * characters.length))
        remaining = remaining - 1
    }  
    return returnstring
}

function randomStringBase62(length) {
    let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHJIJKLMNOPQRSTUVWXYZ"
    let remaining = length
    let returnstring = ""
    while (remaining > 0) {
        returnstring = returnstring + characters.charAt(Math.floor(Math.random() * characters.length))
        remaining = remaining - 1
    }  
    return returnstring
}

export { randomStringBase16, randomStringBase62 }