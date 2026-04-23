let handler = async (m, { conn }) => {
  let who

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else if (m.quoted) {
    who = m.quoted.sender
  } else {
    who = m.sender
  }

  let name = conn.getName(who)
  let name2 = conn.getName(m.sender)

  m.react('👣')

  let str

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    str = `\`${name2}\` está chupando la pata de \`${name}\`. 😆🦶`
  } else if (m.quoted) {
    str = `\`${name2}\` está chupando la pata de \`${name}\`. 🥵🦶`
  } else {
    str = `\`${name2}\` está chupando patas por aquí 🥵.`
  }

  if (m.isGroup) {
    const videos = [
      'https://files.catbox.moe/zuwr3w.mp4',
      'https://files.catbox.moe/vkllyl.mp4',
      'https://files.catbox.moe/es3aji.mp4'
    ]

    const gif = videos[Math.floor(Math.random() * videos.length)]

    const mentions = who ? [who] : []

    await conn.sendMessage(
      m.chat,
      {
        video: { url: gif },
        gifPlayback: true,
        caption: str,
        mentions
      },
      { quoted: m }
    )
  }
}

handler.help = ['chuparpata @tag']
handler.tags = ['emox']
handler.command = ['chuparpata', 'chupaepatas']
handler.group = true

export default handler