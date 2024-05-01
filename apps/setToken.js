import plugin from '../../../lib/plugins/plugin.js'
import setting from '../model/setting.js'

export class spotifyUpdate extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]配置设置",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?设置(cid|cse|atk)",
                    fnc: "setting"
                }
            ]
        })
    }

    async setting() {
        if (!this.e.isMaster) return false
        const test = /^#?(s|S)(p|P)(otify)?设置(cid|cse|atk)(.*)/
        const match = this.e.msg.match(test)
        if (match) {
            const key = match[4]
            const keyReplace = {
                "cid": "clientID",
                "cse": "clientSecret",
                "atk": "accessToken"
            }
            const replacedKey = keyReplace[key]
            const matchedMsg = match[5]
            const result = {}
            result[replacedKey] = matchedMsg
            setting.setConfig("config", result)
            await this.e.reply(`[Spotify插件]设置${replacedKey}成功!`, true)
        }
    }
}
