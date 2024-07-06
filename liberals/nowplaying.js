const { globalConfig } = require("../index.js")

async function queryLastfm() {
    return await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&method=user.getrecenttracks&limit=1&api_key=${globalConfig.nowplaying.lastfm.apiKey}&user=${globalConfig.nowplaying.lastfm.target}`).then(response => response.json()).then(response => {
        if (response["recenttracks"] == undefined) {
            return 1
        } else {
            if (response.recenttracks.track[0]["@attr"] == undefined) {
                return 1
            } else {
                return {
                    "json": {
                        "songName": response.recenttracks.track[0].name,
                        "artistName": response.recenttracks.track[0].artist["#text"],
                        "albumName": response.recenttracks.track[0].album["#text"],
                        "artUrl": response.recenttracks.track[0].image[3]["#text"],
                        "link": response.recenttracks.track[0].url
                    },
                    "html": `<img src="${response.recenttracks.track[0].image[3]["#text"]}" alt="Album Art" style="width: 10em;"> <div class="textlist"> <p>I'm listening to</p> <h3>${response.recenttracks.track[0].name} by ${response.recenttracks.track[0].artist["#text"]}</h3> <p>from ${response.recenttracks.track[0].album["#text"]}</p> <a href="${response.recenttracks.track[0].url}" class="noindent">View on Last.fm</a></div>`
                }
            }
        }
    })
}

module.exports = { queryLastfm }