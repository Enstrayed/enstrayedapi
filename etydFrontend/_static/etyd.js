//Firefox check
window.onload = function() {
    document.getElementById('resultfeed').value = "hii :3"
    if (navigator.userAgent.includes("Firefox")) {
        document.getElementById('resultfeed').value += `\nClipboard functionality does not work on Firefox.`
        document.getElementById('clipboard1').disabled = true
        document.getElementById('clipboard2').disabled = true
    }
}

function makeRandomHex(amount) {
    const characters = "1234567890abcdef"
    let counter = 0
    let result = ""
    while (counter < amount) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
        counter += 1
    }
    return result
}

function randomUrlTick() {
    if (document.getElementById("randomizationtoggle").checked == true) {
        document.getElementById("targetfield").disabled = true
        document.getElementById("targetfield").value = makeRandomHex(6)
    } else {
        document.getElementById("targetfield").disabled = false
        document.getElementById("targetfield").value = null
    }
}

function buttonCopyResult() {
    navigator.clipboard.writeText(`${document.location.href}${document.getElementById("urlfield").value}`)
}

function buttonFillFromClipboard() {
    navigator.clipboard.readText().then(res => {
        document.getElementById("valuefield").value = res;
    })
}

function postData() {
    fetch("http://nrdesktop:8081/etydwrite", {
        method: "POST",
        mode: "cors",
        headers: {
            "Authorization": document.getElementById("authfield").value
        },
        body: JSON.stringify({
            "target": document.getElementById("targetfield").value,
            "value": document.getElementById("valuefield").value,
            "action": document.getElementById("actiondropdown").value,
            "random": document.getElementById("randomizationtoggle").checked
        })
    }).then(response => {
        document.getElementById("resultfeed").value += `\n${response.status} ${response.body}`
    }).catch(error => {
        document.getElementById("resultfeed").value += `\nError: ${error}`
    })
}

