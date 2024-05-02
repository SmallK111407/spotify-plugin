import { promisify } from 'util'
import { exec as execCb } from 'child_process'
import { pluginRoot } from '../model/path.js'

const exec = promisify(execCb)
const _path = `${pluginRoot}/resources/authorization/`

export class getSpotifyRank extends plugin {
    constructor() {
        super({
            name: '[Spotify插件]个人歌曲排行榜',
            dsc: '获取Spotify个人歌曲排行',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#?(s|S)(p|P)(otify)?安装授权脚本$',
                    fnc: 'getSpotifyRank'
                }
            ]
        })
    }
    async installScript() {
        if (!this.e.isMaster) return false
        try {
            const { stdout, stderr } = await exec(`cd ${_path} && npm install -P`)
            logger.debug(`标准输出: ${stdout}`)
            if (stderr) {
                logger.error(`标准错误: ${stderr}`)
            }
            await this.e.reply(`[Spotify插件]授权脚本依赖安装完成`)
        } catch (error) {
            logger.error(`标准输入错误: ${error}`)
        }
    }
}
