import plugin from '../../../lib/plugins/plugin.js'
import setting from '../model/setting.js'

export class setConfig extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]功能类配置设置",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?设置(排行数量)",
                    fnc: "setting"
                }
            ]
        })
    }

    async setting() {
        if (!this.e.isMaster) return false
        const test = /^#?(s|S)(p|P)(otify)?设置(排行数量)(.*)/
        const match = this.e.msg.match(test)
        if (match) {
            const key = match[4]
            const keyReplace = {
                "排行数量": "rankNumber"
            }
            const replacedKey = keyReplace[key]
            const matchedMsg = match[5]
            const matchedMsgReplace = {
                "开启": "true",
                "关闭": "false"
            }
            const replacedMatchedMsg = matchedMsgReplace[matchedMsg]
            setting.setConfig('spotifyRank', replacedKey, replacedMatchedMsg)
            await this.e.reply(`[Spotify插件]设置${replacedKey}成功!`, true)
        }
    }
}
