window.onload = function() {
    if (navigator.userAgent.includes("Firefox")) {
        document.getElementById('resultfeed').value += `\nClipboard buttons only work on Firefox >127.`
    }

    // Event listeners can only be added after the page is loaded
    document.getElementById("actiondropdown").addEventListener("change", function() {
        if (document.getElementById("actiondropdown").value === "POST") {
            document.getElementById("randomizationtoggle").disabled = false
            document.getElementById("valuefield").disabled = false
        } else if (document.getElementById("actiondropdown").value === "DELETE") {
            document.getElementById("randomizationtoggle").disabled = true
            document.getElementById("randomizationtoggle").checked = false
            randomUrlTick()
            document.getElementById("valuefield").disabled = true
        } else {
            console.error("UI Code Error: Action dropdown event listener function reached impossible state")
        }
    })
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

// function buttonCopyResult() {
//     navigator.clipboard.writeText(`${document.location.href}${document.getElementById("urlfield").value}`)
// }

function buttonFillFromClipboard() {
    navigator.clipboard.readText().then(res => {
        document.getElementById("valuefield").value = res;
    })
}

// Changes the buttons text to OK for 500ms for action feedback
// "internal" in this context just means not called from the page
function internalButtonConfirmation(element) {
    let normalValue = document.getElementById(element).innerHTML
    document.getElementById(element).innerHTML = "Ok"
    setTimeout(function() {
        document.getElementById(element).innerHTML = normalValue
    }, 500)
}

function buttonCopyUrl() {
    navigator.clipboard.writeText(`this doesn't work rn lol`)
    internalButtonConfirmation("buttonCopyUrl")
}

function buttonClearLog() {
    document.getElementById("resultfeed").value = ""
    internalButtonConfirmation("buttonClearLog")
}

function submitData() {
    fetch(`http://nrdesktop:8081/etyd${document.getElementById("targetfield").value}`, {
        method: document.getElementById("actiondropdown").value,
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