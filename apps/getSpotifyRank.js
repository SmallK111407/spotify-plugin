import plugin from "../../../lib/plugins/plugin.js"
import setting from "../model/setting.js"
import fetch from "node-fetch"
import fs from "node:fs"
import { pluginRoot } from "../model/path.js"

export class getSpotifyRank extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]个人歌曲排行榜",
            dsc: "获取Spotify个人歌曲排行",
            event: "message",
            priority: 10,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?排行(榜)?$",
                    fnc: "getSpotifyRank"
                }
            ]
        })
        this.jsonPath = `${pluginRoot}/data/userData/userData.json`
    }
    get spotifyRankConfig() { return setting.getConfig("spotifyRank") }

    async fetchWebApi(endpoint, method, body) {
        let data = JSON.parse(fs.readFileSync(this.jsonPath, "utf8"))
        let token
        for (let item of data) {
            if (item.userId === this.e.user_id) {
                token = item.token
                break
            }
        }
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method,
            body: JSON.stringify(body)
        })
        return await res.json()
    }

    async getTopTracks() {
        // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
        return (await this.fetchWebApi(
            `v1/me/top/tracks?time_range=long_term&limit=${this.spotifyRankConfig["rankNumber"]}`, "GET"
        )).items
    }

    async getSpotifyRank() {
        if (!this.e.isMaster) return false
        try {
            const topTracks = await this.getTopTracks()
            const result = topTracks?.map(
                ({ name, artists }, index) =>
                    `${index + 1}.歌名:${name}\n来自:${artists.map(artist => artist.name).join(", ")}\n`
            )
            await this.e.reply(result.join("\n").trim())
        } catch (error) {
            logger.error(error)
            await this.e.reply("[Spotify插件]获取排行榜时发生了错误,可能是授权令牌(AccessToken)过期,请发送【#sp登录】重新获取!")
        }
    }
}
