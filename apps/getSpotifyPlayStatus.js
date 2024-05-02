import plugin from "../../../lib/plugins/plugin.js"
import setting from "../model/setting.js"
import fetch from "node-fetch"
import fs from "node:fs"
import { pluginRoot } from "../model/path.js"

export class getSpotifyPlayStatus extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]歌曲播放状态",
            dsc: "获取Spotify个人歌曲播放状态",
            event: "message",
            priority: 10,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?(歌曲|播放)(播放)?状态$",
                    fnc: "getSpotifyPlayStatus"
                }
            ]
        })
        this.jsonPath = `${pluginRoot}/data/userData/userData.json`
    }
    async getSpotifyPlayStatus() {
        try {
            let data = JSON.parse(fs.readFileSync(this.jsonPath, "utf8"))
            let token
            for (let item of data) {
                if (item.userId === this.e.user_id) {
                    token = item.token
                    break
                }
            }
            const res = await fetch(`https://api.spotify.com/v1/me/player`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            })
            const playList = await res.json()
            /*const json = JSON.stringify(playList, null, 2)
            console.log(playList)*/
            const playingMs = playList.progress_ms
            const minutes = Math.floor(playingMs / (1000 * 60))
            const seconds = ((playingMs % (1000 * 60)) / 1000).toFixed(0)
            const isPlaying = playList.is_playing ? "是" : "否"
            const replyMsg = [
                "歌曲专辑:", segment.image(JSON.stringify(playList.item.album.images[0].url)) + "\n",
                "歌曲名称:", "《" + playList.item.name + "》" + "\n",
                "歌曲来自:", playList.item.artists.map(artist => artist.name).join(', ') + "\n",
                "正在播放时长:", minutes + "分" + seconds + "秒" + "\n",
                "是否正在播放:", isPlaying + "\n",
                "播放设备名称:", playList.device.name + "\n",
                "播放设备类型:", playList.device.type
            ]
            await this.e.reply(replyMsg, true)
        } catch (error) {
            logger.error(error)
            await this.e.reply("[Spotify插件]获取歌曲播放状态时发生了错误,可能是没有正在播放的歌曲或授权令牌(AccessToken)过期,请发送【#sp登录】重新获取!")
        }
    }
}
