import { update as Update } from "../../other/update.js"

export class spotifyUpdate extends plugin {
  constructor() {
    super({
      name: "[Spotify插件]更新插件",
      event: "message",
      priority: 1000,
      rule: [
        {
          reg: "^#*(s|S)(p|P)(otify)?(插件)?(强制)?更新$",
          fnc: "update"
        }
      ]
    })
  }

  async update(e = this.e) {
    if (!e.isMaster) return
    e.isMaster = true
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新spotify-plugin`
    const up = new Update(e)
    up.e = e
    return up.update()
  }
}
