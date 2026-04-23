//Código creado x The Carlos <👑

import fs from 'fs/promises'

const file = './src/database/characters.json'
const cooldownFile = './src/database/waifu_cooldown.json'

const owner = '5217971282613@s.whatsapp.net'

const loadChars = async () => {
  let data = await fs.readFile(file, 'utf8').catch(() => '[]')
  return JSON.parse(data || '[]')
}

const saveChars = async (data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2))
}

const loadCd = async () => {
  let data = await fs.readFile(cooldownFile, 'utf8').catch(() => '{}')
  return JSON.parse(data || '{}')
}

const saveCd = async (data) => {
  await fs.writeFile(cooldownFile, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, args }) => {
  try {
    let user = m.sender
    let id = args[0]

    if (!id) return conn.reply(m.chat, 'tienes que poner el id de la waifu', m)

    let chars = await loadChars()
    let cds = await loadCd()

    let waifu = chars.find(v => v.id === id)
    if (!waifu) return conn.reply(m.chat, 'no existe esa waifu', m)

    let old = waifu.user

    if (old === owner) {
      return conn.reply(m.chat, 'no puedes robar waifus del owner', m)
    }

    if (global.db.data.users[old]?.antirobo > Date.now()) {
      return conn.reply(
        m.chat,
        `esa waifu está protegida hasta ${new Date(global.db.data.users[old].antirobo).toLocaleString()}`,
        m
      )
    }

    if (user !== owner) {
      let now = Date.now()
      let cd = cds[user] || { count: 0, reset: 0 }

      if (now > cd.reset) {
        cd.count = 0
        cd.reset = now + (10 * 60 * 1000)
      }

      if (cd.count >= 2) {
        let left = Math.ceil((cd.reset - now) / 60000)
        return conn.reply(m.chat, `ya robaste mucho, espera ${left} min`, m)
      }

      cd.count++
      cds[user] = cd
      await saveCd(cds)
    }

    waifu.user = user
    await saveChars(chars)

    await conn.reply(
      m.chat,
      `robaste a ${waifu.name} del usuario ${old ? old.split('@')[0] : 'nadie'}`,
      m
    )

    if (old && old !== user && old !== owner) {
      await conn.sendMessage(old, {
        text: `te robaron tu waifu ${waifu.name} (${waifu.id})`
      })
    }

  } catch (e) {
    return conn.reply(m.chat, 'error al robar waifu', m)
  }
}

handler.help = ['robarwaifu <id>']
handler.tags = ['gacha']
handler.command = ['robarwaifu']
handler.group = true

export default handler