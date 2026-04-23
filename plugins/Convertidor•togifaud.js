let handler = async (m, { conn }) => {
  try {
    const q = m.quoted
    if (!q) {
      return conn.sendMessage(
        m.chat,
        { text: '🚩 Responde a un *video*.' },
        { quoted: m }
      )
    }

    const mime = q?.msg?.mimetype || q?.mimetype || ''

    if (!mime.includes('video')) {
      return conn.sendMessage(
        m.chat,
        { text: '🚩 Responde a un *video* válido.' },
        { quoted: m }
      )
    }

    if (typeof m.react === 'function') await m.react('⌛')

    const media = await q.download?.()
    if (!media) throw new Error('No se pudo descargar el video')

    await conn.sendMessage(
      m.chat,
      {
        video: media,
        gifPlayback: true,
        caption: '🐢 Aquí está tu GIF convertido.',
        mimetype: 'video/mp4'
      },
      { quoted: m }
    )

    if (typeof m.react === 'function') await m.react('✅')

  } catch (err) {
    console.error(err)

    await conn.sendMessage(
      m.chat,
      { text: `❌ Error al procesar el video:\n${err.message}` },
      { quoted: m }
    )
  }
}

handler.help = ['togifaud']
handler.tags = ['transformador']
handler.command = ['togifaud']

export default handler