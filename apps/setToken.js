import plugin from '../../../lib/plugins/plugin.js'
import setting from '../model/setting.js'
import fs from 'node:fs'
import { pluginRoot } from '../model/path.js'

export class setToken extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]密钥类配置设置",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?设置(cid|cse|atk)",
                    fnc: "setting"
                }
            ]
        })
        this.jsonPath = `${pluginRoot}/data/userData/userData.json`
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
            if (!key === "atk") {
                setting.setConfig("config", replacedKey, matchedMsg)
            } else {
                const data = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'))
                data.push({ userId: this.e.user_id, token: matchedMsg })
                fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), 'utf8')
            }
            await this.e.reply(`[Spotify插件]设置${replacedKey}成功!`, true)
        }
    }
}
