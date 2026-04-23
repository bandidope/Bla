import fs from 'fs/promises'

const file = './src/database/characters.json'
let cooldown = {}

const loadChars = async () => {
  try {
    let data = await fs.readFile(file, 'utf8')
    return JSON.parse(data || '[]')
  } catch {
    return []
  }
}

const saveChars = async (data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn }) => {
  let user = m.sender
  let now = Date.now()

  if (cooldown[user] && cooldown[user] > now) {
    let time = Math.ceil((cooldown[user] - now) / 1000)
    let min = Math.floor(time / 60)
    let sec = time % 60
    return conn.reply(m.chat, `⏳ espera ${min}m ${sec}s para volver a usar esto`, m)
  }

  if (!m.quoted || !m.quoted.text) {
    return conn.reply(m.chat, '❗ responde a un personaje válido', m)
  }

  try {
    let chars = await loadChars()

    let id = (m.quoted.text.match(/✦ ID: \*(.+?)\*/) || [])[1]
    if (!id) return conn.reply(m.chat, 'no se encontró el id del personaje', m)

    let char = chars.find(v => v.id === id)
    if (!char) return conn.reply(m.chat, 'ese personaje no existe', m)

    if (char.user && char.user !== user) {
      return conn.reply(
        m.chat,
        `ese ya lo tiene @${char.user.split('@')[0]}`,
        m,
        { mentions: [char.user] }
      )
    }

    char.user = user
    char.status = 'taken'

    await saveChars(chars)

    cooldown[user] = now + (30 * 60 * 1000)

    return conn.reply(m.chat, `✔️ reclamaste a ${char.name}`, m)

  } catch (e) {
    return conn.reply(m.chat, 'error al reclamar personaje', m)
  }
}

handler.help = ['claim']
handler.tags = ['gacha']
handler.command = ['c', 'claim', 'reclamar']
handler.group = true

export default handler