import { globalConfig } from "../index.js"

const notPlayingAnythingPlaceholder = {
    "json": {
        "playing": false
    },
    "html": `<span>I'm not currently listening to anything.</span>`
}

/**
 * Queries LastFM for user set in config file and returns formatted result
 * @returns {object} Object containing response in JSON and HTML (as string)
 */
async function queryLastfm() {
    return await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&method=user.getrecenttracks&limit=1&api_key=${globalConfig.nowplaying.lastfm.apiKey}&user=${globalConfig.nowplaying.lastfm.target}`).then(response => response.json()).then(response => {
        if (response["recenttracks"] == undefined) {
            return notPlayingAnythingPlaceholder
        } else {
            if (response.recenttracks.track[0]["@attr"] == undefined) {
                return notPlayingAnythingPlaceholder
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
    }).catch(fetchError => {
        console.log("libnowplaying.js: Fetch failed! "+fetchError)
        return {}
    })
}

async function queryJellyfin() {
    return await fetch(`${globalConfig.nowplaying.jellyfin.host}/Sessions`, {
        headers: {
            "Authorization": `MediaBrowser Token=${globalConfig.nowplaying.jellyfin.apiKey}`
        }
    }).then(response => response.json()).then(response => {
        for (x in response) {
            if (response[x].UserName !== globalConfig.nowplaying.jellyfin.target) { break } // If session does not belong to target specified in config, skip
            if (!response[x].NowPlayingItem) { break } // If the NowPlayingItem object is not present, skip (session is not playing anything)
            if (response[x].NowPlayingItem.MediaType !== "Audio") { break } // If not playing 'audio', skip, this might change in the future

            return {
                "json": {
                    "songName": response[x].NowPlayingItem.Name,
                    "artistName": response[x].NowPlayingItem.Artists[0],
                    "albumName": response.recenttracks.track[0].album["#text"],
                    "artUrl": response.recenttracks.track[0].image[3]["#text"],
                    "link": response.recenttracks.track[0].url
                },
                "html": `<img src="${response.recenttracks.track[0].image[3]["#text"]}" alt="Album Art" style="width: 10em;"> <div class="textlist"> <p>I'm listening to</p> <h3>${response.recenttracks.track[0].name} by ${response.recenttracks.track[0].artist["#text"]}</h3> <p>from ${response.recenttracks.track[0].album["#text"]}</p> <a href="${response.recenttracks.track[0].url}" class="noindent">View on Last.fm</a></div>`
            }
        }
    })
}

export { queryLastfm }