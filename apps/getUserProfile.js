import plugin from "../../../lib/plugins/plugin.js"
import setting from "../model/setting.js"
import fetch from "node-fetch"
import fs from "node:fs"
import { pluginRoot } from "../model/path.js"

export class getSpotifyUserStatus extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]获取个人信息",
            dsc: "获取Spotify个人信息",
            event: "message",
            priority: 10,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?个人信息$",
                    fnc: "getSpotifyUserStatus"
                }
            ]
        })
        this.jsonPath = `${pluginRoot}/data/userData/userData.json`
    }
    async getSpotifyUserStatus() {
        try {
            let data = JSON.parse(fs.readFileSync(this.jsonPath, "utf8"))
            let token
            for (let item of data) {
                if (item.userId === this.e.user_id) {
                    token = item.token
                    break
                }
            }
            const res = await fetch(`https://api.spotify.com/v1/me`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            })
            const userDetail = await res.json()
            const userDisplayName = userDetail.display_name
            const userRegion = userDetail.country
            const userAvatar = userDetail.images[1].url
            const replyMsg = [
                "头像:", segment.image(userAvatar),
                "\n昵称:", userDisplayName,
                "\n地区:", userRegion,
            ]
            await this.e.reply(replyMsg, true)
        } catch (error) {
            logger.error(error)
            await this.e.reply("[Spotify插件]获取您的个人信息时发生了错误,可能是授权令牌(AccessToken)过期,请发送【#sp登录】重新获取!")
        }
    }
}
