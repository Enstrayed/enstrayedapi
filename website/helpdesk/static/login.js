var globalLoggedIn = false

function useGlobalDialog(title,body) {
    document.getElementById("globalDialogHeader").innerText = title
    document.getElementById("globalDialogText").innerText = body
    document.getElementById("globalDialog").showModal()
}

document.addEventListener("DOMContentLoaded", function () {
    fetch(`/api/auth/whoami`).then(fetchRes => {
        fetchRes.json().then(jsonRes => {
            if (jsonRes.loggedIn) {
                globalLoggedIn = true
                document.getElementById("loginButton").innerText = `Logout ${jsonRes.username}`

                if (jsonRes.scopes.includes("helpdesk")) {
                    let targetElements = document.getElementsByClassName("helpdeskScopeOnly")
                    // cant do a for loop since targetElements dynamically updates, this is easier but stupid
                    while (targetElements.length > 0) {
                        targetElements[0].classList.toggle("helpdeskScopeOnly")
                    }
                }
            } else {
                globalLoggedIn = false
                document.getElementById("loginButton").innerText = `Login`
            }
        })
    })
})

function loginFunction() {
    if (globalLoggedIn === true) {
        fetch(`/api/auth/logout`).then(fetchRes => {
            if (fetchRes.status === 200) {
                location.reload()
            } else {
                fetchRes.text().then(textRes => {
                    useGlobalDialog("Error", `An error occurred during logout: ${textRes}`)
                })
            }
        })
    } else {
        let loginWindow = window.open(`/api/auth/login?state=close`, `_blank`)
        let loginWatcher = setInterval(() => {
            if (loginWindow.closed) {
                fetch(`/api/auth/whoami`).then(fetchRes => {
                    fetchRes.json().then(jsonRes => {
                        if (jsonRes.loggedIn) {
                            globalLoggedIn = true
                            document.getElementById("loginButton").innerText = `Logout ${jsonRes.username}`

                            if (jsonRes.scopes.includes("helpdesk")) {
                                let targetElements = document.getElementsByClassName("helpdeskScopeOnly")
                                while (targetElements.length > 0) {
                                    targetElements[0].classList.toggle("helpdeskScopeOnly")
                                }
                            }
                        } else {
                            useGlobalDialog("Error", `You are not logged in. Please try logging in again.`)
                        }
                        clearInterval(loginWatcher);
                    })
                })

            }
        }, 500);
    }
}