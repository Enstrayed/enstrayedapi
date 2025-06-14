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

function getHumanReadableUserAgent(useragent) {
    let formattedua = useragent.replace(/[\/()]/g," ").split(" ")
    let os = ""
    let browser = ""

    if (formattedua.includes("Windows")) {
        os += "Windows"
    } else if (formattedua.includes("Macintosh")) {
        os += "macOS"
    } else if (formattedua.includes("iPhone")) {
        os += "iOS"
    } else if (formattedua.includes("Android")) {
        os += "Android"
    } else if (formattedua.includes("Linux")) {
        os += "Linux"
    } else {
        os += "Other"
    }

    if (formattedua.includes("Firefox")) {
        browser += "Firefox"
    } else if (formattedua.includes("Chrome")) {
        browser += "Chrome"
    } else if (formattedua.includes("Safari")) {
        browser += "Safari"
    } else {
        browser += "Other"
    }

    return `${os} ${browser}`
}

export { randomStringBase16, randomStringBase62, getHumanReadableUserAgent }