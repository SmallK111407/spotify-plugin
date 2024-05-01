import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

export class getSpotifyRank extends plugin {
    constructor() {
        super({
            name: '[Spotify插件]个人歌曲排行榜',
            dsc: '获取Spotify个人歌曲排行',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#?(s|S)(p|P)(otify)?排行(榜)?$',
                    fnc: 'getSpotifyRank'
                }
            ]
        })
        this.appconfig = this.getConfig()
    }
    getConfig() { return setting.getConfig("config") }

    async getSpotifyRank() {
        if (!this.e.isMaster) return false
        const topTracks = await getTopTracks()
        try {
            const result = topTracks?.map(
                ({ name, artists }, index) =>
                    `${index + 1}.歌名:${name}\n来自:${artists.map(artist => artist.name).join(', ')}\n`
            )
            await this.e.reply(result.join('\n').trim())
        } catch { }
    }
}
async function fetchWebApi(endpoint, method, body) {
    const token = this.appconfig["accessToken"]
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method,
        body: JSON.stringify(body)
    })
    return await res.json()
}

async function getTopTracks() {
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return (await fetchWebApi(
        `v1/me/top/tracks?time_range=long_term&limit=5`, 'GET'
    )).items
}