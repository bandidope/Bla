import fs from 'fs/promises'

const file = './src/database/characters.json'

const load = async () => {
  let data = await fs.readFile(file, 'utf8').catch(() => '[]')
  return JSON.parse(data || '[]')
}

const save = async (data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, args, isOwner }) => {
  try {
    if (!isOwner) return conn.reply(m.chat, 'solo el owner puede usar esto', m)

    let id = args[0]
    if (!id) return conn.reply(m.chat, 'pon el id de la waifu', m)

    let chars = await load()

    let waifu = chars.find(v => v.id === id)
    if (!waifu) return conn.reply(m.chat, 'no existe esa waifu', m)

    let old = waifu.user

    waifu.user = m.sender
    await save(chars)

    await conn.reply(
      m.chat,
      `robaste a ${waifu.name} de ${old ? old.split('@')[0] : 'nadie'}`,
      m
    )

    if (old && old !== m.sender) {
      await conn.sendMessage(old, {
        text: `te quitaron tu waifu ${waifu.name}`
      })
    }

  } catch (e) {
    return conn.reply(m.chat, 'error al robar waifu', m)
  }
}

handler.help = ['robawaifu <id>']
handler.tags = ['gacha']
handler.command = ['robawaifu']
handler.group = true

export default handler