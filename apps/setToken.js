import plugin from "../../../lib/plugins/plugin.js"
import setting from "../model/setting.js"
import fs from "node:fs"
import { pluginRoot } from "../model/path.js"

export class setToken extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]密钥类配置设置",
            event: "message",
            priority: 100,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?设置(cid|cse|reurl)",
                    fnc: "configSetting"
                },
                {
                    reg: "^#?(s|S)(p|P)(otify)?设置atk",
                    fnc: "tokenSetting"
                }
            ]
        })
        this.jsonPath = `${pluginRoot}/data/userData/userData.json`
    }

    async configSetting() {
        if (!this.e.isMaster) return false
        const test = /^#?(s|S)(p|P)(otify)?设置(cid|cse)(.*)/
        const match = this.e.msg.match(test)
        if (match) {
            const key = match[4]
            const keyReplace = {
                "cid": "clientID",
                "cse": "clientSecret",
                "reurl": "redirectUrl"
            }
            const replacedKey = keyReplace[key]
            const matchedMsg = match[5]
            setting.setConfig("config", replacedKey, matchedMsg)
            await this.e.reply(`[Spotify插件]设置${replacedKey}成功!`, true)
        }
    }
    async tokenSetting() {
        const test = /^#?(s|S)(p|P)(otify)?设置atk(.*)/
        const match = this.e.msg.match(test)
        if (match) {
            const matchedMsg = match[4]
            let data = []
            if (fs.existsSync(this.jsonPath)) {
                data = JSON.parse(fs.readFileSync(this.jsonPath, "utf8"))
            }
            let found = false
            for (let item of data) {
                if (item.userId === this.e.user_id) {
                    item.token = matchedMsg
                    found = true
                    break
                }
            }
            if (!found) {
                data.push({ userId: this.e.user_id, token: matchedMsg })
            }
            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2), "utf8")
            await this.e.reply(`[Spotify插件]设置个人Access-Token成功!`, true)
        }
    }
}
