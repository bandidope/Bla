let handler = async (m, { conn }) => {
  const emoji = '⚠️'
  const rwait = '⏳'
  const done = '✅'
  const error = '❌'

  const q = m.quoted || m
  const mime = q?.msg?.mimetype || q?.mimetype || ''

  if (!/webp/.test(mime)) {
    return conn.reply(m.chat, `${emoji} Responde a un sticker para convertirlo en imagen.`, m)
  }

  try {
    if (m.react) await m.react(rwait)

    const buffer = await q.download?.()
    if (!buffer) throw new Error('No se pudo descargar el sticker')

    const { webp2png } = await import('../lib/webp2mp4.js').catch(() => ({}))

    let imageBuffer = buffer

    // intento de conversión segura
    if (webp2png) {
      imageBuffer = await webp2png(buffer)
    }

    await conn.sendMessage(
      m.chat,
      { image: imageBuffer, caption: '🖼️ Aquí tienes tu imagen convertida.' },
      { quoted: m }
    )

    if (m.react) await m.react(done)

  } catch (err) {
    console.error(err)
    if (m.react) await m.react(error)

    conn.reply(
      m.chat,
      `${emoji} Error al convertir el sticker:\n${err.message}`,
      m
    )
  }
}

handler.help = ['toimg']
handler.tags = ['herramientas']
handler.command = ['toimg']

export default handler