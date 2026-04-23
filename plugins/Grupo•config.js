let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

    if (!isAdmin) return m.reply('❌ Solo administradores pueden usar este comando.')

    const opciones = {
      open: 'not_announcement',
      abrir: 'not_announcement',
      desbloquear: 'not_announcement',

      close: 'announcement',
      cerrar: 'announcement',
      bloquear: 'announcement',
    }

    const accion = opciones[(args[0] || '').toLowerCase()]

    if (!accion) {
      return conn.sendMessage(m.chat, {
        text:
          `⚙️ *Configurar grupo*\n\n` +
          `📌 Uso correcto:\n` +
          `• ${usedPrefix + command} abrir\n` +
          `• ${usedPrefix + command} cerrar\n\n` +
          `🔓 abrir = todos pueden escribir\n` +
          `🔒 cerrar = solo admins pueden escribir`,
      }, { quoted: m })
    }

    await conn.groupSettingUpdate(m.chat, accion)

    if (accion === 'not_announcement') {
      await m.reply('🔓 *Grupo abierto*\n\nAhora todos pueden enviar mensajes.')
    } else {
      await m.reply('🔒 *Grupo cerrado*\n\nSolo los administradores pueden escribir.')
    }

  } catch (err) {
    console.error(err)
    m.reply('❌ Error al cambiar la configuración del grupo.')
  }
}

handler.help = ['group <abrir/cerrar>', 'grupo <abrir/cerrar>']
handler.tags = ['grupo']
handler.command = ['group', 'grupo']
handler.admin = true
handler.botAdmin = true

export default handler