import fs from 'fs/promises'

const charsFile = './src/database/characters.json'
const haremFile = './src/database/harem.json'

let cd = {}

const loadChars = async () => {
  let data = await fs.readFile(charsFile, 'utf8').catch(() => '[]')
  return JSON.parse(data || '[]')
}

const saveChars = async (data) => {
  await fs.writeFile(charsFile, JSON.stringify(data, null, 2))
}

const loadHarem = async () => {
  let data = await fs.readFile(haremFile, 'utf8').catch(() => '[]')
  return JSON.parse(data || '[]')
}

const saveHarem = async (data) => {
  await fs.writeFile(haremFile, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn }) => {
  let user = m.sender
  let now = Date.now()

  if (cd[user] && cd[user] > now) {
    let t = Math.ceil((cd[user] - now) / 1000)
    let mnt = Math.floor(t / 60)
    let sec = t % 60
    return conn.sendMessage(m.chat, {
      text: `espera ${mnt}m ${sec}s para volver a usar esto`
    }, { quoted: m })
  }

  try {
    let chars = await loadChars()
    if (!chars.length) return conn.reply(m.chat, 'no hay personajes', m)

    let r = chars[Math.floor(Math.random() * chars.length)]
    if (!r) return conn.reply(m.chat, 'error al elegir personaje', m)

    let img = Array.isArray(r.img) ? r.img[Math.floor(Math.random() * r.img.length)] : r.img

    let harem = await loadHarem()
    let inHarem = harem.find(v => v.characterId === r.id)

    let status = r.user ? `reclamado por @${r.user.split('@')[0]}` : 'libre'

    let text =
`nombre: ${r.name}
genero: ${r.gender || 'n/a'}
valor: ${r.value || 'n/a'}
estado: ${status}
id: ${r.id}`

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: text
    }, { quoted: m })

    cd[user] = now + (15 * 60 * 1000)

  } catch (e) {
    return conn.reply(m.chat, 'error al sacar personaje', m)
  }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler