import { promisify } from "util"
import { exec as execCb } from "child_process"
import { pluginRoot } from "../model/path.js"
import setting from "../model/setting.js"
import fs from "node:fs"
import { URL } from "url"

const exec = promisify(execCb)
const _path = `${pluginRoot}/resources/authorization/`

export class runScript extends plugin {
    constructor() {
        super({
            name: "[Spotify插件]授权脚本类方法",
            dsc: "授权脚本类方法",
            event: "message",
            priority: 10,
            rule: [
                {
                    reg: "^#?(s|S)(p|P)(otify)?安装授权脚本$",
                    fnc: "installScript"
                },
                {
                    reg: "^#?(s|S)(p|P)(otify)?(开启|关闭)授权脚本$",
                    fnc: "runScript"
                },
                {
                    reg: "^#?(s|S)(p|P)(otify)?登(录|陆)(链接|连接)?$",
                    fnc: "scriptUrl"
                }
            ]
        })
    }
    get appconfig() { return setting.getConfig("config") }

    async installScript() {
        if (!this.e.isMaster) return false
        await this.e.reply("[Spotify插件]授权脚本开始安装,请等待...", true)
        try {
            const { stdout, stderr } = await exec(`cd ${_path} && npm install -P`)
            logger.debug(`标准输出: ${stdout}`)
            if (stderr) {
                logger.error(`标准错误: ${stderr}`)
            }
            await this.e.reply("[Spotify插件]授权脚本安装完成", true)
        } catch (error) {
            logger.error(`标准输入错误: ${error}`)
        }
    }
    async runScript() {
        if (!this.e.isMaster) return false
        if (!fs.existsSync(`${_path}node_modules`)) return this.e.reply(`[Spotify插件]您还未执行【#sp安装授权脚本】,无法运行!`, true)
        if (this.appconfig["clientID"] == null || this.appconfig["clientSecret"] == null || this.appconfig["redirectUrl"] == null) return this.e.reply("[Spotify插件]有尚未配置的内容,无法运行授权脚本!", true)
        const regex = /^#?(s|S)(p|P)(otify)?(开启|关闭)授权脚本$/
        const match = this.e.msg.match(regex)
        if (match) {
            const result = match[4]
            let action = match[4]
            action = (action === "开启") ? "start" : "stop"
            exec(`cd ${_path} && pm2 ${action} app.js`, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`标准输出错误: ${error}`)
                    return
                }
                logger.debug(`标准输出: ${stdout}`)
                logger.error(`标准错误: ${stderr}`)
                const urlString = this.appconfig["redirectUrl"]
                const parsedUrl = new URL(urlString)
                const baseUrl = parsedUrl.protocol + '//' + parsedUrl.hostname + ':' + parsedUrl.port
                let message = `[Spotify插件]授权脚本已${result}!`
                message += result === '开启' ? `\n登录地址: ${baseUrl}` : ''
                this.e.reply(message, true)
            })
        }
    }
    async scriptUrl() {
        const reurl = this.appconfig["redirectUrl"]
        if (reurl == null) return this.e.reply("[Spotify插件]有尚未配置的内容,无法获取登录地址!", true)
       await this.e.reply(`登录地址: ${reurl}\n请登录后复制地址栏access_token=后面的"全部"内容\n使用【#sp设置atk<获取的AccessToken>】设置授权令牌\n授权令牌有效时限1小时!`)
    }
}
