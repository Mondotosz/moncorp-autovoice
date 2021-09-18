const fs = require("fs");

//TODO create primary channels
//TODO save channels
//TODO manage channel owners

class VCManager {
  #_path;
  #_content = {
    "primary": [],
    "children": []
  }
  constructor(path = "vc.json") {
    this.#_path = path
    this.#load()
  }

  get PrimaryChannels() { return this.#_content.primary }

  #save() {
    try {
      fs.writeFileSync(this.#_path, JSON.stringify(this.#_content))
    } catch (err) {
      console.error(err)
    }
  }

  #load() {
    try {
      this.#_content = JSON.parse(fs.readFileSync(this.#_path, 'utf8'))
    } catch (err) {
      console.error(err)
      return false
    }
  }

  createPrimaryVoice(guild) {
    guild.channels.create('WIP ➕ New Session', {
      type: 'GUILD_VOICE'
    }).then(channel => {

      this.#_content.primary.push(channel.id)
      this.#save()
      return true
    })
  }

  deletePrimaryVoice(channel) {

  }

  createChildVoice(primary, user) {
    primary.guild.channels.create('WIP [General]', {
      type: 'GUILD_VOICE',
      parent: primary.parentId
    }).then(channel => {
      user.voice.setChannel(channel.id)
      this.#_content.children.push(channel.id)
      this.#save()
      return true
    })

  }

  deleteChildrenVoice(channel) {
    this.#_content.children.splice(this.#_content.children.indexOf(channel.id), 1)
    channel.delete("removing unused voice channel")
  }

  update(client) {
    //remove deleted channels from data
    let updatePersistance = false;
    this.#_content.primary.forEach(id => {
      if (client.channels.cache.get(id) == null) {
        this.#_content.primary.splice(this.#_content.primary.indexOf(id), 1)
        updatePersistance = true
      }
    })
    this.#_content.children.forEach(id => {
      if (client.channels.cache.get(id) == null) {
        this.#_content.children.splice(this.#_content.children.indexOf(id), 1)
        updatePersistance = true
      }
    })
    if (updatePersistance) this.#save()

    // Check if channels need to be created
    this.#_content.primary.forEach(id => {
      let primary = client.channels.cache.get(id)
      if (primary?.members.first() != null) {
        primary.members.every(member => {
          this.createChildVoice(primary, member)
        })
      }
    })
    //Check if channels need to be deleted
    this.#_content.children.forEach(id => {
      let children = client.channels.cache.get(id)
      if (children != null && children?.members.first() == null) {
        this.deleteChildrenVoice(children)
      }
    })


  }
}

module.exports = VCManager