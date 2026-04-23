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

let handler = async (m, { conn }) => {
  try {
    let chars = await load()

    if (!chars || !chars.length) {
      return conn.reply(m.chat, 'no hay waifus registradas', m)
    }

    let text = '📜 lista de waifus\n\n'

    for (let c of chars) {
      text += `nombre: ${c.name}\n`
      text += `id: ${c.id}\n`
      text += `dueño: ${c.user ? c.user.split('@')[0] : 'nadie'}\n\n`
    }

    return conn.reply(m.chat, text.trim(), m)

  } catch (e) {
    return conn.reply(m.chat, 'error al leer la base de datos', m)
  }
}

handler.help = ['listawaifus']
handler.tags = ['gacha']
handler.command = ['listawaifus']
handler.group = true

export default handler