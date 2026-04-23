//Código creado x The Carlos 👑 

import fs from 'fs/promises'

const file = './src/database/characters.json'

const load = async () => {
  try {
    let data = await fs.readFile(file, 'utf8')
    return JSON.parse(data || '[]')
  } catch {
    return []
  }
}

const save = async (data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, 'solo el owner puede usar esto', m)

  try {
    let chars = await load()

    if (!chars.length) {
      return conn.reply(m.chat, 'no hay waifus registradas', m)
    }

    for (let c of chars) {
      c.user = null
    }

    await save(chars)

    return conn.reply(m.chat, '✔ waifus reiniciadas, ahora nadie las tiene', m)

  } catch (e) {
    return conn.reply(m.chat, 'error al resetear waifus', m)
  }
}

handler.help = ['resetwaifus']
handler.tags = ['gacha']
handler.command = ['resetwaifus']
handler.group = true
handler.owner = true

export default handler